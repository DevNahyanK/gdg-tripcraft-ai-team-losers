import { z } from "zod";

// ─── Activity ─────────────────────────────────────────────────────────────────
export const ActivitySchema = z.object({
  title: z.string().min(1).max(150),
  description: z.string(),
  location_name: z.string(),
  estimated_cost: z.number().nonnegative(),
  category: z.enum(["sightseeing", "food", "travel", "leisure"]),
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
