import { NextRequest, NextResponse } from "next/server";
import {
  TextractClient,
  AnalyzeDocumentCommand,
  type AnalyzeDocumentCommandOutput,
} from "@aws-sdk/client-textract";

// ─── Vercel environment variables to configure:
// AWS_ACCESS_KEY_ID     — required: AWS Textract credentials
// AWS_SECRET_ACCESS_KEY — required: AWS Textract credentials
// AWS_REGION            — optional: defaults to us-east-1
//
// W-2 documents are processed EXCLUSIVELY via AWS Textract (OCR).
// NO data is ever sent to any LLM or AI model.
// Textract processes documents in-memory and does not store any data.

export const maxDuration = 60;

// ─── Rate Limiter (in-memory, per-IP) ────────────────────────────────────────
// Strict rate limiting to protect AWS costs:
// - 5 requests per minute per IP
// - 20 requests per day per IP
// For production at scale, replace with Redis-backed solution (e.g. @upstash/ratelimit).

const MAX_REQUESTS_PER_MINUTE = 5;
const MAX_REQUESTS_PER_DAY = 20;
const MINUTE_MS = 60_000;
const DAY_MS = 24 * 60 * 60 * 1000;

interface RateLimitEntry {
  minuteCount: number;
  minuteStart: number;
  dayCount: number;
  dayStart: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number; reason?: string } {
  const now = Date.now();
  let entry = rateLimitMap.get(ip);

  // Initialize or reset windows
  if (!entry) {
    entry = { minuteCount: 0, minuteStart: now, dayCount: 0, dayStart: now };
    rateLimitMap.set(ip, entry);
  }

  // Reset minute window if expired
  if (now - entry.minuteStart >= MINUTE_MS) {
    entry.minuteCount = 0;
    entry.minuteStart = now;
  }

  // Reset day window if expired
  if (now - entry.dayStart >= DAY_MS) {
    entry.dayCount = 0;
    entry.dayStart = now;
  }

  // Check daily limit first
  if (entry.dayCount >= MAX_REQUESTS_PER_DAY) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.dayStart + DAY_MS,
      reason: "daily",
    };
  }

  // Check per-minute limit
  if (entry.minuteCount >= MAX_REQUESTS_PER_MINUTE) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.minuteStart + MINUTE_MS,
      reason: "minute",
    };
  }

  // Allow request
  entry.minuteCount++;
  entry.dayCount++;

  return {
    allowed: true,
    remaining: Math.min(
      MAX_REQUESTS_PER_MINUTE - entry.minuteCount,
      MAX_REQUESTS_PER_DAY - entry.dayCount
    ),
    resetAt: entry.minuteStart + MINUTE_MS,
  };
}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    // Remove entries that haven't been used in over a day
    if (now - entry.dayStart >= DAY_MS * 2) {
      rateLimitMap.delete(key);
    }
  }
}, MINUTE_MS * 5);

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

const FILE_SIGNATURES: Array<{ mime: string; signature: number[] }> = [
  { mime: "image/jpeg", signature: [0xff, 0xd8, 0xff] },
  { mime: "image/png", signature: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "image/webp", signature: [0x52, 0x49, 0x46, 0x46] },
  { mime: "image/gif", signature: [0x47, 0x49, 0x46] },
  { mime: "application/pdf", signature: [0x25, 0x50, 0x44, 0x46] },
];

function validateFileSignature(buffer: Buffer, declaredMime: string): boolean {
  for (const { mime, signature } of FILE_SIGNATURES) {
    if (mime !== declaredMime) continue;
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

// ─── W2Data shape ─────────────────────────────────────────────────────────────

interface W2Data {
  federal: number;
  socialSecurity: number;
  medicare: number;
  stateTax: number;
  stateWages: number;
  state: string;
}

const MAX_DOLLARS = 999_999;

function sanitizeDollar(val: unknown): number {
  const n = Number(val);
  if (!isFinite(n) || isNaN(n)) return 0;
  return Math.max(0, Math.min(n, MAX_DOLLARS));
}

// ─── AWS Textract Path ────────────────────────────────────────────────────────

function makeTextractClient(): TextractClient {
  return new TextractClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
}

/**
 * Extract W2 fields using AWS Textract FORMS analysis.
 * No document bytes are sent to any LLM — fully privacy-preserving.
 */
async function processWithTextract(buffer: Buffer): Promise<W2Data> {
  const client = makeTextractClient();

  const command = new AnalyzeDocumentCommand({
    Document: {
      Bytes: buffer,
    },
    FeatureTypes: ["FORMS"],
  });

  const response = await client.send(command);
  return parseTextractResponse(response);
}

function parseTextractResponse(response: AnalyzeDocumentCommandOutput): W2Data {
  const blocks = response.Blocks ?? [];

  // Build blockId → Block map
  const blockMap = new Map<string, (typeof blocks)[number]>();
  for (const block of blocks) {
    if (block.Id) blockMap.set(block.Id, block);
  }

  // Build key→value text pairs from KEY_VALUE_SET blocks
  const kvPairs: Array<{ key: string; value: string }> = [];

  for (const block of blocks) {
    if (block.BlockType !== "KEY_VALUE_SET") continue;
    if (!block.EntityTypes?.includes("KEY")) continue;

    // Collect key text
    const keyText = getTextFromRelationships(block, blockMap, "CHILD");

    // Find VALUE block via VALUE_SET relationship
    let valueText = "";
    for (const rel of block.Relationships ?? []) {
      if (rel.Type === "VALUE") {
        for (const valueId of rel.Ids ?? []) {
          const valueBlock = blockMap.get(valueId);
          if (valueBlock) {
            valueText = getTextFromRelationships(valueBlock, blockMap, "CHILD");
          }
        }
      }
    }

    if (keyText) {
      kvPairs.push({ key: keyText.trim(), value: valueText.trim() });
    }
  }

  // Match W2 fields using flexible, case-insensitive partial matching
  const federal = findDollarValue(kvPairs, [
    "federal income tax",
    "box 2",
    "2 federal",
    "income tax withheld",
  ]);

  const socialSecurity = findDollarValue(kvPairs, [
    "social security tax",
    "box 4",
    "4 social",
    "social security tax withheld",
  ]);

  const medicare = findDollarValue(kvPairs, [
    "medicare tax",
    "box 6",
    "6 medicare",
    "medicare tax withheld",
  ]);

  const stateWages = findDollarValue(kvPairs, [
    "state wages",
    "box 16",
    "16 state",
    "state wages, tips",
  ]);

  const stateTax = findDollarValue(kvPairs, [
    "state income tax",
    "box 17",
    "17 state income",
    "17 state",
  ]);

  // State: look for 2-letter code
  const state = findStateCode(kvPairs, [
    "employer's state",
    "box 15",
    "15 state",
    "state id",
  ]);

  return {
    federal,
    socialSecurity,
    medicare,
    stateTax,
    stateWages,
    state,
  };
}

function getTextFromRelationships(
  block: { Relationships?: Array<{ Type?: string; Ids?: string[] }> },
  blockMap: Map<string, { BlockType?: string; Text?: string; Relationships?: Array<{ Type?: string; Ids?: string[] }> }>,
  relationshipType: string
): string {
  const texts: string[] = [];
  for (const rel of block.Relationships ?? []) {
    if (rel.Type !== relationshipType) continue;
    for (const id of rel.Ids ?? []) {
      const child = blockMap.get(id);
      if (child?.BlockType === "WORD" && child.Text) {
        texts.push(child.Text);
      }
    }
  }
  return texts.join(" ");
}

function findDollarValue(
  pairs: Array<{ key: string; value: string }>,
  patterns: string[]
): number {
  const lower = (s: string) => s.toLowerCase();
  for (const { key, value } of pairs) {
    const keyLower = lower(key);
    for (const pattern of patterns) {
      if (keyLower.includes(lower(pattern))) {
        const cleaned = value.replace(/[$,\s]/g, "");
        const n = parseFloat(cleaned);
        if (!isNaN(n) && isFinite(n)) {
          return sanitizeDollar(n);
        }
      }
    }
  }
  return 0;
}

function findStateCode(
  pairs: Array<{ key: string; value: string }>,
  patterns: string[]
): string {
  const lower = (s: string) => s.toLowerCase();
  for (const { key, value } of pairs) {
    const keyLower = lower(key);
    for (const pattern of patterns) {
      if (keyLower.includes(lower(pattern))) {
        // Try to extract a 2-letter state code from the value
        const match = value.trim().match(/\b([A-Za-z]{2})\b/);
        if (match) {
          const code = match[1].toUpperCase();
          if (/^[A-Z]{2}$/.test(code)) return code;
        }
      }
    }
  }
  return "";
}


// ─── Helpers ──────────────────────────────────────────────────────────────────

function getClientIp(req: NextRequest): string {
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
  const { allowed, remaining, resetAt, reason } = checkRateLimit(ip);

  if (!allowed) {
    const isDaily = reason === "daily";
    return NextResponse.json(
      {
        error: isDaily
          ? "Daily limit reached (20 requests/day). Please try again tomorrow."
          : "Too many requests. Please wait 1 minute before trying again.",
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
          "X-RateLimit-Limit": String(isDaily ? MAX_REQUESTS_PER_DAY : MAX_REQUESTS_PER_MINUTE),
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

    // 3. File size validation
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File too large. Maximum allowed size is ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB.` },
        { status: 413 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "File is empty." }, { status: 400 });
    }

    // 4. MIME type validation
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

    // 6. Magic byte validation
    if (!validateFileSignature(buffer, mimeType)) {
      return NextResponse.json(
        { error: "File content does not match the declared type. Please upload a valid image or PDF." },
        { status: 400 }
      );
    }

    // 7. Process with AWS Textract (OCR only — NO LLM/AI)
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.error("AWS credentials not configured");
      return NextResponse.json(
        { error: "Service temporarily unavailable. Please try again later." },
        { status: 503 }
      );
    }

    const result = await processWithTextract(buffer);

    return NextResponse.json(result, {
      headers: {
        "X-RateLimit-Limit": `${MAX_REQUESTS_PER_MINUTE}/min, ${MAX_REQUESTS_PER_DAY}/day`,
        "X-RateLimit-Remaining": String(remaining),
        "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
      },
    });
  } catch (err: unknown) {
    console.error("Analyze route error:", err instanceof Error ? err.message : "unknown error");

    // Surface parse errors as 422 (unprocessable), everything else as 500
    const isParseError =
      err instanceof Error && err.message.includes("Failed to extract");

    return NextResponse.json(
      {
        error: isParseError
          ? "Failed to extract tax data from document. Please ensure it is a clear W-2 image."
          : "An error occurred processing your request. Please try again.",
      },
      { status: isParseError ? 422 : 500 }
    );
  }
}
