import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TripCraft AI — Smart 3D Travel Planning",
  description:
    "AI-powered travel itinerary planner with an interactive 3D globe. Select your destination, set your budget, and craft the perfect multi-day plan in seconds.",
  keywords: [
    "travel planner",
    "AI itinerary",
    "3D globe",
    "trip planning",
    "TripCraft",
  ],
  openGraph: {
    title: "TripCraft AI",
    description: "AI-powered 3D travel planning workspace",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
