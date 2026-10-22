import type { GenerateRequest, GeneratedItinerary } from "@/lib/schemas";
import { GeneratedItinerarySchema } from "@/lib/schemas";

const BUDGET_CONTEXT: Record<string, string> = {
  budget:
    "budget traveller spending PKR 3,000–6,000/day total. Choose affordable guesthouses, local dhabas, and public transport.",
  moderate:
    "mid-range traveller spending PKR 10,000–18,000/day total. Choose comfortable hotels, decent restaurants, and private transport.",
  luxury:
    "luxury traveller spending PKR 30,000–60,000/day total. Choose premium hotels, fine dining, and private chauffeur services.",
};

export const GENERATION_CONFIG = {
  responseMimeType: "application/json",
  temperature: 0.7,
  topP: 0.9,
  maxOutputTokens: 8192,
};

// Aliased model name that matches your active project quota
const MODEL_NAME = "gemini-3.5-flash-lite";

function buildPrompt(req: GenerateRequest): string {
  const budgetCtx = BUDGET_CONTEXT[req.budgetTier];
  const interestsList = req.interests.join(", ");

  return `You are TripCraft AI, an expert travel planner. Generate a detailed ${req.durationDays}-day travel itinerary for a ${budgetCtx}

Destination: ${req.destination}
Duration: ${req.durationDays} days
Budget Tier: ${req.budgetTier}
Traveller Interests: ${interestsList}

STRICT RULES:
1. Return ONLY valid JSON — no markdown, no code fences, no extra text.
2. Structure MUST exactly match this TypeScript type:

{
  "destination": string,
  "duration_days": number,
  "budget_tier": "budget" | "moderate" | "luxury",
  "days": [
    {
      "day_number": number,
      "theme": string,
      "slots": {
        "morning": [ ...activities ],
        "afternoon": [ ...activities ],
        "evening": [ ...activities ]
      }
    }
  ],
  "budget": {
    "accommodation_cost": number,
    "food_cost": number,
    "transport_cost": number,
    "activities_cost": number,
    "misc_cost": number,
    "total_estimated_cost": number,
    "currency": "PKR"
  }
}

Activity object shape:
{
  "title": string,
  "description": string,
  "location_name": string,
  "estimated_cost": number,
  "category": "sightseeing" | "food" | "travel" | "leisure",
  "order_index": number
}

3. Each day must have 1 or 2 activities per slot (morning, afternoon, evening). Do NOT exceed 2 activities per slot.
4. Activities must reflect the traveller's interests: ${interestsList}.
5. Assign a realistic, non-zero estimated_cost in PKR to every single activity.
6. All costs must be realistic for ${req.destination} at the ${req.budgetTier} tier.
7. budget.total_estimated_cost must equal sum of accommodation, food, transport, activities, and misc costs.
8. Do NOT include accommodation in activities.
9. "category" field MUST strictly be lowercase: "sightseeing", "food", "travel", or "leisure".
10. Keep all descriptions concise (under 20 words) to ensure the JSON does not truncate.

Generate the itinerary now:`;
}

export async function callGeminiRaw(req: GenerateRequest, retries = 3): Promise<string> {
  const rawKey = process.env.GEMINI_API_KEY || "";
  const apiKey = rawKey.trim().replace(/^['"]|['"]$/g, "");

  if (!apiKey) {
    const errorMsg = "GEMINI_API_KEY is not set or empty in .env.local";
    console.error("GEMINI ERROR:", errorMsg);
    throw new Error(errorMsg);
  }

  const prompt = buildPrompt(req);

  // Directly use standard REST with x-goog-api-key header (compatible with AQ. tokens)
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-goog-api-key": apiKey,
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: GENERATION_CONFIG,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      
      // Auto-retry logic for 503 High Demand errors
      if (response.status === 503 && retries > 0) {
        console.warn(`[GEMINI WARN] 503 High Demand. Retrying in 2 seconds... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        return callGeminiRaw(req, retries - 1);
      }
      
      console.error(`GEMINI REST ERROR (HTTP ${response.status}):`, errText);
      throw new Error(`HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const output = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!output) {
      throw new Error("Gemini returned an empty candidate text.");
    }

    return output;
  } catch (error: unknown) {
    console.error("Failed to generate response from Gemini endpoint:", error);
    throw error;
  }
}

export function parseItineraryJson(rawText: string): GeneratedItinerary {
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

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err: unknown) {
    console.error("GEMINI ERROR: JSON.parse failed on output:", err, "\nRaw string:", rawText);
    throw new Error(
      `Gemini returned malformed JSON: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  const result = GeneratedItinerarySchema.safeParse(parsed);
  if (!result.success) {
    console.error("GEMINI ERROR: Zod validation failed:", result.error);
    throw new Error(`Itinerary validation failed: ${result.error.message}`);
  }

  return result.data;
}

export async function generateItinerary(
  req: GenerateRequest
): Promise<GeneratedItinerary> {
  const rawText = await callGeminiRaw(req);
  return parseItineraryJson(rawText);
}