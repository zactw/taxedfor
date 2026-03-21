import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

// ─── Rate Limiter (in-memory, per-IP) ────────────────────────────────────────
// Simple sliding-window rate limiter: 10 requests per 60 seconds per IP.
// For production at scale, replace with Redis-backed solution (e.g. @upstash/ratelimit).

const MAX_REQUESTS = 10;
const WINDOW_MS = 60_000; // 1 minute

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.windowStart >= WINDOW_MS) {
    // New window
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt: now + WINDOW_MS };
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: entry.windowStart + WINDOW_MS };
  }

  entry.count++;
  return { allowed: true, remaining: MAX_REQUESTS - entry.count, resetAt: entry.windowStart + WINDOW_MS };
}

// Periodically clean up stale entries to prevent unbounded memory growth
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now - entry.windowStart >= WINDOW_MS * 2) {
      rateLimitMap.delete(key);
    }
  }
}, WINDOW_MS * 5);

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

// Magic byte signatures for file type validation (defense against MIME spoofing)
const FILE_SIGNATURES: Array<{ mime: string; signature: number[] }> = [
  { mime: "image/jpeg", signature: [0xff, 0xd8, 0xff] },
  { mime: "image/png", signature: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "image/webp", signature: [0x52, 0x49, 0x46, 0x46] }, // RIFF (WebP)
  { mime: "image/gif", signature: [0x47, 0x49, 0x46] }, // GIF
  { mime: "application/pdf", signature: [0x25, 0x50, 0x44, 0x46] }, // %PDF
];

function validateFileSignature(buffer: Buffer, declaredMime: string): boolean {
  for (const { mime, signature } of FILE_SIGNATURES) {
    if (mime !== declaredMime) continue;
    // Special case: WebP has "RIFF" at 0 and "WEBP" at offset 8
    if (mime === "image/webp") {
      if (buffer.length < 12) return false;
      const riff = signature.every((b, i) => buffer[i] === b);
      const webp = [0x57, 0x45, 0x42, 0x50].every((b, i) => buffer[8 + i] === b);
      return riff && webp;
    }
    if (buffer.length < signature.length) return false;
    return signature.every((b, i) => buffer[i] === b);
  }
  return false;
}

// ─── Anthropic Client ─────────────────────────────────────────────────────────

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a tax document analyzer. Extract specific fields from W2 forms and return ONLY valid JSON with no additional text or markdown.`;

const USER_PROMPT = `Extract these fields from this W2 form:
- Box 2: Federal income tax withheld
- Box 4: Social Security tax withheld
- Box 6: Medicare tax withheld
- Box 17: State income tax withheld
- Box 16: State wages, tips, etc.
- Box 15: State abbreviation (2-letter code)

Return ONLY this JSON (no markdown, no explanation):
{ "federal": <number>, "socialSecurity": <number>, "medicare": <number>, "stateTax": <number>, "stateWages": <number>, "state": "<2-letter state code or empty string>" }

Use 0 for any field not found. All monetary values should be plain numbers (no $ or commas).`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function imageToBase64(buffer: Buffer, mimeType: string): Promise<{ base64: string; mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif" }> {
  return {
    base64: buffer.toString("base64"),
    mediaType: mimeType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
  };
}

// PDF handling is done natively via the Claude document API — no conversion needed.

function getClientIp(req: NextRequest): string {
  // Prefer forwarded header (set by Vercel / proxies), fall back to a placeholder
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Rate limiting
  const ip = getClientIp(req);
  const { allowed, remaining, resetAt } = checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait before trying again." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
          "X-RateLimit-Limit": String(MAX_REQUESTS),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
        },
      }
    );
  }

  try {
    // 2. Parse form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    // 3. File size validation (DoS protection)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File too large. Maximum allowed size is ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB.` },
        { status: 413 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "File is empty." }, { status: 400 });
    }

    // 4. MIME type validation (server-side)
    const mimeType = file.type;
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload JPG, PNG, WebP, or PDF." },
        { status: 400 }
      );
    }

    // 5. Read file into buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 6. Magic byte validation (prevents MIME type spoofing)
    if (!validateFileSignature(buffer, mimeType)) {
      return NextResponse.json(
        { error: "File content does not match the declared type. Please upload a valid image or PDF." },
        { status: 400 }
      );
    }

    // 7. Build content for Anthropic API
    // PDFs are passed natively as documents; images are passed as base64 image blocks.
    let messageContent: Anthropic.MessageParam["content"];

    if (mimeType === "application/pdf") {
      // Claude supports PDFs natively — no conversion, no native binaries required.
      messageContent = [
        {
          type: "document",
          source: {
            type: "base64",
            media_type: "application/pdf",
            data: buffer.toString("base64"),
          },
        } as Anthropic.DocumentBlockParam,
        { type: "text", text: USER_PROMPT },
      ];
    } else {
      const imageData = await imageToBase64(buffer, mimeType);
      messageContent = [
        {
          type: "image",
          source: {
            type: "base64",
            media_type: imageData.mediaType,
            data: imageData.base64,
          },
        },
        { type: "text", text: USER_PROMPT },
      ];
    }

    // 8. Call Anthropic API
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: messageContent }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    // 9. Parse and validate JSON response
    let parsed: {
      federal: unknown;
      socialSecurity: unknown;
      medicare: unknown;
      stateTax: unknown;
      stateWages: unknown;
      state: unknown;
    };

    try {
      const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      // Don't log the actual Claude response (may contain PII from the W2)
      console.error("Failed to parse AI response as JSON");
      return NextResponse.json(
        { error: "Failed to extract tax data from document. Please ensure it is a clear W-2 image." },
        { status: 422 }
      );
    }

    // 10. Sanitize and validate numeric outputs with reasonable bounds
    //     Max plausible annual withholding per field: $999,999
    const MAX_DOLLARS = 999_999;

    function sanitizeDollar(val: unknown): number {
      const n = Number(val);
      if (!isFinite(n) || isNaN(n)) return 0;
      return Math.max(0, Math.min(n, MAX_DOLLARS));
    }

    // State code: only allow 2 uppercase alpha characters
    const rawState = String(parsed.state ?? "").trim().toUpperCase();
    const state = /^[A-Z]{2}$/.test(rawState) ? rawState : "";

    const result = {
      federal: sanitizeDollar(parsed.federal),
      socialSecurity: sanitizeDollar(parsed.socialSecurity),
      medicare: sanitizeDollar(parsed.medicare),
      stateTax: sanitizeDollar(parsed.stateTax),
      stateWages: sanitizeDollar(parsed.stateWages),
      state,
    };

    return NextResponse.json(result, {
      headers: {
        "X-RateLimit-Limit": String(MAX_REQUESTS),
        "X-RateLimit-Remaining": String(remaining),
        "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
      },
    });
  } catch (err: unknown) {
    // Log internally but return a generic error to the client
    console.error("Analyze route error:", err instanceof Error ? err.message : "unknown error");
    return NextResponse.json(
      { error: "An error occurred processing your request. Please try again." },
      { status: 500 }
    );
  }
}
