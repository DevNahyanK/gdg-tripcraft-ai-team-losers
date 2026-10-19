import { NextResponse } from "next/server";
import { generateItinerary } from "@/lib/gemini";
import { GenerateRequestSchema } from "@/lib/schemas";

export const maxDuration = 60; // allow up to 60s for Gemini response (Vercel)

/**
 * POST /api/generate
 * Accepts the GenerateRequest body, calls Gemini, returns a validated
 * GeneratedItinerary JSON. Works for both guests and authenticated users.
 */
export async function POST(request: Request) {
  // ── Parse & validate request body ──────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch (err: unknown) {
    console.error("GEMINI ERROR: Failed to parse request JSON:", err);
    return NextResponse.json(
      { error: "Invalid JSON in request body." },
      { status: 400 }
    );
  }

  const parsed = GenerateRequestSchema.safeParse(body);
  if (!parsed.success) {
    console.error("GEMINI ERROR: Request validation failed:", parsed.error);
    return NextResponse.json(
      {
        error: "Request validation failed.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 422 }
    );
  }

  // ── Call AI engine ──────────────────────────────────────────────────────────
  try {
    const itinerary = await generateItinerary(parsed.data);
    return NextResponse.json(itinerary, { status: 200 });
  } catch (err: unknown) {
    console.error("GEMINI ERROR:", err);
    const message = err instanceof Error ? err.message : String(err);

    // Surface explicit, actionable error to the client
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
          error: "Gemini quota or rate limit exceeded. Please check your Google AI Studio quota or retry in a minute.",
          details: message,
          code: "RATE_LIMITED",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error: `Failed to generate itinerary: ${message}`,
        details: message,
        code: "GENERATION_FAILED",
      },
      { status: 500 }
    );
  }
}
