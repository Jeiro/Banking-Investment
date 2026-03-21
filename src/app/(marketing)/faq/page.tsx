import type { Metadata } from "next"
import FAQSection from "@/components/marketing/FAQSection"
import FAQHero from "@/components/marketing/FAQHero"

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about NexVault.",
}

export default function FAQPage() {
  return (
    <>
      <FAQHero />
      <FAQSection />
    </>
  )
}