import RegisterWizard from "@/components/auth/RegisterWizard"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Create Account" }

export default function RegisterPage() {
  return <RegisterWizard />
}