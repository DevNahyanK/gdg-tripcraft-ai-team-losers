"use client";

import { motion } from "framer-motion";
import {
  MapPin,
  Globe,
  ChevronRight,
  Zap,
  Shield,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import GlobeWrapper from "@/components/GlobeWrapper";

// ─── Animation Variants ───────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
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
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const globeVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      delay: 0.3,
    },
  },
};

// ─── Trust Badges ─────────────────────────────────────────────────────────────
const TRUST_BADGES = [
  { icon: Zap, label: "Instant Itineraries" },
  { icon: Shield, label: "Verified Routes" },
  { icon: Clock, label: "Save & Export" },
];

// ─── Popular Destinations ─────────────────────────────────────────────────────
const POPULAR_DESTINATIONS = ["Hunza Valley", "Dubai", "Tokyo", "Paris", "Bali"];

// ─── Feature Highlights ───────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: Globe,
    title: "3D Destination Explorer",
    desc: "Spin and select from an interactive globe with curated global destination pins.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: MapPin,
    title: "Precision Route Planner",
    desc: "Generates practical day-by-day schedules optimized for distance and local hours.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Clock,
    title: "Smart Budget Breakdown",
    desc: "Itemized cost estimates for food, transport, stays, and verified activities.",
    gradient: "from-pink-500 to-rose-500",
  },
];

// ─── Hero Section ─────────────────────────────────────────────────────────────
export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-x-hidden w-full max-w-[100vw]">
      {/* ── Layered Background ── */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[#020510]" />
        <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] rounded-full bg-blue-700/10 blur-[120px]" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] rounded-full bg-indigo-600/8 blur-[100px]" />
        <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full bg-violet-700/10 blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-[350px] h-[350px] rounded-full bg-cyan-600/8 blur-[80px]" />
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
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-20 overflow-x-hidden">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-6 items-center w-full">

          {/* ── Left: Text & CTA ── */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-start order-2 lg:order-1 w-full max-w-full px-0 sm:px-1"
          >
            {/* Announcement badge */}
            <motion.div variants={badgeVariants} className="mb-5 max-w-full">
              <Link
                href="/explore"
                className="group inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wide glass border border-white/10 text-slate-300 hover:text-white hover:border-blue-500/40 hover:bg-white/[0.06] transition-all duration-300 shadow-lg shadow-black/20"
              >
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.7)] animate-pulse flex-shrink-0" />
                <span>Next-Gen Travel Platform</span>
                <span className="text-slate-500">|</span>
                <span className="text-blue-400 group-hover:text-cyan-300 font-semibold transition-colors flex items-center gap-0.5">
                  Plan Itinerary
                  <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.1] tracking-tight text-white mb-4 sm:mb-5 break-words max-w-full"
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
              className="text-sm sm:text-base lg:text-lg text-slate-400 leading-relaxed w-full max-w-full sm:max-w-[500px] mb-6 sm:mb-8 font-normal"
            >
              Spin the 3D globe, pick any destination, and receive a complete day-by-day
              itinerary with realistic, itemized budget breakdowns in seconds.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-10 w-full sm:w-auto"
            >
              {/* Primary CTA */}
              <Link
                href="/explore"
                className="glow-btn group relative inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-white text-sm sm:text-base shadow-2xl shadow-blue-500/25 w-full sm:w-auto text-center"
              >
                <Globe
                  size={18}
                  className="group-hover:rotate-12 transition-transform duration-300 flex-shrink-0"
                />
                <span>Craft Itinerary</span>
                <ChevronRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform duration-300 flex-shrink-0"
                />
              </Link>

              {/* Secondary CTA */}
              <Link
                href="#explore"
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 sm:py-4 rounded-2xl font-semibold text-slate-200 text-sm sm:text-base glass hover:bg-white/8 transition-all duration-200 hover:-translate-y-0.5 w-full sm:w-auto text-center"
              >
                <MapPin size={17} className="text-cyan-400 flex-shrink-0" />
                <span>Explore Destinations</span>
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-4 sm:gap-5 flex-wrap w-full"
            >
              {TRUST_BADGES.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-slate-400 text-xs sm:text-sm">
                  <Icon size={13} className="text-cyan-400 flex-shrink-0" />
                  <span className="font-medium">{label}</span>
                </div>
              ))}
            </motion.div>

            {/* Popular destinations */}
            <motion.div variants={itemVariants} className="mt-8 sm:mt-10 flex flex-wrap gap-2 w-full">
              <span className="text-xs text-slate-500 font-medium self-center mr-1">Popular:</span>
              {POPULAR_DESTINATIONS.map((dest) => (
                <Link
                  key={dest}
                  href={`/explore?destination=${encodeURIComponent(dest)}`}
                  className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl text-xs font-medium text-slate-300 glass hover:text-white hover:bg-blue-500/10 hover:border-blue-500/30 transition-all duration-200"
                >
                  <MapPin size={9} className="text-cyan-400 flex-shrink-0" />
                  <span>{dest}</span>
                </Link>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Right: 3D Globe ── */}
          <motion.div
            variants={globeVariants}
            initial="hidden"
            animate="visible"
            className="relative flex items-center justify-center order-1 lg:order-2
                       h-[280px] xs:h-[340px] sm:h-[420px] md:h-[480px] lg:h-[600px] xl:h-[640px]
                       w-full max-w-[100vw] overflow-hidden"
          >
            {/* Ambient glow rings */}
            <div className="absolute inset-4 sm:inset-8 rounded-full bg-blue-600/5 blur-2xl animate-pulse-slow pointer-events-none" />
            <div className="absolute inset-0 rounded-full bg-violet-600/5 blur-3xl pointer-events-none" />

            {/* Decorative orbit dots */}
            <div className="absolute inset-0 pointer-events-none hidden xs:block">
              <div className="absolute top-[15%] right-[18%] w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_3px_rgba(6,182,212,0.6)] animate-ping" style={{ animationDuration: "2.5s" }} />
              <div className="absolute bottom-[22%] left-[14%] w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-violet-400 shadow-[0_0_10px_3px_rgba(139,92,246,0.5)] animate-ping" style={{ animationDelay: "1s", animationDuration: "3s" }} />
              <div className="absolute top-[55%] right-[8%] w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_2px_rgba(96,165,250,0.5)] animate-ping" style={{ animationDelay: "0.5s", animationDuration: "2s" }} />
            </div>

            {/* Natural travel destination pin marker */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-[8%] left-[2%] xs:top-[12%] xs:left-[5%] z-20 max-w-[85%]"
            >
              <Link
                href="/explore?destination=Hunza%20Valley"
                className="group flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl glass-strong border border-white/10 hover:border-cyan-400/50 bg-[#0a1026]/85 hover:bg-[#0f1738]/90 transition-all duration-300 shadow-xl shadow-black/40 hover:shadow-cyan-500/15 hover:scale-[1.03] active:scale-[0.98]"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform">
                  <MapPin size={13} className="text-white" />
                </div>
                <div className="min-w-0 pr-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] sm:text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                      Hunza Valley
                    </span>
                    <ArrowUpRight size={11} className="text-slate-400 group-hover:text-cyan-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all flex-shrink-0" />
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-slate-400 group-hover:text-slate-300 transition-colors truncate">
                    4 days · Mountain Explorer
                  </div>
                </div>
              </Link>
            </motion.div>

            {/* Globe canvas */}
            <div className="w-full h-full max-w-full overflow-hidden">
              <GlobeWrapper />
            </div>
          </motion.div>
        </div>

        {/* ── Feature Cards Row ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 sm:mt-16 lg:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full"
        >
          {FEATURES.map(({ icon: Icon, title, desc, gradient }) => (
            <div
              key={title}
              className="glass rounded-2xl p-4 sm:p-5 flex items-start gap-3 sm:gap-4 hover:bg-white/5 transition-colors duration-300 group cursor-default"
            >
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <Icon size={17} className="text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-bold text-white mb-0.5 sm:mb-1">{title}</h3>
                <p className="text-[11px] sm:text-xs text-slate-400 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#020510] to-transparent pointer-events-none" />
    </section>
  );
}
