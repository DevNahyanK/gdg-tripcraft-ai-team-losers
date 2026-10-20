import { createClient } from "@/utils/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Wallet,
  Clock,
  MapPin,
  TrendingUp,
  Sun,
  Sunset,
  Moon,
  Home,
  Utensils,
  Bus,
  Activity as ActivityIcon,
  Package,
  Camera,
  Car,
  Coffee,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface PageProps {
  params: { id: string };
}

const BUDGET_META = {
  budget: {
    label: "Budget",
    icon: "💸",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    color: "text-emerald-400",
  },
  moderate: {
    label: "Moderate",
    icon: "✈️",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    color: "text-blue-400",
  },
  luxury: {
    label: "Luxury",
    icon: "👑",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    color: "text-amber-400",
  },
} as const;

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  sightseeing: Camera,
  food: Utensils,
  travel: Car,
  leisure: Coffee,
};

const CATEGORY_COLORS: Record<string, string> = {
  sightseeing: "text-blue-400 bg-blue-500/10",
  food: "text-orange-400 bg-orange-500/10",
  travel: "text-violet-400 bg-violet-500/10",
  leisure: "text-teal-400 bg-teal-500/10",
};

const SLOT_META = {
  morning: { icon: Sun, label: "Morning", color: "text-amber-400" },
  afternoon: { icon: Sunset, label: "Afternoon", color: "text-orange-400" },
  evening: { icon: Moon, label: "Evening", color: "text-indigo-400" },
};

function formatCost(n: number, currency = "PKR") {
  return `${currency} ${Math.round(n).toLocaleString("en-PK")}`;
}

export default async function SavedItineraryPage({ params }: PageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth?mode=login&redirect=/itinerary/${params.id}`);
  }

  // 1. Fetch trip
  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("*")
    .eq("id", params.id)
    .single();

  if (tripError || !trip) {
    notFound();
  }

  // 2. Fetch budget summary
  const { data: budget } = await supabase
    .from("budget_summaries")
    .select("*")
    .eq("trip_id", trip.id)
    .single();

  // 3. Fetch days
  const { data: days } = await supabase
    .from("itinerary_days")
    .select("*")
    .eq("trip_id", trip.id)
    .order("day_number", { ascending: true });

  // 4. Fetch activities for all days
  const dayIds = days?.map((d) => d.id) ?? [];
  let activities: any[] = [];
  if (dayIds.length > 0) {
    const { data: acts } = await supabase
      .from("activities")
      .select("*")
      .in("day_id", dayIds)
      .order("order_index", { ascending: true });
    activities = acts ?? [];
  }

  const budgetTier = (trip.budget_tier as "budget" | "moderate" | "luxury") || "moderate";
  const budgetMeta = BUDGET_META[budgetTier] || BUDGET_META.moderate;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between noise-overlay">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-28 w-full flex-1">
        {/* Back Link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>

        {/* Header banner */}
        <div className="glass rounded-3xl p-8 mb-8 relative overflow-hidden border border-white/10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 border border-blue-500/30 text-blue-300">
                  <MapPin size={12} className="text-cyan-400" />
                  Saved Trip
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${budgetMeta.bg} ${budgetMeta.border} border`}
                >
                  <span>{budgetMeta.icon}</span>
                  {budgetMeta.label}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                {trip.destination}
              </h1>

              <div className="flex items-center gap-4 mt-3 text-sm text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-cyan-400" />
                  {trip.duration_days} Days Plan
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-500" />
                  Saved on {new Date(trip.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="text-left md:text-right p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider">
                Total Estimated Cost
              </span>
              <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                {formatCost(trip.total_estimated_cost, trip.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Budget breakdown cards */}
        {budget && (
          <div className="glass rounded-2xl p-6 mb-10 border border-white/10">
            <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2 mb-4">
              <TrendingUp size={15} className="text-cyan-400" />
              Itemized Budget Allocations
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: "Stay", val: budget.accommodation_cost, icon: Home, color: "text-violet-400" },
                { label: "Food", val: budget.food_cost, icon: Utensils, color: "text-orange-400" },
                { label: "Transit", val: budget.transport_cost, icon: Bus, color: "text-blue-400" },
                { label: "Activities", val: budget.activities_cost, icon: ActivityIcon, color: "text-emerald-400" },
                { label: "Misc", val: budget.misc_cost, icon: Package, color: "text-rose-400" },
              ].map(({ label, val, icon: Icon, color }) => (
                <div
                  key={label}
                  className="rounded-xl bg-white/5 border border-white/5 p-3 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400 font-medium">{label}</span>
                    <Icon size={14} className={color} />
                  </div>
                  <span className="text-sm sm:text-base font-bold text-white">
                    {formatCost(val, trip.currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Days & schedule */}
        <div className="space-y-8">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar size={18} className="text-blue-400" />
            Complete Day-by-Day Itinerary
          </h2>

          {days && days.length > 0 ? (
            days.map((d) => {
              const dayActs = activities.filter((a) => a.day_id === d.id);
              const morning = dayActs.filter((a) => a.time_slot === "morning");
              const afternoon = dayActs.filter((a) => a.time_slot === "afternoon");
              const evening = dayActs.filter((a) => a.time_slot === "evening");

              return (
                <div
                  key={d.id}
                  className="glass rounded-2xl p-6 sm:p-8 border border-white/10 space-y-6"
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block">
                        Day {d.day_number}
                      </span>
                      <h3 className="text-xl font-bold text-white mt-0.5">
                        {d.theme || `Day ${d.day_number} Exploration`}
                      </h3>
                    </div>
                  </div>

                  {/* Slots */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {(
                      [
                        { key: "morning", list: morning },
                        { key: "afternoon", list: afternoon },
                        { key: "evening", list: evening },
                      ] as const
                    ).map(({ key, list }) => {
                      const slotMeta = SLOT_META[key];
                      const SlotIcon = slotMeta.icon;

                      return (
                        <div
                          key={key}
                          className="rounded-xl bg-white/[0.03] border border-white/5 p-4 flex flex-col"
                        >
                          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
                            <SlotIcon size={16} className={slotMeta.color} />
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                              {slotMeta.label}
                            </span>
                          </div>

                          <div className="space-y-3 flex-1">
                            {list.length > 0 ? (
                              list.map((act) => {
                                const CatIcon = CATEGORY_ICONS[act.category] || ActivityIcon;
                                const catColor = CATEGORY_COLORS[act.category] || "text-blue-400 bg-blue-500/10";

                                return (
                                  <div
                                    key={act.id}
                                    className="p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/15 transition-colors"
                                  >
                                    <div className="flex items-start justify-between gap-2 mb-1.5">
                                      <h4 className="text-sm font-semibold text-white leading-tight">
                                        {act.title}
                                      </h4>
                                      <span
                                        className={`p-1 rounded-md text-[10px] uppercase font-bold flex-shrink-0 ${catColor}`}
                                      >
                                        <CatIcon size={12} />
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mb-2 leading-relaxed">
                                      {act.description}
                                    </p>
                                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-white/5">
                                      <span className="text-slate-400 flex items-center gap-1">
                                        <MapPin size={10} className="text-slate-500" />
                                        {act.location_name || trip.destination}
                                      </span>
                                      <span className="font-bold text-cyan-300">
                                        {formatCost(act.estimated_cost, trip.currency)}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              <p className="text-xs text-slate-500 italic py-2">
                                Free time / leisure
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-slate-400">No scheduled days found for this trip.</p>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
