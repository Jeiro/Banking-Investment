import ContactContent from "@/components/marketing/ContactContent"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the NexVault team.",
}

export default function ContactPage() {
  return <ContactContent />
}