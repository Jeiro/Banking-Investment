import SecuritySection from "@/components/marketing/SecuritySection"
import type { Metadata } from "next"
import SecurityHero from "@/components/marketing/SecurityHero"

export const metadata: Metadata = {
  title: "Security",
  description: "How NexVault protects your money and data.",
}

export default function SecurityPage() {
  return (
    <>
      <SecurityHero />
      <SecuritySection />
    </>
  )
}