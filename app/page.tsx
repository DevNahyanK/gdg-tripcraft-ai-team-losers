import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import ExploreSection from "@/components/ExploreSection";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <main className="noise-overlay min-h-screen flex flex-col justify-between overflow-x-hidden w-full max-w-[100vw]">
      <div className="w-full overflow-x-hidden">
        <Navbar />
        <HeroSection />
        <FeaturesSection />
        <ExploreSection />
        <PricingSection />
      </div>
      <Footer />
    </main>
  );
}
