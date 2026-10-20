"use client";

import { motion } from "framer-motion";
import { MapPin, ArrowRight, Star, Compass } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface DestinationCard {
  id: string;
  name: string;
  region: string;
  country: string;
  imageUrl: string;
  tags: string[];
  duration: string;
  estimatedBudget: string;
  rating: number;
  featuredSpot: string;
}

const FEATURED_DESTINATIONS: DestinationCard[] = [
  {
    id: "hunza",
    name: "Hunza Valley",
    region: "Gilgit-Baltistan",
    country: "Pakistan",
    imageUrl: "/hunza.jpg",
    tags: ["Glaciers", "Forts", "Passu Cones"],
    duration: "4 - 5 Days",
    estimatedBudget: "PKR 45,000",
    rating: 4.9,
    featuredSpot: "Attabad Lake & Passu Cones",
  },
  {
    id: "makkah",
    name: "Makkah",
    region: "Hejaz Province",
    country: "Saudi Arabia",
    imageUrl: "/makkah.jpg",
    tags: ["Masjid al-Haram", "Spiritual", "Clock Tower"],
    duration: "4 - 7 Days",
    estimatedBudget: "SAR 3,800",
    rating: 4.98,
    featuredSpot: "Holy Kaaba & Jabal al-Nour",
  },
  {
    id: "madina",
    name: "Madina",
    region: "Al Madinah Province",
    country: "Saudi Arabia",
    imageUrl: "/madina.jpg",
    tags: ["Prophet's Mosque", "Quba Mosque", "Serenity"],
    duration: "3 - 5 Days",
    estimatedBudget: "SAR 3,200",
    rating: 4.99,
    featuredSpot: "Masjid an-Nabawi & Mount Uhud",
  },
  {
    id: "dubai",
    name: "Dubai",
    region: "Emirate of Dubai",
    country: "United Arab Emirates",
    imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80",
    tags: ["Skyline", "Marina", "Desert Safari"],
    duration: "3 - 5 Days",
    estimatedBudget: "PKR 180,000",
    rating: 4.8,
    featuredSpot: "Burj Khalifa & Marina Dunes",
  },
  {
    id: "tokyo",
    name: "Tokyo",
    region: "Kanto",
    country: "Japan",
    imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80",
    tags: ["Shibuya", "Ancient Shrines", "Culinary"],
    duration: "5 - 7 Days",
    estimatedBudget: "PKR 280,000",
    rating: 4.95,
    featuredSpot: "Shibuya Crossing & Senso-ji",
  },
  {
    id: "paris",
    name: "Paris",
    region: "Île-de-France",
    country: "France",
    imageUrl: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80",
    tags: ["Eiffel Tower", "Louvre", "Bistros"],
    duration: "4 - 6 Days",
    estimatedBudget: "PKR 240,000",
    rating: 4.85,
    featuredSpot: "Louvre & Montmartre Sunset",
  },
  {
    id: "berlin",
    name: "Berlin",
    region: "Berlin State",
    country: "Germany",
    imageUrl: "https://images.unsplash.com/photo-1560969184-10fe8719e047?auto=format&fit=crop&w=800&q=80",
    tags: ["Brandenburg Gate", "Museums", "Culture"],
    duration: "3 - 5 Days",
    estimatedBudget: "EUR 950",
    rating: 4.82,
    featuredSpot: "Museum Island & Reichstag",
  },
  {
    id: "bali",
    name: "Bali",
    region: "Lesser Sunda Islands",
    country: "Indonesia",
    imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
    tags: ["Ubud Rice Terraces", "Temples", "Beaches"],
    duration: "4 - 7 Days",
    estimatedBudget: "PKR 140,000",
    rating: 4.9,
    featuredSpot: "Uluwatu Cliffs & Ubud Terraces",
  },
];

export default function ExploreSection() {
  return (
    <section id="explore" className="relative py-24 px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.08]">
      <div className="absolute top-1/3 right-10 w-[550px] h-[550px] bg-blue-600/5 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass border border-white/10 text-slate-300 text-xs font-semibold mb-4">
            <Compass size={13} className="text-cyan-400" />
            Curated Global Destinations
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Explore <span className="shimmer-text">Popular Destinations</span>
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-2 max-w-xl">
            Select a verified travel hub to explore complete multi-day itineraries, itemized local budgets, and day-by-day schedules.
          </p>
        </div>
        <Link
          href="/explore"
          className="glow-btn inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-white text-sm shadow-xl flex-shrink-0"
        >
          Custom Destination
          <ArrowRight size={15} />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURED_DESTINATIONS.map((dest, idx) => (
          <motion.div
            key={dest.id}
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.08 }}
            className="group relative glass rounded-3xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 flex flex-col justify-between"
          >
            <div className="relative h-60 w-full overflow-hidden">
              <Image
                src={dest.imageUrl}
                alt={dest.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                priority={idx < 2}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020510] via-black/40 to-black/20" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-black/60 backdrop-blur-md border border-white/15 text-amber-300 shadow-md">
                  <Star size={12} className="fill-amber-300" />
                  {dest.rating}
                </span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-slate-200 shadow-md">
                  {dest.country}
                </span>
              </div>
              <div className="absolute bottom-4 left-5 right-5 z-10">
                <div className="text-xs font-medium text-cyan-300 mb-0.5 tracking-wide">{dest.region}</div>
                <h3 className="text-2xl font-black text-white tracking-tight drop-shadow-lg">
                  {dest.name}
                </h3>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between bg-[#040817]/60">
              <div>
                <p className="text-xs text-slate-400 mb-4 flex items-center gap-1.5">
                  <MapPin size={13} className="text-cyan-400 flex-shrink-0" />
                  <span className="text-slate-300 font-semibold">{dest.featuredSpot}</span>
                </p>
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {dest.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white/5 border border-white/5 text-slate-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-2">
                <div>
                  <div className="text-[11px] text-slate-400 font-medium">Est. Budget ({dest.duration})</div>
                  <div className="text-sm font-bold text-white">{dest.estimatedBudget}</div>
                </div>
                <Link
                  href={`/explore?destination=${encodeURIComponent(dest.name)}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 transition-all shadow-md group-hover:scale-105"
                >
                  <span>Plan Trip</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="glass rounded-3xl p-8 border border-dashed border-white/20 flex flex-col justify-between hover:border-blue-500/40 hover:bg-blue-500/5 transition-all text-center items-center"
        >
          <div className="my-auto">
            <div className="w-14 h-14 rounded-2xl glass-strong border border-blue-500/30 flex items-center justify-center mx-auto mb-4 text-cyan-400">
              <Compass size={24} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Have another city in mind?</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mb-6 leading-relaxed">
              Plan custom multi-day journeys to any city or region across the globe with day-by-day itineraries and itemized budgets.
            </p>
          </div>
          <Link
            href="/explore"
            className="glow-btn w-full py-3.5 rounded-xl font-bold text-white text-xs inline-flex items-center justify-center gap-2"
          >
            <span>Create Custom Plan</span>
            <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}