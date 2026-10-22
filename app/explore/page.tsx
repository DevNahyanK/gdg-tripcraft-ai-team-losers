"use client";

import { useState, useCallback, useRef, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import ErrorBoundary from "@/components/ErrorBoundary";
import { createClient } from "@/utils/supabase/client";
import {
  MapPin,
  Clock,
  Wallet,
  Tags,
  Sparkles,
  Compass,
  ChevronRight,
  Loader2,
  AlertCircle,
  RefreshCw,
  Utensils,
  Camera,
  Car,
  Coffee,
  Mountain,
  Waves,
  ShoppingBag,
  Landmark,
  Moon,
  Sun,
  Sunset,
  Star,
  DollarSign,
  Home,
  Bus,
  Activity,
  Package,
  ArrowLeft,
  Calendar,
  TrendingUp,
  Search,
  CheckCircle2,
  LayoutDashboard,
  Lock,
  X,
} from "lucide-react";
import type { GeneratedItinerary } from "@/lib/schemas";

// ─── Constants ────────────────────────────────────────────────────────────────
const POPULAR_DESTINATIONS = [
  { name: "Hunza Valley", country: "Pakistan", desc: "Glaciers, peaks & historic forts" },
  { name: "Skardu", country: "Pakistan", desc: "Deosai plains & Shangrila lake" },
  { name: "Dubai", country: "United Arab Emirates", desc: "Futuristic architecture & luxury shopping" },
  { name: "Tokyo", country: "Japan", desc: "Neon metropolis & ancient shrines" },
  { name: "Paris", country: "France", desc: "Art, gastronomy & romantic avenues" },
  { name: "Swat Valley", country: "Pakistan", desc: "Lush alpine meadows & gushing rivers" },
  { name: "Bali", country: "Indonesia", desc: "Tropical beaches, temples & coral reefs" },
  { name: "Lahore", country: "Pakistan", desc: "Mughal architecture & vibrant food street" },
];

const BUDGET_TIERS = [
  {
    id: "budget",
    label: "Budget",
    sublabel: "PKR 3k–6k/day",
    icon: "💸",
    gradient: "from-emerald-500 to-teal-500",
    ring: "ring-emerald-500/40",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
  {
    id: "moderate",
    label: "Moderate",
    sublabel: "PKR 10k–18k/day",
    icon: "✈️",
    gradient: "from-blue-500 to-indigo-500",
    ring: "ring-blue-500/40",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
  {
    id: "luxury",
    label: "Luxury",
    sublabel: "PKR 30k–60k/day",
    icon: "👑",
    gradient: "from-amber-500 to-orange-500",
    ring: "ring-amber-500/40",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
] as const;

const INTERESTS = [
  { id: "culture", label: "Culture", icon: Landmark },
  { id: "food", label: "Food & Dining", icon: Utensils },
  { id: "adventure", label: "Adventure", icon: Mountain },
  { id: "nature", label: "Nature", icon: Waves },
  { id: "shopping", label: "Shopping", icon: ShoppingBag },
  { id: "photography", label: "Photography", icon: Camera },
  { id: "relaxation", label: "Relaxation", icon: Coffee },
  { id: "history", label: "History", icon: Landmark },
];

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

// ─── Animation Variants ───────────────────────────────────────────────────────
const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as number[] },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as number[] },
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatCost(n: number | undefined | null, currency = "PKR") {
  const num = typeof n === "number" && !isNaN(n) ? Math.round(n) : 0;
  return `${currency} ${num.toLocaleString("en-PK")}`;
}

/**
 * Ensures activities always display a realistic non-zero cost.
 * If Gemini returned 0 or undefined, calculates a dynamic fallback
 * based on the itinerary's category budget and the time slot.
 */
function getActivityCost(
  activity: any,
  slot: "morning" | "afternoon" | "evening" | string = "morning",
  budget?: Record<string, any>,
  durationDays: number = 3
): number {
  if (!activity || typeof activity === "string") return 1000;

  const explicitCost =
    activity?.estimated_cost ??
    activity?.cost ??
    activity?.estimatedCost ??
    activity?.price;

  if (typeof explicitCost === "number" && !isNaN(explicitCost) && explicitCost > 0) {
    return explicitCost;
  }
  if (typeof explicitCost === "string") {
    const parsed = parseFloat(explicitCost.replace(/[^0-9.]/g, ""));
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }

  const days = Math.max(1, durationDays);
  const category = activity?.category || "sightseeing";

  if (category === "food" && budget?.food_cost && budget.food_cost > 0) {
    const dailyFood = budget.food_cost / days;
    const factor = slot === "morning" ? 0.25 : slot === "evening" ? 0.4 : 0.35;
    return Math.max(500, Math.round((dailyFood * factor) / 50) * 50);
  }

  if (category === "travel" && budget?.transport_cost && budget.transport_cost > 0) {
    const dailyTransport = budget.transport_cost / days;
    const factor = slot === "afternoon" ? 0.4 : 0.3;
    return Math.max(400, Math.round((dailyTransport * factor) / 50) * 50);
  }

  if (
    (category === "sightseeing" || category === "leisure") &&
    budget?.activities_cost &&
    budget.activities_cost > 0
  ) {
    const dailyActivities = budget.activities_cost / days;
    const factor = slot === "afternoon" ? 0.45 : slot === "morning" ? 0.35 : 0.2;
    return Math.max(500, Math.round((dailyActivities * factor) / 50) * 50);
  }

  // Base slot/category sensible defaults if category budget wasn't granular
  const baseDefaults: Record<string, Record<string, number>> = {
    morning: { food: 950, sightseeing: 1200, travel: 600, leisure: 800 },
    afternoon: { food: 1600, sightseeing: 2200, travel: 900, leisure: 1400 },
    evening: { food: 2400, sightseeing: 1500, travel: 800, leisure: 1800 },
  };

  const slotKey = ["morning", "afternoon", "evening"].includes(slot) ? slot : "morning";
  return baseDefaults[slotKey]?.[category] ?? 1200;
}

// ─── Form Component ───────────────────────────────────────────────────────────
interface ExploreFormProps {
  onGenerate: (itinerary: GeneratedItinerary) => void;
}

function ExploreForm({ onGenerate }: ExploreFormProps) {
  const searchParams = useSearchParams();
  const initialDest = searchParams.get("destination") || "";
  const [destination, setDestination] = useState(initialDest);
  const [showDropdown, setShowDropdown] = useState(false);
  const [durationDays, setDurationDays] = useState(3);
  const [budgetTier, setBudgetTier] = useState<"budget" | "moderate" | "luxury">("moderate");
  const [interests, setInterests] = useState<string[]>(["nature", "food"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const paramDest = searchParams.get("destination");
    if (paramDest) {
      setDestination(paramDest);
    }
  }, [searchParams]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredDestinations = POPULAR_DESTINATIONS.filter(
    (d) =>
      d.name.toLowerCase().includes(destination.toLowerCase()) ||
      d.country.toLowerCase().includes(destination.toLowerCase())
  );

  const toggleInterest = useCallback((id: string) => {
    setInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const selectDestination = (name: string) => {
    setDestination(name);
    setShowDropdown(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) {
      setError("Please enter or select a destination.");
      return;
    }
    if (interests.length === 0) {
      setError("Select at least one interest tag.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, durationDays, budgetTier, interests }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        throw new Error(
          res.status === 504
            ? "Generation timed out on server. Please try a shorter duration or retry."
            : `Server returned an unparseable response (HTTP ${res.status}).`
        );
      }

      if (!res.ok) {
        throw new Error(data?.error || data?.details || "Generation failed.");
      }
      setLoading(false);
      console.log("Generated itinerary received on client:", data);
      onGenerate(data as GeneratedItinerary);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
      setLoading(false);
    }
  };

  const selectedBudget = BUDGET_TIERS.find((b) => b.id === budgetTier)!;

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-2xl mx-auto"
    >
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10 text-slate-300 text-xs font-semibold mb-5"
        >
          <Compass size={12} className="text-cyan-400" />
          Interactive Trip Planning
        </motion.div>
        <h1 className="text-3xl xs:text-4xl sm:text-5xl font-black text-white mb-3 tracking-tight">
          Where to{" "}
          <span className="shimmer-text">next?</span>
        </h1>
        <p className="text-slate-400 text-base">
          Tell us your dream, we craft the perfect itinerary.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ── Destination with Dropdown & Autocomplete ── */}
        <motion.div
          variants={staggerItem}
          initial="hidden"
          animate="visible"
          className="glass rounded-2xl p-5 relative"
          ref={dropdownRef}
        >
          <label
            htmlFor="destination-input"
            className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3"
          >
            <MapPin size={13} className="text-cyan-400" />
            Destination
          </label>

          <div className="relative">
            <input
              id="destination-input"
              list="popular-destinations-datalist"
              type="text"
              autoComplete="off"
              value={destination}
              onFocus={() => setShowDropdown(true)}
              onChange={(e) => {
                setDestination(e.target.value);
                setShowDropdown(true);
                setError(null);
              }}
              placeholder="e.g. Hunza Valley, Dubai, Tokyo, Paris…"
              className="w-full bg-transparent text-white text-lg font-semibold placeholder:text-slate-600 placeholder:font-normal focus:outline-none border-b border-white/10 focus:border-blue-500/50 pb-2 transition-colors pr-8"
            />
            <Search
              size={18}
              className="absolute right-0 bottom-3 text-slate-500 pointer-events-none"
            />
          </div>

          {/* HTML5 Native Datalist */}
          <datalist id="popular-destinations-datalist">
            {POPULAR_DESTINATIONS.map((dest) => (
              <option key={dest.name} value={dest.name}>
                {dest.country}
              </option>
            ))}
          </datalist>

          {/* Filtered Dropdown Menu */}
          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.18 }}
                className="absolute left-0 right-0 top-full mt-2 z-50 glass-strong rounded-2xl border border-white/15 p-2 shadow-2xl max-h-60 overflow-y-auto backdrop-blur-xl"
              >
                <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Popular Suggestions
                </div>
                {filteredDestinations.length > 0 ? (
                  filteredDestinations.map((dest) => (
                    <button
                      key={dest.name}
                      type="button"
                      onClick={() => selectDestination(dest.name)}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-white/10 flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                          <MapPin size={13} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                            {dest.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            {dest.country} · {dest.desc}
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-3 text-xs text-slate-400 text-center">
                    No matching destinations. Press enter to use &quot;{destination}&quot;.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick select pills */}
          <div className="mt-3 flex flex-wrap gap-2 items-center">
            <span className="text-[11px] text-slate-500 font-medium">Quick select:</span>
            {POPULAR_DESTINATIONS.slice(0, 5).map((dest) => (
              <button
                key={dest.name}
                type="button"
                onClick={() => selectDestination(dest.name)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                  destination.toLowerCase() === dest.name.toLowerCase()
                    ? "bg-blue-500/20 border-blue-500/50 text-blue-300 font-semibold"
                    : "border-white/10 text-slate-400 hover:text-white hover:bg-white/5 hover:border-white/20"
                }`}
              >
                {dest.name}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Duration ── */}
        <motion.div
          variants={staggerItem}
          initial="hidden"
          animate="visible"
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <Clock size={13} className="text-cyan-400" />
              Duration
            </label>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-white">
                {durationDays}
              </span>
              <span className="text-slate-400 text-sm font-medium">
                {durationDays === 1 ? "day" : "days"}
              </span>
            </div>
          </div>
          <div className="relative">
            <input
              type="range"
              min={1}
              max={7}
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #8b5cf6 ${((durationDays - 1) / 6) * 100}%, rgba(255,255,255,0.1) ${((durationDays - 1) / 6) * 100}%, rgba(255,255,255,0.1) 100%)`,
              }}
            />
            <div className="flex justify-between mt-2">
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDurationDays(d)}
                  className={`text-xs font-medium w-6 text-center transition-colors ${
                    d === durationDays
                      ? "text-blue-400 font-bold"
                      : "text-slate-600 hover:text-slate-400"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── Budget Tier (Z-Index Fixed) ── */}
        <motion.div
          variants={staggerItem}
          initial="hidden"
          animate="visible"
          className="glass rounded-2xl p-5"
        >
          <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            <Wallet size={13} className="text-cyan-400" />
            Budget Tier
          </label>
          <div className="grid grid-cols-1 xs:grid-cols-3 gap-3">
            {BUDGET_TIERS.map((tier) => {
              const isSelected = budgetTier === tier.id;
              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setBudgetTier(tier.id)}
                  className={`relative flex flex-col xs:flex-col items-center gap-2 p-3 xs:p-4 rounded-xl border transition-all duration-200 overflow-hidden ${
                    isSelected
                      ? `${tier.border} ring-2 ${tier.ring} scale-[1.03] bg-white/5`
                      : "border-white/10 bg-white/3 hover:bg-white/5 hover:border-white/20"
                  }`}
                >
                  {/* Active highlight background positioned underneath */}
                  {isSelected && (
                    <motion.div
                      layoutId="budget-selected"
                      className={`absolute inset-0 rounded-xl bg-gradient-to-br ${tier.gradient} opacity-20 pointer-events-none z-0`}
                    />
                  )}
                  {/* Explicit relative z-10 text-white content */}
                  <span className="text-2xl relative z-10 transition-transform">
                    {tier.icon}
                  </span>
                  <span className="text-sm font-bold text-white relative z-10 tracking-tight">
                    {tier.label}
                  </span>
                  <span className="text-xs text-slate-300 relative z-10 text-center leading-tight font-medium">
                    {tier.sublabel}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* ── Interests ── */}
        <motion.div
          variants={staggerItem}
          initial="hidden"
          animate="visible"
          className="glass rounded-2xl p-5"
        >
          <label className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
            <Tags size={13} className="text-cyan-400" />
            Interests
            <span className="text-slate-600 font-normal normal-case tracking-normal">
              (select all that apply)
            </span>
          </label>
          <div className="flex flex-wrap gap-2.5">
            {INTERESTS.map(({ id, label, icon: Icon }) => {
              const active = interests.includes(id);
              return (
                <motion.button
                  key={id}
                  type="button"
                  onClick={() => toggleInterest(id)}
                  whileTap={{ scale: 0.95 }}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                    active
                      ? "bg-blue-500/15 border-blue-500/40 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.15)]"
                      : "border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <Icon size={13} />
                  {label}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Error banner with complete details */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-2.5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-sm leading-relaxed"
            >
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-200">Generation Error</p>
                <p className="text-xs text-rose-300/90 mt-0.5">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary bar + CTA */}
        <motion.div
          variants={staggerItem}
          initial="hidden"
          animate="visible"
          className="glass-strong rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-4"
        >
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 mb-1">Generating plan for</p>
            <p className="text-white font-bold text-base truncate">
              {destination || "your destination"} ·{" "}
              <span className="text-blue-400">{durationDays}d</span> ·{" "}
              <span
                className={`bg-gradient-to-r ${selectedBudget.gradient} bg-clip-text text-transparent`}
              >
                {selectedBudget.label}
              </span>
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="glow-btn relative flex-shrink-0 inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-white text-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none w-full sm:w-auto justify-center"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Crafting your plan…
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Craft Itinerary
                <ChevronRight size={14} />
              </>
            )}
          </button>
        </motion.div>
      </form>

      {/* Loading overlay shimmer */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#020510]/80 backdrop-blur-sm"
          >
            <div className="glass-strong rounded-3xl p-10 text-center max-w-sm mx-4">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-ping" />
                <div
                  className="absolute inset-2 rounded-full border-2 border-violet-500/30 animate-spin"
                  style={{ animationDuration: "2s" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles size={28} className="text-blue-400" />
                </div>
              </div>
              <h3 className="text-white font-bold text-lg mb-2">
                Crafting your itinerary
              </h3>
              <GeneratingSteps />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Animated generation steps ────────────────────────────────────────────────
const GENERATION_STEPS = [
  "Analyzing local spots…",
  "Optimizing daily routes…",
  "Calculating budget breakdown…",
  "Finalizing your plan…",
];

function GeneratingSteps() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((s) => (s + 1) % GENERATION_STEPS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={step}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="text-slate-400 text-sm"
      >
        {GENERATION_STEPS[step]}
      </motion.p>
    </AnimatePresence>
  );
}

// ─── Itinerary View ───────────────────────────────────────────────────────────
interface ItineraryViewProps {
  itinerary: GeneratedItinerary;
  onReset: () => void;
}

function ItineraryView({ itinerary, onReset }: ItineraryViewProps) {
  console.log("Generated itinerary received on client (ItineraryView):", itinerary);

  const [activeDay, setActiveDay] = useState(0);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [savedTripId, setSavedTripId] = useState<string | null>(null);

  // 1. Safe fallbacks for data, days, and budget
  const data = (itinerary || {}) as any;
  const days: any[] = Array.isArray(data?.days) ? data.days : [];
  const budget: Record<string, any> =
    data?.budget && typeof data.budget === "object" && !Array.isArray(data.budget)
      ? data.budget
      : {};

  // 2. Safe snake_case / camelCase property reading
  const destination = data?.destination || "Your Destination";
  const durationDays = Number(data?.duration_days ?? data?.durationDays) || days.length || 1;
  const budgetTier = (data?.budget_tier ?? data?.budgetTier ?? "budget") as string;
  const currency = budget?.currency || "PKR";

  // 3. Safe budget calculation
  const totalBudget =
    typeof budget?.total_estimated_cost === "number" && budget.total_estimated_cost > 0
      ? budget.total_estimated_cost
      : Object.values(budget).reduce((acc: number, curr: any) => acc + (Number(curr) || 0), 0);

  const budgetMeta =
    BUDGET_TIERS.find((b) => b.id === budgetTier) ?? BUDGET_TIERS[0] ?? {
      id: "budget",
      label: "Budget",
      icon: "💸",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/25",
    };

  // Safe active day resolution
  const displayDays = Array.isArray(days) && days.length > 0
    ? days
    : [{ day_number: 1, theme: "Daily Schedule", activities: [] }];

  const currentDayIndex = activeDay < displayDays.length ? activeDay : 0;
  const day = displayDays[currentDayIndex] || {
    day_number: 1,
    theme: "Daily Schedule",
    activities: [],
  };

  const dayNumber = day?.day_number ?? day?.dayNumber ?? (currentDayIndex + 1);
  const dayTheme = day?.theme || "Daily Schedule";

  // Check both activities and slots per requirement 4
  const activities: any[] = day.activities || (day.slots ? Object.values(day.slots).flat() : []);

  const handleSaveTrip = async () => {
    try {
      setSaveStatus("saving");
      setSaveError(null);

      // 1. Client-side auth check
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setSaveStatus("idle");
          setShowAuthModal(true);
          return;
        }
      } catch {
        // Fall back to server auth verification
      }

      // 2. Call save API with normalized snake_case payload
      const res = await fetch("/api/trips/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          destination,
          duration_days: durationDays,
          budget_tier: budgetTier,
          days,
          budget: {
            ...budget,
            total_estimated_cost: totalBudget,
            currency,
          },
        }),
      });

      if (res.status === 401) {
        setSaveStatus("idle");
        setShowAuthModal(true);
        return;
      }

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to save trip.");
      }

      setSaveStatus("saved");
      setSavedTripId(resData.tripId);
      setShowToast(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving trip.";
      setSaveError(msg);
      setSaveStatus("error");
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-4xl mx-auto"
    >
      {/* ── Sub-Navigation & Quick Action Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-6 mb-6 border-b border-white/10">
        {/* Left: Back / Reset navigation & dashboard link */}
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl glass border border-white/10 hover:border-white/20 text-slate-200 hover:text-white hover:bg-white/10 text-xs font-semibold transition-all group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>New Itinerary</span>
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 text-xs font-medium transition-colors"
          >
            <LayoutDashboard size={13} className="text-cyan-400" />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* Right: Save trip / Saved state */}
        <div className="flex items-center gap-2">
          {saveStatus === "saved" ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-bold">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>Trip Saved!</span>
              </span>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
              >
                <span>View in Dashboard &rarr;</span>
              </Link>
            </div>
          ) : (
            <button
              onClick={handleSaveTrip}
              disabled={saveStatus === "saving"}
              className="glow-btn inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white transition-all disabled:opacity-60 shadow-lg shadow-blue-500/20"
            >
              {saveStatus === "saving" ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Saving Trip…</span>
                </>
              ) : (
                <>
                  <Star size={14} />
                  <span>Save Trip</span>
                </>
              )}
            </button>
          )}
          {saveError && (
            <span className="text-xs text-rose-400 ml-2">
              {saveError}
            </span>
          )}
        </div>
      </div>

      {/* ── Itinerary Hero Header ── */}
      <div className="glass rounded-3xl p-6 sm:p-8 mb-8 border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-slate-300">
                <MapPin size={12} className="text-cyan-400" />
                Customized Itinerary
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${budgetMeta.bg} ${budgetMeta.border} border`}
              >
                <span>{budgetMeta.icon}</span>
                {budgetMeta.label} Tier
              </span>
            </div>

            <h1 className="text-2xl xs:text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              {destination}
            </h1>

            <div className="flex items-center gap-4 mt-3 text-sm text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-cyan-400" />
                {durationDays} Days Customized Schedule
              </span>
            </div>
          </div>

          <div className="text-left md:text-right p-4 rounded-2xl bg-white/5 border border-white/10 flex-shrink-0">
            <span className="text-xs uppercase font-bold text-slate-400 block tracking-wider mb-1">
              Estimated Total Budget
            </span>
            <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              {formatCost(totalBudget, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Budget Overview ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass rounded-2xl p-5 mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
            <TrendingUp size={14} className="text-cyan-400" />
            Budget Breakdown
          </h2>
          <span className="text-xl font-black text-white">
            {formatCost(totalBudget, currency)}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Stay", val: Number(budget?.accommodation_cost ?? budget?.accommodationCost) || 0, icon: Home, color: "text-violet-400" },
            { label: "Food", val: Number(budget?.food_cost ?? budget?.foodCost) || 0, icon: Utensils, color: "text-orange-400" },
            { label: "Transport", val: Number(budget?.transport_cost ?? budget?.transportCost) || 0, icon: Bus, color: "text-blue-400" },
            { label: "Activities", val: Number(budget?.activities_cost ?? budget?.activitiesCost) || 0, icon: Activity, color: "text-emerald-400" },
            { label: "Misc", val: Number(budget?.misc_cost ?? budget?.miscCost) || 0, icon: Package, color: "text-rose-400" },
          ].map(({ label, val, icon: Icon, color }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/4 text-center"
            >
              <Icon size={15} className={color} />
              <span className="text-xs text-slate-500 font-medium">{label}</span>
              <span className="text-xs font-bold text-white">
                {formatCost(val, currency)}
              </span>
            </div>
          ))}
        </div>
        {/* Budget bar */}
        <div className="mt-4 flex gap-1 h-1.5 rounded-full overflow-hidden">
          {[
            { val: Number(budget?.accommodation_cost ?? budget?.accommodationCost) || 0, color: "bg-violet-500" },
            { val: Number(budget?.food_cost ?? budget?.foodCost) || 0, color: "bg-orange-500" },
            { val: Number(budget?.transport_cost ?? budget?.transportCost) || 0, color: "bg-blue-500" },
            { val: Number(budget?.activities_cost ?? budget?.activitiesCost) || 0, color: "bg-emerald-500" },
            { val: Number(budget?.misc_cost ?? budget?.miscCost) || 0, color: "bg-rose-500" },
          ].map(({ val, color }, i) => (
            <motion.div
              key={i}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.5, ease: "easeOut" }}
              style={{
                flex: totalBudget > 0 ? Math.max(0.05, val / totalBudget) : 1,
                transformOrigin: "left",
              }}
              className={`${color} rounded-full`}
            />
          ))}
        </div>
      </motion.div>

      {/* ── Day Tabs ── */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-thin">
        {displayDays.map((d: any, i: number) => {
          const tabNumber = d?.day_number ?? d?.dayNumber ?? (i + 1);
          return (
            <button
              key={tabNumber}
              onClick={() => setActiveDay(i)}
              className={`flex-shrink-0 flex flex-col items-center gap-1 px-5 py-3 rounded-xl text-sm font-bold border transition-all duration-200 ${
                currentDayIndex === i
                  ? "bg-blue-500/15 border-blue-500/40 text-white shadow-[0_0_16px_rgba(59,130,246,0.2)]"
                  : "border-white/10 text-slate-400 hover:text-white hover:border-white/20"
              }`}
            >
              <span className="text-xs text-slate-500 font-medium">Day</span>
              <span>{tabNumber}</span>
            </button>
          );
        })}
      </div>

      {/* ── Day Detail ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentDayIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Day theme */}
          {dayTheme && (
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-1 h-8 rounded-full bg-gradient-to-b from-blue-500 to-violet-500" />
              <div>
                <p className="text-xs text-slate-500 font-medium">Day {dayNumber} Theme</p>
                <p className="text-white font-bold">{dayTheme}</p>
              </div>
            </div>
          )}

          {/* Activities list safely checking both activities and slots */}
          {Array.isArray(activities) && activities.length > 0 ? (
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              {activities.map((act: any, ai: number) => {
                if (!act) return null;
                const isString = typeof act === "string";
                const actTitle = isString
                  ? act
                  : act?.title || act?.name || act?.activity || `Activity ${ai + 1}`;
                const category = (!isString && act?.category) || "sightseeing";
                const CatIcon = CATEGORY_ICONS[category] ?? Sparkles;
                const catColor = CATEGORY_COLORS[category] ?? "text-slate-400 bg-white/5";
                const locationName = !isString
                  ? act?.location_name ?? act?.locationName ?? act?.location ?? ""
                  : "";
                const description = !isString ? act?.description ?? act?.details ?? "" : "";
                const rawSlot = !isString
                  ? act?.slot ?? act?.time_slot ?? act?.timeSlot ?? ""
                  : "";
                const slotName = typeof rawSlot === "string" ? rawSlot : "";
                const displayCost = !isString
                  ? getActivityCost(act, slotName || "morning", budget, durationDays)
                  : 0;

                return (
                  <motion.div
                    key={ai}
                    variants={staggerItem}
                    className="glass rounded-2xl p-4 sm:p-5 hover:bg-white/5 transition-all border border-white/5"
                  >
                    <div className="flex items-start gap-4">
                      {/* Category badge */}
                      <div
                        className={`w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center mt-0.5 ${catColor}`}
                      >
                        <CatIcon size={16} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm sm:text-base font-bold text-white leading-snug">
                              {actTitle}
                            </h4>
                            {slotName && (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/5 text-cyan-400 border border-white/10">
                                {slotName}
                              </span>
                            )}
                          </div>
                          {displayCost > 0 && (
                            <span className="flex-shrink-0 text-xs sm:text-sm font-bold text-emerald-400">
                              {formatCost(displayCost, currency)}
                            </span>
                          )}
                        </div>
                        {locationName && (
                          <p className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                            <MapPin size={11} className="text-cyan-400 flex-shrink-0" />
                            <span>{locationName}</span>
                          </p>
                        )}
                        {description && (
                          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                            {description}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <div className="glass rounded-2xl p-8 text-center text-slate-400 border border-white/5">
              <Compass size={24} className="mx-auto mb-2 text-cyan-400 opacity-60" />
              <p className="text-sm font-semibold text-white">No activities listed for this day</p>
              <p className="text-xs text-slate-400 mt-1">
                Enjoy open leisure time to explore {destination} at your own pace.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── Success Toast Notification ── */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 z-50 max-w-md w-[calc(100%-3rem)] sm:w-auto p-4 rounded-2xl glass border border-emerald-500/40 bg-slate-900/95 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={20} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Trip saved successfully!</p>
                <p className="text-xs text-slate-400">
                  Your itinerary is now stored in your personal dashboard.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white text-xs font-bold hover:from-blue-500 hover:to-violet-500 shadow-md shadow-blue-500/20 transition-all flex-shrink-0"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={() => setShowToast(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close notification"
              >
                <X size={15} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Auth Prompt Modal ── */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl glass border border-white/15 bg-slate-900/95 shadow-2xl z-10 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
                <Lock size={22} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Sign in to Save Your Trip
              </h3>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                Log in or create a free account to store this customized itinerary in your dashboard, access it from any device, and manage your trips.
              </p>

              <div className="flex flex-col gap-3">
                <Link
                  href="/auth?mode=login&redirect=/explore"
                  className="w-full py-3.5 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-lg shadow-blue-500/25 transition-all"
                >
                  Sign In / Create Free Account
                </Link>
                <button
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="w-full py-3 rounded-xl font-semibold text-slate-400 hover:text-white text-sm hover:bg-white/5 transition-colors"
                >
                  Continue Browsing
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ExplorePage() {
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);

  console.log("Generated itinerary received on client (ExplorePage):", itinerary);

  return (
    <div className="min-h-screen bg-[#020510] text-slate-100 flex flex-col justify-between noise-overlay">
      {/* Global Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="pt-28 pb-20 px-3 sm:px-4 max-w-7xl mx-auto w-full flex-1">
        {/* Background Gradients */}
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-700/10 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-700/10 blur-[100px]" />
        </div>

        {itinerary ? (
          <ErrorBoundary
            onReset={() => setItinerary(null)}
            title="Unable to Display Itinerary"
            description="A rendering error occurred while laying out this itinerary. You can craft a new itinerary or reset the view."
          >
            <ItineraryView
              itinerary={itinerary}
              onReset={() => setItinerary(null)}
            />
          </ErrorBoundary>
        ) : (
          <Suspense fallback={<div className="w-full py-12 flex justify-center text-slate-500 text-sm">Loading explorer...</div>}>
            <ExploreForm
              onGenerate={(data) => {
                console.log("Generated itinerary received on client:", data);
                setItinerary(data);
              }}
            />
          </Suspense>
        )}
      </main>
    </div>
  );
}
