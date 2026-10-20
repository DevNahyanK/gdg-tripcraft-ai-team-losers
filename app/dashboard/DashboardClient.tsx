"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Calendar,
  Wallet,
  TrendingUp,
  Compass,
  Sparkles,
  Trash2,
  Eye,
  Globe,
  Clock,
  LogOut,
  User,
  Plus,
  Star,
  BarChart3,
  Plane,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import type { SavedTrip } from "@/lib/schemas";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Profile {
  full_name: string | null;
  avatar_url: string | null;
  email: string;
}

interface Props {
  trips: SavedTrip[];
  profile: Profile;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const BUDGET_META = {
  budget: { label: "Budget", icon: "💸", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/25" },
  moderate: { label: "Moderate", icon: "✈️", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/25" },
  luxury: { label: "Luxury", icon: "👑", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/25" },
};

const DESTINATION_GRADIENTS = [
  "from-blue-600 to-cyan-500",
  "from-violet-600 to-purple-500",
  "from-pink-600 to-rose-500",
  "from-amber-500 to-orange-500",
  "from-teal-500 to-emerald-500",
  "from-indigo-600 to-blue-500",
];

// ─── Animation Variants ───────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as number[] },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as number[],
    },
  }),
  exit: {
    opacity: 0,
    scale: 0.92,
    y: -10,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatCost(n: number, currency: string) {
  return `${currency} ${n.toLocaleString("en-PK")}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name: string | null, email: string) {
  if (name) {
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  gradient,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  gradient: string;
  delay: number;
}) {
  return (
    <motion.div
      variants={itemVariants}
      custom={delay}
      className="glass rounded-2xl p-5 relative overflow-hidden group hover:bg-white/5 transition-colors duration-300"
    >
      <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br ${gradient} opacity-10 group-hover:opacity-15 transition-opacity blur-xl`} />
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg`}>
        <Icon size={18} className="text-white" />
      </div>
      <p className="text-xl sm:text-2xl font-black text-white mb-0.5">{value}</p>
      <p className="text-xs font-bold text-slate-300">{label}</p>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </motion.div>
  );
}

// ─── Trip Card ────────────────────────────────────────────────────────────────
function TripCard({
  trip,
  index,
  onDelete,
}: {
  trip: SavedTrip;
  index: number;
  onDelete: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const supabase = createClient();
  const meta = BUDGET_META[trip.budget_tier];
  const gradient = DESTINATION_GRADIENTS[index % DESTINATION_GRADIENTS.length];

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    setDeleting(true);
    const { error } = await supabase.from("trips").delete().eq("id", trip.id);
    if (!error) {
      onDelete(trip.id);
    } else {
      console.error("Delete failed:", error.message);
      setDeleting(false);
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      custom={index}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      className="glass rounded-2xl overflow-hidden group hover:bg-white/5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30"
    >
      {/* Destination header */}
      <div className={`relative h-28 bg-gradient-to-br ${gradient} p-5 flex flex-col justify-between overflow-hidden`}>
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 50%)"
          }}
        />
        <div className="flex items-start justify-between">
          <div className="w-9 h-9 rounded-xl bg-black/20 backdrop-blur-sm flex items-center justify-center">
            <Plane size={16} className="text-white" />
          </div>
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-black/20 backdrop-blur-sm text-white`}>
            {meta.icon} {meta.label}
          </span>
        </div>
        <div>
          <h3 className="text-white font-black text-lg leading-tight drop-shadow-sm">
            {trip.destination}
          </h3>
        </div>
      </div>

      {/* Trip details */}
      <div className="p-5">
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="flex items-center gap-2">
            <Calendar size={13} className="text-slate-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Duration</p>
              <p className="text-sm font-bold text-white">
                {trip.duration_days} {trip.duration_days === 1 ? "day" : "days"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Wallet size={13} className="text-slate-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Est. Cost</p>
              <p className="text-sm font-bold text-white">
                {formatCost(trip.total_estimated_cost, trip.currency)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <Clock size={13} className="text-slate-500 flex-shrink-0" />
            <p className="text-xs text-slate-500">
              Saved on {formatDate(trip.created_at)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/itinerary/${trip.id}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-white/10 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 hover:border-white/20 transition-all duration-200"
          >
            <Eye size={13} />
            View
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 ${
              confirmDelete
                ? "border-rose-500/40 bg-rose-500/10 text-rose-400"
                : "border-white/10 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/5"
            } disabled:opacity-40`}
          >
            <Trash2 size={13} />
            {confirmDelete ? "Sure?" : deleting ? "…" : ""}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="col-span-full flex flex-col items-center justify-center py-20 text-center"
    >
      {/* Animated globe illustration */}
      <div className="relative mb-8">
        <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-3xl scale-150 animate-pulse-slow" />
        <div className="relative w-32 h-32 rounded-full glass border border-blue-500/20 flex items-center justify-center">
          <div className="absolute inset-3 rounded-full border border-blue-500/10 animate-spin" style={{ animationDuration: "8s" }} />
          <Globe size={48} className="text-blue-400" strokeWidth={1.5} />
          {/* Orbiting dot */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          </motion.div>
        </div>
      </div>

      <h2 className="text-2xl font-black text-white mb-3">
        No trips planned yet
      </h2>
      <p className="text-slate-400 text-base max-w-sm mb-8 leading-relaxed">
        Your dashboard is ready. Explore destinations, craft your custom
        itinerary, then save and track it here.
      </p>

      {/* Feature hints */}
      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {["3D Globe Explorer", "Multi-Day Schedules", "Budget Breakdown"].map(
          (feat) => (
            <span
              key={feat}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass border border-white/10 text-xs font-semibold text-slate-300"
            >
              <Compass size={11} className="text-cyan-400" />
              {feat}
            </span>
          )
        )}
      </div>

      <Link
        href="/explore"
        className="glow-btn inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-white text-sm shadow-2xl shadow-blue-500/25"
      >
        <Compass size={16} />
        Start Exploring
        <Plus size={14} />
      </Link>
    </motion.div>
  );
}

// ─── Main Client Component ────────────────────────────────────────────────────
export default function DashboardClient({ trips: initialTrips, profile }: Props) {
  const [trips, setTrips] = useState<SavedTrip[]>(initialTrips);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = (id: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  // ── Stats ────────────────────────────────────────────────────────────────────
  const totalDays = trips.reduce((sum, t) => sum + t.duration_days, 0);
  const totalSpend = trips.reduce((sum, t) => sum + t.total_estimated_cost, 0);
  const destinations = new Set(trips.map((t) => t.destination)).size;

  const displayName = profile.full_name ?? profile.email.split("@")[0];
  const initials = getInitials(profile.full_name, profile.email);

  return (
    <main className="min-h-screen bg-[#020510]">
      {/* ── Background ── */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-0 w-[600px] h-[400px] rounded-full bg-blue-700/6 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full bg-violet-700/6 blur-[100px]" />
      </div>

      {/* ── Top Nav ── */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-40 border-b border-white/5 bg-[#020510]/80 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/35 transition-shadow">
              <Compass size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-white text-lg tracking-tight hidden sm:block">
              TripCraft{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">AI</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/explore"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">New Trip</span>
            </Link>

            {/* Avatar */}
            <div className="flex items-center gap-2.5 glass rounded-xl px-3 py-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-xs font-black text-white">
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt={displayName} className="w-full h-full rounded-lg object-cover" />
                ) : (
                  initials
                )}
              </div>
              <span className="text-sm font-semibold text-white hidden sm:block max-w-[120px] truncate">
                {displayName}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* ── Welcome Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="mb-8"
        >
          <p className="text-slate-500 text-sm font-medium mb-1">
            Welcome back,
          </p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
            {displayName} 👋
          </h1>
        </motion.div>

        {/* ── Stats Bento Row ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
        >
          <StatCard
            icon={Plane}
            label="Trips Planned"
            value={trips.length}
            sub={trips.length === 1 ? "itinerary saved" : "itineraries saved"}
            gradient="from-blue-500 to-cyan-500"
            delay={0}
          />
          <StatCard
            icon={Calendar}
            label="Days Planned"
            value={totalDays}
            sub="across all trips"
            gradient="from-violet-500 to-purple-500"
            delay={1}
          />
          <StatCard
            icon={Globe}
            label="Destinations"
            value={destinations}
            sub="unique locations"
            gradient="from-teal-500 to-emerald-500"
            delay={2}
          />
          <StatCard
            icon={TrendingUp}
            label="Total Budget"
            value={totalSpend > 0 ? `${(totalSpend / 1000).toFixed(0)}k` : "—"}
            sub={totalSpend > 0 ? "PKR estimated" : "no trips yet"}
            gradient="from-amber-500 to-orange-500"
            delay={3}
          />
        </motion.div>

        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="flex items-center justify-between mb-5"
        >
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Star size={16} className="text-amber-400" />
            Saved Itineraries
            {trips.length > 0 && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full glass text-slate-400">
                {trips.length}
              </span>
            )}
          </h2>
          {trips.length > 0 && (
            <Link
              href="/explore"
              className="text-sm text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus size={14} />
              New Trip
            </Link>
          )}
        </motion.div>

        {/* ── Trip Cards Bento Grid ── */}
        <AnimatePresence>
          {trips.length === 0 ? (
            <EmptyState />
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              <AnimatePresence mode="popLayout">
                {trips.map((trip, i) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    index={i}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>

              {/* Add new trip card */}
              <motion.div
                variants={cardVariants}
                custom={trips.length}
                initial="hidden"
                animate="visible"
              >
                <Link
                  href="/explore"
                  className="flex flex-col items-center justify-center gap-3 h-full min-h-[260px] rounded-2xl border-2 border-dashed border-white/10 hover:border-blue-500/30 hover:bg-blue-500/3 transition-all duration-300 group p-8 text-center"
                >
                  <div className="w-12 h-12 rounded-2xl border-2 border-dashed border-white/15 group-hover:border-blue-500/40 flex items-center justify-center transition-colors">
                    <Plus
                      size={20}
                      className="text-slate-500 group-hover:text-blue-400 transition-colors"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-400 group-hover:text-white transition-colors">
                      Plan a new trip
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tailored multi-day plan
                    </p>
                  </div>
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
