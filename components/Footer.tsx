import { Compass } from "lucide-react";
import Link from "next/link";

const FOOTER_SECTIONS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Destinations", href: "/#explore" },
      { label: "Pricing", href: "/#pricing" },
      { label: "AI Engine", href: "/explore" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/#features" },
      { label: "Careers", href: "mailto:careers@tripcraft.com" },
      { label: "Press", href: "mailto:press@tripcraft.com" },
      { label: "Contact", href: "mailto:contact@tripcraft.com" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/#privacy" },
      { label: "Terms of Service", href: "/#terms" },
      { label: "Cookie Policy", href: "/#cookies" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#020510] relative z-10 text-slate-400">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-12">
        {/* Main Footer Content: Brand Description + Multi-column Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12 pb-14 border-b border-white/[0.06]">
          {/* Brand Presentation & Mission */}
          <div className="lg:col-span-2 space-y-4 pr-0 lg:pr-8">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/35 transition-all">
                <Compass size={18} className="text-white" strokeWidth={2.2} />
              </div>
              <span className="font-bold text-white text-lg tracking-tight">
                TripCraft
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              The modern travel platform engineered for global explorers. Design day-by-day itineraries, track itemized local budgets, and explore world destinations with interactive 3D spatial mapping.
            </p>
          </div>

          {/* Standard Navigation Columns */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-4">
              <h4 className="text-xs font-semibold text-slate-200 tracking-wider uppercase">
                {section.title}
              </h4>
              <ul className="space-y-2.5 text-sm">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-slate-400 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Minimal Copyright Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 TripCraft. All rights reserved.</p>
          <p>Engineered for global travelers.</p>
        </div>
      </div>
    </footer>
  );
}
