import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { GeneratedItinerarySchema } from "@/lib/schemas";

// Known coordinates for top destinations
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  hunza: { lat: 36.3167, lng: 74.6667 },
  skardu: { lat: 35.2971, lng: 75.6333 },
  swat: { lat: 35.2227, lng: 72.4258 },
  lahore: { lat: 31.5204, lng: 74.3587 },
  islamabad: { lat: 33.6844, lng: 73.0479 },
  dubai: { lat: 25.2048, lng: 55.2708 },
  tokyo: { lat: 35.6762, lng: 139.6503 },
  paris: { lat: 48.8566, lng: 2.3522 },
  bali: { lat: -8.4095, lng: 115.1889 },
  istanbul: { lat: 41.0082, lng: 28.9784 },
  bangkok: { lat: 13.7563, lng: 100.5018 },
  "new york": { lat: 40.7128, lng: -74.006 },
  london: { lat: 51.5074, lng: -0.1278 },
};

function getCoordinates(destination: string) {
  const norm = destination.toLowerCase().trim();
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (norm.includes(key)) {
      return coords;
    }
  }
  return { lat: null, lng: null };
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // 1. Auth Guard
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required to save trips." },
        { status: 401 }
      );
    }

    // 2. Parse & validate request body
    const body = await req.json();
    const parseResult = GeneratedItinerarySchema.safeParse(body);

    if (!parseResult.success) {
      console.error("[save-trip] Validation error:", parseResult.error.format());
      return NextResponse.json(
        { error: "Invalid itinerary payload", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const itinerary = parseResult.data;
    const { lat, lng } = getCoordinates(itinerary.destination);

    // 3. Ensure profile row exists to satisfy Foreign Key constraints
    await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email || "",
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
      },
      { onConflict: "id" }
    );

    // 4. Insert Trip record
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .insert({
        user_id: user.id,
        destination: itinerary.destination,
        duration_days: itinerary.duration_days,
        budget_tier: itinerary.budget_tier,
        total_estimated_cost: itinerary.budget.total_estimated_cost,
        currency: itinerary.budget.currency || "PKR",
        latitude: lat,
        longitude: lng,
      })
      .select("id")
      .single();

    if (tripError || !trip) {
      console.error("[save-trip] Trip insert error:", tripError);
      return NextResponse.json(
        { error: tripError?.message || "Failed to save trip." },
        { status: 500 }
      );
    }

    // 5. Insert Budget Summary
    const { error: budgetError } = await supabase
      .from("budget_summaries")
      .insert({
        trip_id: trip.id,
        accommodation_cost: itinerary.budget.accommodation_cost,
        food_cost: itinerary.budget.food_cost,
        transport_cost: itinerary.budget.transport_cost,
        activities_cost: itinerary.budget.activities_cost,
        misc_cost: itinerary.budget.misc_cost,
      });

    if (budgetError) {
      console.error("[save-trip] Budget summary insert error:", budgetError);
    }

    // 6. Insert Days & Activities sequentially
    for (const day of itinerary.days) {
      const { data: savedDay, error: dayError } = await supabase
        .from("itinerary_days")
        .insert({
          trip_id: trip.id,
          day_number: day.day_number,
          theme: day.theme,
        })
        .select("id")
        .single();

      if (dayError || !savedDay) {
        console.error("[save-trip] Day insert error:", dayError);
        continue;
      }

      const activitiesToInsert = [];
      const slots: Array<"morning" | "afternoon" | "evening"> = [
        "morning",
        "afternoon",
        "evening",
      ];

      for (const slot of slots) {
        const items = day.slots[slot] || [];
        for (let idx = 0; idx < items.length; idx++) {
          const act = items[idx];
          activitiesToInsert.push({
            day_id: savedDay.id,
            time_slot: slot,
            title: act.title,
            description: act.description,
            location_name: act.location_name,
            estimated_cost: act.estimated_cost,
            category: act.category,
            order_index: act.order_index ?? idx,
          });
        }
      }

      if (activitiesToInsert.length > 0) {
        const { error: actError } = await supabase
          .from("activities")
          .insert(activitiesToInsert);

        if (actError) {
          console.error("[save-trip] Activities insert error:", actError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      tripId: trip.id,
      message: "Trip saved successfully!",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    console.error("[save-trip] Unexpected exception:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
