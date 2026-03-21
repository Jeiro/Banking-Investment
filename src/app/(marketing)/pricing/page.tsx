import PricingSection from "@/components/marketing/PricingSection"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for everyone.",
}

export default function PricingPage() {
  return <PricingSection standalone />
}