"use client";

import { motion } from "framer-motion";
import {
  MapPin,
  Sparkles,
  Globe,
  ChevronRight,
  Zap,
  Shield,
  Clock,
} from "lucide-react";
import GlobeWrapper from "@/components/GlobeWrapper";

// ─── Animation Variants ───────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.8, y: -10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const globeVariants = {
  hidden: { opacity: 0, scale: 0.85, x: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      delay: 0.3,
    },
  },
};

// ─── Trust Badges ─────────────────────────────────────────────────────────────
const TRUST_BADGES = [
  { icon: Zap, label: "Plans in 12s" },
  { icon: Shield, label: "100% Private" },
  { icon: Clock, label: "Save Forever" },
];

// ─── Popular Destinations ─────────────────────────────────────────────────────
const POPULAR_DESTINATIONS = [
  "Hunza Valley",
  "Dubai",
  "Tokyo",
  "Paris",
  "Bali",
];

// ─── Feature Highlights ───────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Globe,
    title: "3D Destination Explorer",
    desc: "Spin and select from an interactive globe with real destination pins.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Sparkles,
    title: "AI Itinerary Engine",
    desc: "Gemini AI generates a full day-by-day plan with budget in seconds.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: MapPin,
    title: "Smart Budget Breakdown",
    desc: "Itemized cost estimates for food, transport, stays & activities.",
    gradient: "from-pink-500 to-rose-500",
  },
];

// ─── Hero Section ─────────────────────────────────────────────────────────────
export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* ── Layered Background ── */}
      <div className="absolute inset-0 -z-10">
        {/* Deep dark base */}
        <div className="absolute inset-0 bg-[#020510]" />

        {/* Radial glow — left/center for the text content */}
        <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] rounded-full bg-blue-700/10 blur-[120px]" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-indigo-600/8 blur-[100px]" />

        {/* Radial glow — right for the globe */}
        <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full bg-violet-700/10 blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] rounded-full bg-cyan-600/8 blur-[80px]" />

        {/* Subtle horizontal grid */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* ── Main Content Grid ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-16 lg:pt-32 lg:pb-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-4 items-center">
          {/* ── Left: Text & CTA ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-start"
          >
            {/* Announcement badge */}
            <motion.div variants={badgeVariants} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide glass border-blue-500/30 text-blue-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Powered by Google Gemini AI
                <ChevronRight size={12} className="text-blue-400" />
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-white mb-5"
            >
              Plan Your{" "}
              <span className="shimmer-text block sm:inline">
                Dream Trip
              </span>{" "}
              <br className="hidden sm:block" />
              <span className="text-slate-200">in Seconds.</span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-[500px] mb-8 font-normal"
            >
              Spin the 3D globe, pick a destination, and let AI craft a
              full day-by-day itinerary with realistic budget breakdowns —
              all in under{" "}
              <span className="text-cyan-400 font-semibold">15 seconds</span>.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 mb-10 w-full sm:w-auto"
            >
              {/* Primary CTA */}
              <button className="glow-btn group relative inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl font-bold text-white text-base shadow-2xl shadow-blue-500/25 cursor-pointer border-0">
                <Sparkles
                  size={18}
                  className="group-hover:rotate-12 transition-transform duration-300"
                />
                Craft Itinerary
                <ChevronRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform duration-300"
                />
              </button>

              {/* Secondary CTA */}
              <button className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl font-semibold text-slate-200 text-base glass hover:bg-white/8 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer border-0">
                <Globe size={18} className="text-cyan-400" />
                Explore Globe
              </button>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-5 flex-wrap"
            >
              {TRUST_BADGES.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-1.5 text-slate-400 text-sm"
                >
                  <Icon size={14} className="text-cyan-400" />
                  <span className="font-medium">{label}</span>
                </div>
              ))}
            </motion.div>

            {/* Popular destinations row */}
            <motion.div
              variants={itemVariants}
              className="mt-10 flex flex-wrap gap-2"
            >
              <span className="text-xs text-slate-500 font-medium self-center mr-1">
                Popular:
              </span>
              {POPULAR_DESTINATIONS.map((dest) => (
                <button
                  key={dest}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 glass hover:text-white hover:bg-blue-500/10 hover:border-blue-500/30 transition-all duration-200 cursor-pointer border-0"
                >
                  <MapPin size={10} className="text-cyan-400" />
                  {dest}
                </button>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Right: 3D Globe ── */}
          <motion.div
            variants={globeVariants}
            initial="hidden"
            animate="visible"
            className="relative flex items-center justify-center h-[420px] sm:h-[520px] lg:h-[640px]"
          >
            {/* Globe outer glow ring */}
            <div className="absolute inset-8 rounded-full bg-blue-600/5 blur-2xl animate-pulse-slow" />
            <div className="absolute inset-0 rounded-full bg-violet-600/5 blur-3xl" />

            {/* Decorative orbit dots */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-[15%] right-[18%] w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_3px_rgba(6,182,212,0.6)] animate-ping" style={{ animationDelay: "0s", animationDuration: "2.5s" }} />
              <div className="absolute bottom-[22%] left-[14%] w-2 h-2 rounded-full bg-violet-400 shadow-[0_0_10px_3px_rgba(139,92,246,0.5)] animate-ping" style={{ animationDelay: "1s", animationDuration: "3s" }} />
              <div className="absolute top-[55%] right-[8%] w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_2px_rgba(96,165,250,0.5)] animate-ping" style={{ animationDelay: "0.5s", animationDuration: "2s" }} />
            </div>

            {/* Floating destination badge */}
            <motion.div
              animate={{
                y: [0, -8, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-[12%] left-[5%] z-20 glass-strong rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                <MapPin size={14} className="text-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Hunza Valley</div>
                <div className="text-xs text-slate-400">4 days · Moderate</div>
              </div>
            </motion.div>

            {/* Floating AI badge */}
            <motion.div
              animate={{
                y: [0, 10, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute bottom-[14%] right-[3%] z-20 glass-strong rounded-2xl px-4 py-3 flex items-center gap-3 shadow-xl"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Sparkles size={14} className="text-white" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">AI Generated</div>
                <div className="text-xs text-cyan-400">Ready in 8.3s</div>
              </div>
            </motion.div>

            {/* The Globe itself */}
            <div className="w-full h-full">
              <GlobeWrapper />
            </div>
          </motion.div>
        </div>

        {/* ── Feature Cards Row ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 lg:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {FEATURES.map(({ icon: Icon, title, desc, gradient }) => (
            <div
              key={title}
              className="glass rounded-2xl p-5 flex items-start gap-4 hover:bg-white/5 transition-colors duration-300 group cursor-default"
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <Icon size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white mb-1">{title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Bottom Gradient Fade ── */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#020510] to-transparent pointer-events-none" />
    </section>
  );
}
