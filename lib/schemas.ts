import { z } from "zod";

// ─── Activity Category ─────────────────────────────────────────────────────────
export const ActivityCategorySchema = z.preprocess((val) => {
  if (typeof val !== "string") return "sightseeing";
  const v = val.toLowerCase().trim();
  if (["food", "dining", "meal", "restaurant", "cafe", "dinner", "lunch", "breakfast"].includes(v)) return "food";
  if (["travel", "transit", "transport", "commute", "flight", "drive"].includes(v)) return "travel";
  if (["leisure", "relaxation", "shopping", "entertainment", "nightlife", "park"].includes(v)) return "leisure";
  if (["sightseeing", "tour", "attraction", "visit", "culture", "historical", "monument"].includes(v)) return "sightseeing";
  return ["sightseeing", "food", "travel", "leisure"].includes(v) ? v : "sightseeing";
}, z.enum(["sightseeing", "food", "travel", "leisure"]));

export type ActivityCategory = z.infer<typeof ActivityCategorySchema>;

// ─── Activity ─────────────────────────────────────────────────────────────────
export const ActivitySchema = z.object({
  title: z.string().min(1).max(150),
  description: z.string(),
  location_name: z.string(),
  estimated_cost: z.number().nonnegative(),
  category: ActivityCategorySchema,
  order_index: z.number().int().nonnegative(),
});

export type Activity = z.infer<typeof ActivitySchema>;

// ─── Time Slot ────────────────────────────────────────────────────────────────
export const TimeSlotSchema = z.object({
  morning: z.array(ActivitySchema).default([]),
  afternoon: z.array(ActivitySchema).default([]),
  evening: z.array(ActivitySchema).default([]),
});

export type TimeSlot = z.infer<typeof TimeSlotSchema>;

// ─── Itinerary Day ────────────────────────────────────────────────────────────
export const ItineraryDaySchema = z
  .object({
    day_number: z.coerce.number().int().min(1).default(1),
    theme: z.string().max(100).default("Day Exploration"),
    slots: TimeSlotSchema.optional(),
    activities: z.array(ActivitySchema).optional(),
  })
  .transform((day) => {
    // If slots are not provided but activities are, populate slots
    if (!day.slots && day.activities && day.activities.length > 0) {
      const total = day.activities.length;
      day.slots = {
        morning: day.activities.slice(0, Math.ceil(total / 3)),
        afternoon: day.activities.slice(Math.ceil(total / 3), Math.ceil((2 * total) / 3)),
        evening: day.activities.slice(Math.ceil((2 * total) / 3)),
      };
    } else if (!day.slots) {
      day.slots = { morning: [], afternoon: [], evening: [] };
    }
    return day as {
      day_number: number;
      theme: string;
      slots: TimeSlot;
      activities?: Activity[];
    };
  });

export type ItineraryDay = z.infer<typeof ItineraryDaySchema>;

// ─── Budget Summary ───────────────────────────────────────────────────────────
export const BudgetSummarySchema = z
  .object({
    accommodation_cost: z.coerce.number().nonnegative().default(0),
    food_cost: z.coerce.number().nonnegative().default(0),
    transport_cost: z.coerce.number().nonnegative().default(0),
    activities_cost: z.coerce.number().nonnegative().default(0),
    misc_cost: z.coerce.number().nonnegative().default(0),
    total_estimated_cost: z.coerce.number().nonnegative().optional(),
    currency: z.string().default("PKR"),
  })
  .transform((b) => {
    const computedTotal =
      b.total_estimated_cost && b.total_estimated_cost > 0
        ? b.total_estimated_cost
        : b.accommodation_cost +
          b.food_cost +
          b.transport_cost +
          b.activities_cost +
          b.misc_cost;
    return {
      ...b,
      total_estimated_cost: computedTotal,
    };
  });

export type BudgetSummary = z.infer<typeof BudgetSummarySchema>;

// ─── Full Generation Response ─────────────────────────────────────────────────
export const GeneratedItinerarySchema = z.object({
  destination: z.string().default("Destination"),
  duration_days: z.coerce.number().int().min(1).max(30).default(3),
  budget_tier: z.enum(["budget", "moderate", "luxury"]).default("budget"),
  days: z.array(ItineraryDaySchema).default([]),
  budget: BudgetSummarySchema.default({
    accommodation_cost: 0,
    food_cost: 0,
    transport_cost: 0,
    activities_cost: 0,
    misc_cost: 0,
    total_estimated_cost: 0,
    currency: "PKR",
  }),
});

export type GeneratedItinerary = z.infer<typeof GeneratedItinerarySchema>;

// ─── API Request Schema ───────────────────────────────────────────────────────
export const GenerateRequestSchema = z.object({
  destination: z
    .string()
    .min(1, "Destination is required")
    .max(100, "Destination must be under 100 characters"),
  durationDays: z
    .number()
    .int()
    .min(1, "Duration must be at least 1 day")
    .max(7, "Duration cannot exceed 7 days"),
  budgetTier: z.enum(["budget", "moderate", "luxury"]),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
});

export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;

// ─── Saved Trip (from Supabase) ───────────────────────────────────────────────
export interface SavedTrip {
  id: string;
  destination: string;
  duration_days: number;
  budget_tier: "budget" | "moderate" | "luxury";
  total_estimated_cost: number;
  currency: string;
  created_at: string;
  latitude?: number | null;
  longitude?: number | null;
}
