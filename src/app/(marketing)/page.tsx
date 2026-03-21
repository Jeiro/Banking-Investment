import HeroSection from "@/components/marketing/HeroSection"
import StatsSection from "@/components/marketing/StatsSection"
import FeaturesSection from "@/components/marketing/FeaturesSection"
import SecuritySection from "@/components/marketing/SecuritySection"
import TestimonialsSection from "@/components/marketing/TestimonialsSection"
import FAQSection from "@/components/marketing/FAQSection"
import PricingSection from "@/components/marketing/PricingSection"
import CTASection from "@/components/marketing/CTASection"

export default function MarketingHomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <SecuritySection />
      <TestimonialsSection />
      <FAQSection />
      <PricingSection />
      <CTASection />
    </>
  )
}