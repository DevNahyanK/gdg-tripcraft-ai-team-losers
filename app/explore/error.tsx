"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertOctagon, RefreshCw, Compass, Home } from "lucide-react";

export default function ExploreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[TripCraft Explore Error]:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg glass rounded-3xl p-8 border border-rose-500/20 bg-rose-500/5 text-center shadow-2xl backdrop-blur-xl">
        <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
          <AlertOctagon size={32} />
        </div>

        <h1 className="text-2xl font-black text-white mb-2">
          Unable to Load Itinerary
        </h1>

        <p className="text-slate-400 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
          An error occurred while generating or displaying your itinerary. You can retry or head back to the trip planner.
        </p>

        {error?.message && (
          <div className="mb-6 p-3 rounded-xl bg-black/40 border border-white/5 text-left text-xs font-mono text-rose-300 overflow-x-auto max-h-24">
            {error.message}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
          >
            <RefreshCw size={14} />
            <span>Try Again</span>
          </button>

          <Link
            href="/explore"
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-all"
          >
            <Compass size={14} className="text-cyan-400" />
            <span>Reset Planner</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 text-xs sm:text-sm font-medium transition-colors"
          >
            <Home size={14} />
            <span>Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
