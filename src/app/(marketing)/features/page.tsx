import FeaturesSection from "@/components/marketing/FeaturesSection"
import SecuritySection from "@/components/marketing/SecuritySection"
import type { Metadata } from "next"
import { motion } from "framer-motion"
import FeaturesHero from "@/components/marketing/FeaturesHero"

export const metadata: Metadata = {
  title: "Features",
  description: "Everything you need to manage, grow, and protect your finances.",
}

export default function FeaturesPage() {
  return (
    <>
      <FeaturesHero />
      <FeaturesSection />
      <SecuritySection />
    </>
  )
}