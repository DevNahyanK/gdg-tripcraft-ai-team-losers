"use client";

import { motion } from "framer-motion";
import {
  Sparkles,
  Wallet,
  Globe,
  ArrowRight,
  Zap,
  Layers,
  CheckCircle2,
  Clock,
  Compass,
} from "lucide-react";
import Link from "next/link";

const BENTO_FEATURES = [
  {
    id: "itinerary-planner",
    tag: "Algorithmic Routing",
    title: "Optimized Day-by-Day Scheduling",
    subtitle:
      "Transform destinations, budget tiers, and travel interests into structured chronological itineraries with realistic local timing in seconds.",
    icon: Compass,
    gradient: "from-blue-500 to-cyan-500",
    borderGlow: "group-hover:border-blue-500/50",
    highlights: [
      "Categorized slots: Morning, Afternoon, Evening",
      "Dynamic activity pacing with realistic transit buffers",
      "Tailored for Culture, Culinary, Adventure & Relaxation",
    ],
    metric: "12s",
    metricLabel: "Average Planning Speed",
  },
  {
    id: "budget-breakdown",
    tag: "Predictive Analytics",
    title: "Smart Itemized Cost Breakdown",
    subtitle:
      "Eliminate spreadsheet fatigue. Every plan calculates live estimated expenditures across lodging, authentic dining, activities, and local transit.",
    icon: Wallet,
    gradient: "from-amber-500 to-orange-500",
    borderGlow: "group-hover:border-amber-500/50",
    highlights: [
      "Itemized allocations: Stays, Dining, Transit, Sights",
      "Three budget tiers: Budget, Moderate, and Luxury",
      "Activity-level cost transparency with clear estimates",
    ],
    metric: "98%",
    metricLabel: "Cost Accuracy Alignment",
  },
  {
    id: "3d-canvas",
    tag: "Spatial Visualization",
    title: "Interactive 3D Spatial Exploration",
    subtitle:
      "Spin the globe, explore curated travel hubs with active markers, and visualize your destination before booking.",
    icon: Globe,
    gradient: "from-violet-500 to-purple-500",
    borderGlow: "group-hover:border-violet-500/50",
    highlights: [
      "Hardware-accelerated 3D canvas with smooth orbit controls",
      "Live coordinates & regional telemetry",
      "Lightweight responsive fallback for mobile and low-power devices",
    ],
    metric: "60 FPS",
    metricLabel: "Smooth Orbit Performance",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 sm:py-32 px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Glow Backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10 text-slate-300 text-xs font-semibold mb-4"
        >
          <Layers size={13} className="text-cyan-400" />
          The TripCraft Platform
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-5"
        >
          Engineered for travelers who value{" "}
          <span className="shimmer-text">speed and elegance.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-lg text-slate-400 leading-relaxed font-normal"
        >
          No more disorganized spreadsheets, browser tab chaos, or inaccurate budgeting.
          Plan, budget, and visualize your entire journey in one seamless experience.
        </motion.p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {BENTO_FEATURES.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className={`group relative glass rounded-3xl p-8 flex flex-col justify-between border border-white/10 ${feature.borderGlow} transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-blue-500/10 overflow-hidden`}
            >
              {/* Corner Ambient Glow */}
              <div
                className={`absolute -top-12 -right-12 w-36 h-36 rounded-full bg-gradient-to-br ${feature.gradient} opacity-10 group-hover:opacity-20 blur-2xl transition-opacity`}
              />

              <div>
                {/* Header Tag & Icon */}
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon size={22} className="text-white" />
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full glass border border-white/10 text-slate-300">
                    {feature.tag}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6 font-normal">
                  {feature.subtitle}
                </p>

                {/* Feature checklist */}
                <ul className="space-y-2.5 mb-8">
                  {feature.highlights.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 size={14} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Metric Card Footer */}
              <div className="pt-6 border-t border-white/10 flex items-end justify-between">
                <div>
                  <div className="text-2xl font-black text-white">{feature.metric}</div>
                  <div className="text-[11px] text-slate-400 font-medium">{feature.metricLabel}</div>
                </div>
                <Link
                  href="/explore"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 group-hover:text-cyan-300 group-hover:translate-x-1 transition-all"
                >
                  Explore planner
                  <ArrowRight size={13} />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
