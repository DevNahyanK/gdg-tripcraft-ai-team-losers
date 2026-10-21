import { NextResponse } from "next/server";
import { callGeminiRaw } from "@/lib/gemini";
import { GenerateRequestSchema, GeneratedItinerarySchema } from "@/lib/schemas";

// Export maxDuration = 60 to prevent Vercel Hobby tier function timeouts (up to 60s)
export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * POST /api/generate
 * Accepts the GenerateRequest body, calls Gemini, parses JSON defensively,
 * validates against GeneratedItinerarySchema, and returns the itinerary.
 */
export async function POST(request: Request) {
  // ── 1. Parse & validate request body ──────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch (err: unknown) {
    console.error("API ERROR: Failed to parse request JSON:", err);
    return NextResponse.json(
      { error: "Invalid JSON in request body.", code: "INVALID_REQUEST_BODY" },
      { status: 400 }
    );
  }

  const parsed = GenerateRequestSchema.safeParse(body);
  if (!parsed.success) {
    console.error("API ERROR: Request validation failed:", parsed.error);
    return NextResponse.json(
      {
        error: "Request validation failed.",
        details: parsed.error.flatten().fieldErrors,
        code: "VALIDATION_FAILED",
      },
      { status: 422 }
    );
  }

  // ── 2. Call AI engine for raw response ────────────────────────────────────────
  let rawText = "";
  try {
    rawText = await callGeminiRaw(parsed.data);
  } catch (err: unknown) {
    console.error("GEMINI API ERROR:", err);
    const message = err instanceof Error ? err.message : String(err);

    if (message.includes("GEMINI_API_KEY")) {
      return NextResponse.json(
        {
          error: "GEMINI_API_KEY is not configured or invalid in .env.local.",
          details: message,
          code: "MISSING_API_KEY",
        },
        { status: 503 }
      );
    }

    if (
      message.toLowerCase().includes("rate") ||
      message.toLowerCase().includes("quota") ||
      message.toLowerCase().includes("429") ||
      message.toLowerCase().includes("resource_exhausted")
    ) {
      return NextResponse.json(
        {
          error: "Gemini quota or rate limit exceeded. Please retry in a few moments.",
          details: message,
          code: "RATE_LIMITED",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: `Failed to connect with AI model: ${message}`,
        details: message,
        code: "AI_COMMUNICATION_ERROR",
      },
      { status: 502 }
    );
  }

  // ── 3. Robust try...catch parsing of Gemini AI text response via JSON.parse() ─
  let parsedJson: unknown;
  try {
    // Clean markdown fences and extract outermost JSON object
    let cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    parsedJson = JSON.parse(cleaned);
  } catch (parseErr: unknown) {
    console.error("JSON PARSE ERROR: Failed to parse Gemini response via JSON.parse():", parseErr, "Raw output:", rawText);
    const errMsg = parseErr instanceof Error ? parseErr.message : "JSON syntax error";
    const isTruncated = !rawText.trim().endsWith("}");

    // Return a safe fallback error response instead of throwing a 500
    return NextResponse.json(
      {
        error: isTruncated
          ? "The itinerary response exceeded the output limit and was truncated. Please try generating with fewer days (e.g. 3-5 days) or retry."
          : "Unable to parse AI travel itinerary. The model returned a malformed response.",
        details: errMsg,
        code: isTruncated ? "AI_RESPONSE_TRUNCATED" : "AI_JSON_PARSE_FAILED",
      },
      { status: 422 }
    );
  }

  // ── 4. Schema validation on parsed JSON ────────────────────────────────────────
  const validationResult = GeneratedItinerarySchema.safeParse(parsedJson);
  if (!validationResult.success) {
    console.error("ZOD VALIDATION ERROR: AI output did not match schema:", validationResult.error);
    return NextResponse.json(
      {
        error: "AI response structure did not match the expected itinerary schema.",
        details: validationResult.error.message,
        code: "AI_SCHEMA_VALIDATION_ERROR",
      },
      { status: 422 }
    );
  }

  return NextResponse.json(validationResult.data, { status: 200 });
}
