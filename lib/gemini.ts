import { GoogleGenerativeAI } from "@google/generative-ai";
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

// Priority list of Gemini models to support current Google API offerings with graceful fallbacks
const CANDIDATE_MODELS = [
  "gemini-2.5-flash",
  "gemini-1.5-flash",
  "gemini-flash-latest",
  "gemini-pro",
];

/**
 * Builds the Gemini system prompt that forces a structured JSON response
 * matching GeneratedItinerarySchema exactly.
 */
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
      "day_number": number,           // 1-indexed
      "theme": string,                // max 100 chars e.g. "Mountain Trails & Local Cuisine"
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
  "title": string,              // max 150 chars — name of place/activity
  "description": string,        // 1–2 sentence description
  "location_name": string,      // specific neighbourhood or address area
  "estimated_cost": number,     // in PKR per person
  "category": "sightseeing" | "food" | "travel" | "leisure",
  "order_index": number         // 0-indexed within the time slot
}

3. Each day must have at least 1 activity per slot (morning, afternoon, evening).
4. Activities must reflect the traveller's interests: ${interestsList}.
5. All costs MUST be realistic for ${req.destination} at the ${req.budgetTier} tier in PKR.
6. budget.total_estimated_cost must equal the sum of all five budget line items.
7. Do NOT include accommodation in activities — keep it separate in the budget.

Generate the itinerary now:`;
}

/**
 * Calls the Gemini API with automatic model fallbacks (gemini-2.5-flash, gemini-1.5-flash, gemini-flash-latest, gemini-pro)
 * and returns a validated GeneratedItinerary.
 */
export async function generateItinerary(
  req: GenerateRequest
): Promise<GeneratedItinerary> {
  // Ensure the API key is properly sanitized and read from process.env
  const rawKey = process.env.GEMINI_API_KEY || "";
  const apiKey = rawKey.trim().replace(/^['"]|['"]$/g, "");

  if (!apiKey) {
    const errorMsg = "GEMINI_API_KEY is not set or empty. Please add it to your .env.local file.";
    console.error("GEMINI ERROR:", errorMsg);
    throw new Error(errorMsg);
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const prompt = buildPrompt(req);

  let rawText = "";
  let lastError: unknown = null;
  let successfulModel = "";

  // Try candidate models in order until one succeeds
  for (const modelName of CANDIDATE_MODELS) {
    try {
      // Modern models support responseMimeType: "application/json"
      const isLegacyPro = modelName === "gemini-pro";
      const generationConfig = isLegacyPro
        ? { temperature: 0.7, topP: 0.9, maxOutputTokens: 8192 }
        : {
            responseMimeType: "application/json",
            temperature: 0.7,
            topP: 0.9,
            maxOutputTokens: 8192,
          };

      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig,
      });

      const result = await model.generateContent(prompt);
      rawText = result.response.text();
      successfulModel = modelName;
      break; // Success! Break out of the loop
    } catch (err: unknown) {
      lastError = err;
      const errMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[GEMINI INFO] Model "${modelName}" failed (${errMsg.slice(0, 80)}...). Trying fallback...`);
    }
  }

  if (!rawText) {
    console.error("GEMINI ERROR: All candidate models failed. Last error:", lastError);
    const msg = lastError instanceof Error ? lastError.message : String(lastError);
    throw new Error(`Gemini API call failed across all models: ${msg}`);
  }

  // Parse JSON
  let parsed: unknown;
  try {
    // Strip any accidental markdown code fences
    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    parsed = JSON.parse(cleaned);
  } catch (err: unknown) {
    console.error("GEMINI ERROR: Failed to parse JSON from model:", successfulModel, err, "Raw output:", rawText);
    throw new Error(
      `Gemini returned invalid JSON. Raw response: ${rawText.slice(0, 500)}`
    );
  }

  // Validate against Zod schema
  const result = GeneratedItinerarySchema.safeParse(parsed);
  if (!result.success) {
    console.error("GEMINI ERROR: Zod schema validation failed on output from:", successfulModel, result.error);
    throw new Error(
      `AI response failed schema validation: ${result.error.message}`
    );
  }

  return result.data;
}
