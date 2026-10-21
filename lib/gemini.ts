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

// Explicit generation config setting maxOutputTokens to 8192 to prevent payload truncation
export const GENERATION_CONFIG = {
  responseMimeType: "application/json",
  temperature: 0.7,
  topP: 0.9,
  maxOutputTokens: 8192,
};

const MODEL_NAME = "gemini-1.5-flash";

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
  "title": string,              // concise name of place/activity (e.g. "Eiffel Tower Summit")
  "description": string,        // concise 1-sentence description (under 20 words) to conserve tokens
  "location_name": string,      // specific neighbourhood or district (under 40 chars)
  "estimated_cost": number,     // in PKR per person (MUST BE POSITIVE NON-ZERO, e.g. 800, 1500, 3000)
  "category": "sightseeing" | "food" | "travel" | "leisure", // MUST BE EXACT LOWERCASE: "sightseeing", "food", "travel", or "leisure"
  "order_index": number         // 0-indexed within the time slot
}

3. Each day must have 1 or 2 activities per slot (morning, afternoon, evening). Do NOT exceed 2 activities per slot.
4. Activities must reflect the traveller's interests: ${interestsList}.
5. CRITICAL COST RULE: Assign a realistic, NON-ZERO estimated_cost (in PKR) to EVERY SINGLE activity. NEVER output 0 for estimated_cost.
   - "food" activities: meals, dining, snacks (e.g. 700 - 3500 PKR depending on tier).
   - "sightseeing" / "leisure" activities: museum entry, monument ticket, local tour, or guide fee (e.g. 500 - 4500 PKR).
   - "travel" activities: taxi, jeep hire, boat ride, or transit pass (e.g. 500 - 3000 PKR).
   - The combined activity costs should logically correlate with the respective category budget totals (food_cost, transport_cost, activities_cost).
6. All costs MUST be realistic for ${req.destination} at the ${req.budgetTier} tier in PKR.
7. budget.total_estimated_cost must equal the sum of all five budget line items (accommodation_cost + food_cost + transport_cost + activities_cost + misc_cost).
8. Do NOT include accommodation in activities — keep it separate in the budget.
9. CRITICAL CATEGORY RULE: The "category" field for EVERY activity MUST strictly be one of these four exact lowercase strings: "sightseeing", "food", "travel", or "leisure". Do NOT use uppercase or alternate terms (e.g., do not output "Food", "Sightseeing", "Shopping", "Culture", or "Dining").
10. TOKEN CONSERVATION & COMPLETION: Keep all descriptions concise, direct, and under 20 words each. Ensure the complete JSON finishes cleanly without exceeding token limits.

Generate the itinerary now:`;
}

/**
 * Calls Gemini using strictly and only "gemini-1.5-flash" with apiVersion: "v1"
 * and maxOutputTokens: 8192.
 * Initializes GoogleGenerativeAI with apiVersion: "v1" and provides direct REST
 * fetch fallback for gemini-1.5-flash.
 */
export async function callGeminiRaw(req: GenerateRequest): Promise<string> {
  // Ensure the API key is properly sanitized and read from process.env
  const rawKey = process.env.GEMINI_API_KEY || "";
  const apiKey = rawKey.trim().replace(/^['"]|['"]$/g, "");

  if (!apiKey) {
    const errorMsg = "GEMINI_API_KEY is not set or empty. Please add it to your .env.local file.";
    console.error("GEMINI ERROR:", errorMsg);
    throw new Error(errorMsg);
  }

  const prompt = buildPrompt(req);

  // 1. Initialize GoogleGenerativeAI with apiVersion: "v1" instead of default v1beta
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel(
      {
        model: MODEL_NAME,
        generationConfig: GENERATION_CONFIG,
      },
      {
        apiVersion: "v1",
      }
    );

    const result = await model.generateContent(
      {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: GENERATION_CONFIG,
      },
      {
        apiVersion: "v1",
      }
    );

    const candidate = result.response.candidates?.[0];
    if (candidate?.finishReason === "MAX_TOKENS") {
      console.warn(`[GEMINI WARNING] Model "${MODEL_NAME}" reached MAX_TOKENS limit (8192 tokens)!`);
    }

    return result.response.text();
  } catch (sdkErr: unknown) {
    console.warn(
      `[GEMINI INFO] SDK call with apiVersion 'v1' encountered an error. Attempting direct REST fetch for ${MODEL_NAME}...`,
      sdkErr
    );

    // 2. Direct REST fetch to Google's endpoints for gemini-1.5-flash (v1 and v1beta)
    const endpoints = [
      `https://generativelanguage.googleapis.com/v1/models/${MODEL_NAME}:generateContent?key=${apiKey}`,
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${apiKey}`,
    ];

    let lastFetchError: unknown = null;
    for (const url of endpoints) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: GENERATION_CONFIG,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            return text;
          }
        } else {
          const errBody = await response.text();
          const apiVer = url.includes("/v1/") ? "v1" : "v1beta";
          lastFetchError = new Error(`REST endpoint (${apiVer}) returned HTTP ${response.status}: ${errBody}`);
        }
      } catch (err: unknown) {
        lastFetchError = err;
      }
    }

    console.error(`GEMINI ERROR: Direct call to ${MODEL_NAME} failed:`, lastFetchError || sdkErr);
    throw lastFetchError || sdkErr;
  }
}

/**
 * Parses raw text from Gemini into a validated GeneratedItinerary.
 */
export function parseItineraryJson(rawText: string): GeneratedItinerary {
  let cleaned = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  // Find outermost JSON object
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err: unknown) {
    console.error("GEMINI ERROR: Failed to parse JSON from model output:", err, "Raw text:", rawText);
    throw new Error(
      `Gemini returned invalid JSON: ${err instanceof Error ? err.message : String(err)}`
    );
  }

  // Validate against Zod schema
  const result = GeneratedItinerarySchema.safeParse(parsed);
  if (!result.success) {
    console.error("GEMINI ERROR: Zod schema validation failed:", result.error);
    throw new Error(
      `AI response failed schema validation: ${result.error.message}`
    );
  }

  return result.data;
}

/**
 * High-level helper: Calls Gemini and returns validated itinerary.
 */
export async function generateItinerary(
  req: GenerateRequest
): Promise<GeneratedItinerary> {
  const rawText = await callGeminiRaw(req);
  return parseItineraryJson(rawText);
}
