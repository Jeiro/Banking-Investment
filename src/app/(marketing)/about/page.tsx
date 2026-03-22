import AboutContent from "@/components/marketing/AboutContent"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About",
  description: "Learn about NexVault and our mission.",
}

export default function AboutPage() {
  return <AboutContent />
}