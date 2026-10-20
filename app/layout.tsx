import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TripCraft — Modern Travel Itinerary & Budget Platform",
  description:
    "Curated multi-day itineraries, itemized budget breakdowns, and spatial 3D exploration for destinations around the globe.",
  keywords: [
    "travel planner",
    "trip itinerary",
    "3D globe",
    "travel budget",
    "TripCraft",
  ],
  openGraph: {
    title: "TripCraft",
    description: "Curated multi-day travel planning & spatial exploration workspace",
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
