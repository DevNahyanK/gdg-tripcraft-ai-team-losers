"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Clock,
  Wallet,
  Tags,
  Sparkles,
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
function formatCost(n: number) {
  return `PKR ${n.toLocaleString("en-PK")}`;
}

// ─── Form Component ───────────────────────────────────────────────────────────
interface ExploreFormProps {
  onGenerate: (itinerary: GeneratedItinerary) => void;
}

function ExploreForm({ onGenerate }: ExploreFormProps) {
  const [destination, setDestination] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [durationDays, setDurationDays] = useState(3);
  const [budgetTier, setBudgetTier] = useState<"budget" | "moderate" | "luxury">("moderate");
  const [interests, setInterests] = useState<string[]>(["nature", "food"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

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

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.details || "Generation failed.");
      }
      onGenerate(data as GeneratedItinerary);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
    } finally {
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
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border-blue-500/30 text-blue-300 text-xs font-semibold mb-5"
        >
          <Sparkles size={12} />
          AI-Powered Planning
        </motion.div>
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-3 tracking-tight">
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
          <div className="grid grid-cols-3 gap-3">
            {BUDGET_TIERS.map((tier) => {
              const isSelected = budgetTier === tier.id;
              return (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setBudgetTier(tier.id)}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 overflow-hidden ${
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
  const [activeDay, setActiveDay] = useState(0);

  const day = itinerary.days[activeDay];
  const { budget } = itinerary;

  const budgetMeta = BUDGET_TIERS.find((b) => b.id === itinerary.budget_tier)!;

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full max-w-4xl mx-auto"
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white text-sm font-medium transition-colors mb-3"
          >
            <ArrowLeft size={14} />
            New Itinerary
          </button>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
            {itinerary.destination}
          </h1>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className="flex items-center gap-1.5 text-slate-400 text-sm">
              <Calendar size={13} className="text-cyan-400" />
              {itinerary.duration_days} days
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${budgetMeta.bg} ${budgetMeta.border} border`}
            >
              <span>{budgetMeta.icon}</span>
              {budgetMeta.label}
            </span>
          </div>
        </div>

        {/* Save button placeholder */}
        <button className="glow-btn flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white">
          <Star size={14} />
          Save Trip
        </button>
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
            {formatCost(budget.total_estimated_cost)}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Stay", val: budget.accommodation_cost, icon: Home, color: "text-violet-400" },
            { label: "Food", val: budget.food_cost, icon: Utensils, color: "text-orange-400" },
            { label: "Transport", val: budget.transport_cost, icon: Bus, color: "text-blue-400" },
            { label: "Activities", val: budget.activities_cost, icon: Activity, color: "text-emerald-400" },
            { label: "Misc", val: budget.misc_cost, icon: Package, color: "text-rose-400" },
          ].map(({ label, val, icon: Icon, color }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/4 text-center"
            >
              <Icon size={15} className={color} />
              <span className="text-xs text-slate-500 font-medium">{label}</span>
              <span className="text-xs font-bold text-white">
                {formatCost(val)}
              </span>
            </div>
          ))}
        </div>
        {/* Budget bar */}
        <div className="mt-4 flex gap-1 h-1.5 rounded-full overflow-hidden">
          {[
            { val: budget.accommodation_cost, color: "bg-violet-500" },
            { val: budget.food_cost, color: "bg-orange-500" },
            { val: budget.transport_cost, color: "bg-blue-500" },
            { val: budget.activities_cost, color: "bg-emerald-500" },
            { val: budget.misc_cost, color: "bg-rose-500" },
          ].map(({ val, color }, i) => (
            <motion.div
              key={i}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.5, ease: "easeOut" }}
              style={{
                flex: val / (budget.total_estimated_cost || 1),
                transformOrigin: "left",
              }}
              className={`${color} rounded-full`}
            />
          ))}
        </div>
      </motion.div>

      {/* ── Day Tabs ── */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-thin">
        {itinerary.days.map((d, i) => (
          <button
            key={d.day_number}
            onClick={() => setActiveDay(i)}
            className={`flex-shrink-0 flex flex-col items-center gap-1 px-5 py-3 rounded-xl text-sm font-bold border transition-all duration-200 ${
              activeDay === i
                ? "bg-blue-500/15 border-blue-500/40 text-white shadow-[0_0_16px_rgba(59,130,246,0.2)]"
                : "border-white/10 text-slate-400 hover:text-white hover:border-white/20"
            }`}
          >
            <span className="text-xs text-slate-500 font-medium">Day</span>
            <span>{d.day_number}</span>
          </button>
        ))}
      </div>

      {/* ── Day Detail ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeDay}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Day theme */}
          {day.theme && (
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-1 h-8 rounded-full bg-gradient-to-b from-blue-500 to-violet-500" />
              <div>
                <p className="text-xs text-slate-500 font-medium">Day {day.day_number} Theme</p>
                <p className="text-white font-bold">{day.theme}</p>
              </div>
            </div>
          )}

          {/* Time slots */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            {(["morning", "afternoon", "evening"] as const).map((slot) => {
              const meta = SLOT_META[slot];
              const activities = day.slots[slot];
              if (!activities?.length) return null;

              return (
                <motion.div
                  key={slot}
                  variants={staggerItem}
                  className="glass rounded-2xl overflow-hidden"
                >
                  {/* Slot header */}
                  <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-white/5">
                    <meta.icon size={14} className={meta.color} />
                    <span className={`text-sm font-bold ${meta.color}`}>
                      {meta.label}
                    </span>
                    <span className="text-xs text-slate-600 ml-auto">
                      {activities.length} {activities.length === 1 ? "activity" : "activities"}
                    </span>
                  </div>

                  {/* Activities */}
                  <div className="divide-y divide-white/5">
                    {activities.map((act, ai) => {
                      const CatIcon = CATEGORY_ICONS[act.category] ?? Sparkles;
                      const catColor = CATEGORY_COLORS[act.category] ?? "text-slate-400 bg-white/5";
                      return (
                        <motion.div
                          key={ai}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: ai * 0.07 }}
                          className="flex items-start gap-4 px-5 py-4 hover:bg-white/3 transition-colors"
                        >
                          {/* Category badge */}
                          <div
                            className={`w-8 h-8 flex-shrink-0 rounded-xl flex items-center justify-center mt-0.5 ${catColor}`}
                          >
                            <CatIcon size={14} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="text-sm font-bold text-white leading-snug">
                                {act.title}
                              </h4>
                              <span className="flex-shrink-0 text-xs font-semibold text-emerald-400">
                                {formatCost(act.estimated_cost)}
                              </span>
                            </div>
                            {act.location_name && (
                              <p className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                                <MapPin size={9} />
                                {act.location_name}
                              </p>
                            )}
                            {act.description && (
                              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                                {act.description}
                              </p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ExplorePage() {
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);

  return (
    <main className="min-h-screen bg-[#020510] pt-24 pb-16 px-4">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-700/8 blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-violet-700/8 blur-[80px]" />
      </div>

      <AnimatePresence mode="wait">
        {!itinerary ? (
          <ExploreForm key="form" onGenerate={setItinerary} />
        ) : (
          <ItineraryView
            key="itinerary"
            itinerary={itinerary}
            onReset={() => setItinerary(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
