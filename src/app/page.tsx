import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/features/landing/HeroSection";
import { FeaturesSection } from "@/features/landing/FeaturesSection";
import { HowItWorksSection } from "@/features/landing/HowItWorksSection";
import { StrategiesSection } from "@/features/landing/StrategiesSection";
import { SecuritySection } from "@/features/landing/SecuritySection";
import { CtaSection } from "@/features/landing/CtaSection";

export default function Home() {
  return (
    <>
      <Navbar />

      <main>
        {/* Overview */}
        <HeroSection />

        {/* Features */}
        <FeaturesSection />

        {/* How It Works */}
        <HowItWorksSection />

        {/* Strategies */}
        <StrategiesSection />

        {/* Security */}
        <SecuritySection />

        {/* Final CTA */}
        <CtaSection />
      </main>

      <footer className="border-t border-gray-800 py-8 text-center text-sm text-slate-600">
        &copy; {new Date().getFullYear()} NeuroWealth &middot; Built on Stellar
      </footer>
    </>
  );
}
