import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

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

async function imageToBase64(buffer: Buffer, mimeType: string): Promise<{ base64: string; mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif" }> {
  return {
    base64: buffer.toString("base64"),
    mediaType: mimeType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
  };
}

async function pdfToImage(buffer: Buffer): Promise<{ base64: string; mediaType: "image/jpeg" }> {
  // Try pdf2pic if available (optional dependency — install with: npm install pdf2pic)
  try {
    // dynamic require to avoid build-time module resolution errors
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
    const pdf2pic: any = require("pdf2pic");
    const { fromBuffer } = pdf2pic;
    const converter = fromBuffer(buffer, {
      density: 150,
      format: "jpeg",
      width: 1700,
      height: 2200,
    });
    const result = await converter(1, { responseType: "base64" });
    if (result && result.base64) {
      return { base64: result.base64, mediaType: "image/jpeg" };
    }
  } catch {
    // pdf2pic not available or failed
  }

  // Fallback: try sharp with a raw approach (won't work for PDF but let's be safe)
  // If we reach here, we'll throw and let the caller handle it
  throw new Error(
    "PDF processing requires pdf2pic. Please install it with: npm install pdf2pic"
  );
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type;

    let imageData: { base64: string; mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif" };

    if (mimeType === "application/pdf") {
      const result = await pdfToImage(buffer);
      imageData = result;
    } else if (
      mimeType === "image/jpeg" ||
      mimeType === "image/png" ||
      mimeType === "image/webp" ||
      mimeType === "image/gif"
    ) {
      imageData = await imageToBase64(buffer, mimeType);
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload JPG, PNG, WebP, or PDF." },
        { status: 400 }
      );
    }

    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: imageData.mediaType,
                data: imageData.base64,
              },
            },
            {
              type: "text",
              text: USER_PROMPT,
            },
          ],
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    // Parse JSON from the response
    let parsed: {
      federal: number;
      socialSecurity: number;
      medicare: number;
      stateTax: number;
      stateWages: number;
      state: string;
    };

    try {
      // Strip any markdown code blocks if present
      const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse Claude response:", text);
      return NextResponse.json(
        { error: "Failed to parse tax data from document. Please ensure it's a clear W2 image." },
        { status: 422 }
      );
    }

    // Validate and sanitize
    const result = {
      federal: Number(parsed.federal) || 0,
      socialSecurity: Number(parsed.socialSecurity) || 0,
      medicare: Number(parsed.medicare) || 0,
      stateTax: Number(parsed.stateTax) || 0,
      stateWages: Number(parsed.stateWages) || 0,
      state: String(parsed.state || ""),
    };

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Analyze error:", err);
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
