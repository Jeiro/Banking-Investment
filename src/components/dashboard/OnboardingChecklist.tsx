"use client"

import { motion } from "framer-motion"
import { CheckCircle2, Circle, ChevronRight } from "lucide-react"
import Link from "next/link"
import type { Profile } from "@/types/database"

interface ChecklistProps {
  profile: Profile
}

export default function OnboardingChecklist({ profile }: ChecklistProps) {
  const steps = [
    { label: "Create your account", done: true, href: "/register" },
    { label: "Complete your profile", done: !!(profile.phone && profile.city), href: "/dashboard/settings" },
    { label: "Complete KYC verification", done: profile.kyc_status === "verified", href: "/dashboard/kyc" },
    { label: "Make your first deposit", done: false, href: "/dashboard/deposit" },
    { label: "Set up a beneficiary", done: false, href: "/dashboard/beneficiaries" },
  ]

  const completed = steps.filter((s) => s.done).length
  const percent = Math.round((completed / steps.length) * 100)

  if (percent === 100) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-gradient-to-br from-brand-blue/10 to-brand-emerald/5 border border-brand-blue/20 rounded-2xl p-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-display font-semibold text-white text-sm">Getting Started</h3>
          <p className="text-white/40 text-xs">{completed} of {steps.length} steps complete</p>
        </div>
        <span className="font-display font-bold text-brand-blue text-lg">{percent}%</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-navy-border rounded-full mb-5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-brand-blue to-brand-emerald rounded-full"
        />
      </div>

      {/* Steps */}
      <div className="space-y-2.5">
        {steps.map(({ label, done, href }) => (
          <Link key={label} href={href}
            className="flex items-center gap-3 group"
          >
            {done
              ? <CheckCircle2 className="w-4 h-4 text-brand-emerald flex-shrink-0" />
              : <Circle className="w-4 h-4 text-white/20 flex-shrink-0 group-hover:text-brand-blue transition-colors" />
            }
            <span className={`text-sm flex-1 ${done ? "text-white/40 line-through" : "text-white/70 group-hover:text-white transition-colors"}`}>
              {label}
            </span>
            {!done && <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-brand-blue transition-colors" />}
          </Link>
        ))}
      </div>
    </motion.div>
  )
}