"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { CheckCircle2, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    desc: "Perfect for getting started with digital banking.",
    color: "border-navy-border",
    badge: null,
    features: [
      "1 Checking Account",
      "Up to $500/month transfers",
      "Basic transaction history",
      "Email support",
      "Mobile app access",
      "2-factor authentication",
    ],
    cta: "Open Free Account",
    ctaStyle: "border border-navy-border text-white hover:bg-white/5",
  },
  {
    name: "Growth",
    price: "$9",
    period: "/month",
    desc: "For individuals who want more from their money.",
    color: "border-brand-blue/40",
    badge: "Most Popular",
    features: [
      "3 Accounts (Checking + Savings + Investment)",
      "Unlimited transfers",
      "Investment plans access",
      "Priority support",
      "Advanced analytics",
      "PDF statements",
      "Beneficiary management",
      "Virtual card access",
    ],
    cta: "Start Growth Plan",
    ctaStyle: "bg-brand-blue hover:bg-blue-600 text-white shadow-lg shadow-blue-500/25",
  },
  {
    name: "Premium",
    price: "$29",
    period: "/month",
    desc: "For serious investors and business users.",
    color: "border-brand-gold/30",
    badge: "Best Value",
    features: [
      "Unlimited accounts",
      "Instant withdrawals",
      "All investment plans",
      "Dedicated account manager",
      "Custom investment portfolio",
      "Business account tools",
      "API access",
      "White-glove onboarding",
      "Zero withdrawal fees",
    ],
    cta: "Go Premium",
    ctaStyle: "bg-gradient-to-r from-brand-gold to-yellow-500 hover:opacity-90 text-navy font-bold",
  },
]

export default function PricingSection({ standalone = false }: { standalone?: boolean }) {
  return (
    <section className={cn("relative overflow-hidden", standalone ? "pt-32 pb-20" : "py-28")}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full border border-brand-blue/30 bg-brand-blue/10 text-brand-blue text-sm font-medium mb-4">
            Simple Pricing
          </span>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mb-4">
            Transparent pricing,
            <br />
            <span className="text-white/40">zero surprises.</span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Start free, upgrade when you need more. No hidden fees, ever.
          </p>
        </motion.div>

        {/* Plans grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={cn(
                "relative flex flex-col p-7 rounded-2xl border bg-navy-card",
                plan.color,
                plan.badge === "Most Popular" && "shadow-xl shadow-brand-blue/10"
              )}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-bold",
                    plan.badge === "Most Popular"
                      ? "bg-brand-blue text-white"
                      : "bg-brand-gold text-navy"
                  )}>
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <p className="font-display font-bold text-white text-lg mb-1">{plan.name}</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="font-display text-4xl font-bold text-white">{plan.price}</span>
                  {plan.period && <span className="text-white/40 text-sm">{plan.period}</span>}
                </div>
                <p className="text-white/50 text-sm">{plan.desc}</p>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-white/70">
                    <CheckCircle2 className="w-4 h-4 text-brand-emerald flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/register">
                <Button className={cn("w-full h-12 rounded-xl font-semibold transition-all", plan.ctaStyle)}>
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-white/30 text-sm mt-10 flex items-center justify-center gap-2"
        >
          <Zap className="w-3.5 h-3.5 text-brand-emerald" />
          All plans include SSL encryption, 2FA, and 24/7 fraud monitoring. Cancel anytime.
        </motion.p>
      </div>
    </section>
  )
}