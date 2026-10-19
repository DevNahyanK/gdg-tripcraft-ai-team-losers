import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import type { SavedTrip } from "@/lib/schemas";
import DashboardClient from "./DashboardClient";

/**
 * Server component — fetches the authenticated user's trips from Supabase,
 * then passes them to the client component for animated rendering.
 */
export default async function DashboardPage() {
  const supabase = await createClient();

  // Auth guard — middleware also handles this, but belt-and-suspenders
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?mode=login&redirect=/dashboard");
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, email")
    .eq("id", user.id)
    .single();

  // Fetch saved trips
  const { data: trips, error } = await supabase
    .from("trips")
    .select(
      "id, destination, duration_days, budget_tier, total_estimated_cost, currency, created_at, latitude, longitude"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[dashboard] Supabase error:", error.message);
  }

  return (
    <DashboardClient
      trips={(trips as SavedTrip[]) ?? []}
      profile={{
        full_name: profile?.full_name ?? null,
        avatar_url: profile?.avatar_url ?? null,
        email: profile?.email ?? user.email ?? "",
      }}
    />
  );
}
