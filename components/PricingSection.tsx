"use client";

import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Shield, HelpCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

const PLANS = [
  {
    id: "free",
    name: "Free Explorer",
    badge: "Free Forever",
    price: "0",
    period: "forever",
    description: "Ideal for casual weekend trips, road journeys, and spontaneous travelers.",
    features: [
      "Up to 5 itinerary generations per day",
      "Interactive 3D Globe with curated destination markers",
      "Full day-by-day morning / afternoon / evening schedule",
      "Itemized estimated budget breakdown in PKR",
      "Save up to 3 trips to personal dashboard",
      "Fast response with optimized route pacing",
    ],
    ctaText: "Start Planning Free",
    ctaLink: "/explore",
    featured: false,
  },
  {
    id: "pro",
    name: "Pro Traveler",
    badge: "Most Popular",
    price: "1,999",
    period: "per month",
    description: "For frequent vacationers, digital nomads, and travelers who need unlimited depth.",
    features: [
      "Unlimited itinerary generations",
      "Unlimited saved trips with permanent cloud storage",
      "Custom activity customization & live budget updates",
      "Export itineraries to PDF, printable view & calendar",
      "High-priority server processing (under 8 seconds)",
      "Multi-destination day trip extensions",
      "Shareable itinerary links for travel partners",
    ],
    ctaText: "Get Pro Access",
    ctaLink: "/auth?mode=signup",
    featured: true,
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="relative py-24 sm:py-32 px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
      {/* Glow Backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10 text-slate-300 text-xs font-semibold mb-4"
        >
          <Zap size={13} className="text-cyan-400" />
          Transparent & Simple Pricing
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-5"
        >
          Start free, upgrade when you <span className="shimmer-text">travel further.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base sm:text-lg text-slate-400 leading-relaxed font-normal"
        >
          Generate your first multi-day itinerary in seconds without credit card commitments.
        </motion.p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {PLANS.map((plan, idx) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.15 }}
            className={`relative rounded-3xl p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 ${
              plan.featured
                ? "glass-strong border-2 border-blue-500/50 shadow-2xl shadow-blue-500/15 scale-[1.02]"
                : "glass border border-white/10 hover:border-white/20"
            }`}
          >
            {/* Featured Highlight Ribbon */}
            {plan.featured && (
              <div className="absolute -top-3.5 right-8">
                <span className="px-4 py-1 rounded-full text-xs font-black tracking-wide bg-gradient-to-r from-blue-500 to-cyan-400 text-slate-950 shadow-md">
                  {plan.badge}
                </span>
              </div>
            )}

            <div>
              {/* Plan Title & Badge */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-black text-white">{plan.name}</h3>
                {!plan.featured && (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full glass border-white/10 text-slate-400">
                    {plan.badge}
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-400 mb-6 font-normal leading-relaxed">
                {plan.description}
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-8 pb-8 border-b border-white/10">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">PKR</span>
                <span className="text-5xl font-black text-white tracking-tight">{plan.price}</span>
                <span className="text-sm text-slate-500 font-medium">/ {plan.period}</span>
              </div>

              {/* Feature checklist */}
              <div className="space-y-3.5 mb-10">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  What&apos;s included:
                </p>
                {plan.features.map((feature, fIdx) => (
                  <div key={fIdx} className="flex items-start gap-3 text-sm text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={12} className="text-cyan-400" />
                    </div>
                    <span className="leading-snug">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <Link
              href={plan.ctaLink}
              className={`w-full py-4 rounded-2xl font-bold text-sm text-center transition-all duration-200 flex items-center justify-center gap-2 ${
                plan.featured
                  ? "glow-btn text-white shadow-xl shadow-blue-500/25"
                  : "glass hover:bg-white/10 text-white border border-white/10"
              }`}
            >
              <span>{plan.ctaText}</span>
              <ArrowRight size={15} />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
