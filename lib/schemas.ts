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
  morning: z.array(ActivitySchema),
  afternoon: z.array(ActivitySchema),
  evening: z.array(ActivitySchema),
});

export type TimeSlot = z.infer<typeof TimeSlotSchema>;

// ─── Itinerary Day ────────────────────────────────────────────────────────────
export const ItineraryDaySchema = z.object({
  day_number: z.number().int().min(1),
  theme: z.string().max(100),
  slots: TimeSlotSchema,
});

export type ItineraryDay = z.infer<typeof ItineraryDaySchema>;

// ─── Budget Summary ───────────────────────────────────────────────────────────
export const BudgetSummarySchema = z.object({
  accommodation_cost: z.number().nonnegative(),
  food_cost: z.number().nonnegative(),
  transport_cost: z.number().nonnegative(),
  activities_cost: z.number().nonnegative(),
  misc_cost: z.number().nonnegative(),
  total_estimated_cost: z.number().nonnegative(),
  currency: z.string().default("PKR"),
});

export type BudgetSummary = z.infer<typeof BudgetSummarySchema>;

// ─── Full Generation Response ─────────────────────────────────────────────────
export const GeneratedItinerarySchema = z.object({
  destination: z.string(),
  duration_days: z.number().int().min(1).max(7),
  budget_tier: z.enum(["budget", "moderate", "luxury"]),
  days: z.array(ItineraryDaySchema),
  budget: BudgetSummarySchema,
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
