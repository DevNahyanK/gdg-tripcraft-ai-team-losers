"use client";

import { motion } from "framer-motion";
import { Compass, Menu, X } from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
  { label: "Explore", href: "#explore" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-4 mt-4">
        <nav className="glass rounded-2xl px-6 py-3.5 flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow">
              <Compass size={16} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">
              TripCraft{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                AI
              </span>
            </span>
          </a>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="px-4 py-2 text-sm text-slate-300 hover:text-white rounded-xl hover:bg-white/5 transition-all duration-200 font-medium"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/auth?mode=login"
              className="text-sm text-slate-300 hover:text-white font-medium transition-colors px-3 py-2"
            >
              Sign in
            </a>
            <a
              href="/auth?mode=signup"
              className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-500 hover:to-violet-500 transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 hover:-translate-y-0.5"
            >
              Get Started
            </a>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition-colors"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="glass rounded-2xl px-4 py-4 mt-2 max-w-7xl mx-auto"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block px-3 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all font-medium"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="border-t border-white/10 mt-2 pt-3 flex flex-col gap-2">
              <a href="/auth?mode=login" className="block px-3 py-2.5 text-sm text-slate-300 hover:text-white rounded-xl hover:bg-white/5 transition-all font-medium">
                Sign in
              </a>
              <a href="/auth?mode=signup" className="block px-4 py-3 text-sm font-semibold text-center rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-500 hover:to-violet-500 transition-all">
                Get Started Free
              </a>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
