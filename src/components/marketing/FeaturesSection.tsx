"use client"

import { motion } from "framer-motion"
import {
  ArrowLeftRight, TrendingUp, Shield, Smartphone,
  Bell, BarChart3, CreditCard, Globe,
} from "lucide-react"

const features = [
  {
    icon: ArrowLeftRight,
    title: "Instant Transfers",
    description: "Send money globally in seconds. Real-time settlement with zero hidden fees.",
    color: "from-blue-500/20 to-blue-600/5",
    iconColor: "text-blue-400",
    border: "border-blue-500/20",
  },
  {
    icon: TrendingUp,
    title: "Smart Investments",
    description: "Access curated investment plans with returns up to 18.5% annually. Start with just $100.",
    color: "from-emerald-500/20 to-emerald-600/5",
    iconColor: "text-emerald-400",
    border: "border-emerald-500/20",
  },
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description: "256-bit SSL encryption, biometric authentication, and real-time fraud detection.",
    color: "from-purple-500/20 to-purple-600/5",
    iconColor: "text-purple-400",
    border: "border-purple-500/20",
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description: "Visualize your spending patterns, track goals, and make data-driven decisions.",
    color: "from-orange-500/20 to-orange-600/5",
    iconColor: "text-orange-400",
    border: "border-orange-500/20",
  },
  {
    icon: Bell,
    title: "Real-time Notifications",
    description: "Get instant alerts for every transaction, login attempt, and account activity.",
    color: "from-yellow-500/20 to-yellow-600/5",
    iconColor: "text-yellow-400",
    border: "border-yellow-500/20",
  },
  {
    icon: Globe,
    title: "Multi-Currency",
    description: "Hold, send, and receive in 50+ currencies with live exchange rates.",
    color: "from-cyan-500/20 to-cyan-600/5",
    iconColor: "text-cyan-400",
    border: "border-cyan-500/20",
  },
  {
    icon: CreditCard,
    title: "Virtual Cards",
    description: "Generate virtual cards instantly for secure online purchases. Freeze anytime.",
    color: "from-pink-500/20 to-pink-600/5",
    iconColor: "text-pink-400",
    border: "border-pink-500/20",
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Full-featured mobile experience. Your complete financial hub, always in your pocket.",
    color: "from-indigo-500/20 to-indigo-600/5",
    iconColor: "text-indigo-400",
    border: "border-indigo-500/20",
  },
]

export default function FeaturesSection() {
  return (
    <section className="py-28 relative overflow-hidden">
      {/* Bg glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-blue/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full border border-brand-blue/30 bg-brand-blue/10 text-brand-blue text-sm font-medium mb-4">
            Everything you need
          </span>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mb-5">
            Banking reimagined
            <br />
            <span className="text-white/40">for the digital age.</span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            NexVault brings together every financial tool you need in one elegant, secure platform.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className={`group relative p-6 rounded-2xl border ${feature.border} bg-gradient-to-br ${feature.color} hover:scale-[1.02] transition-all duration-300 cursor-default`}
              >
                <div className={`w-11 h-11 rounded-xl bg-navy-card/80 flex items-center justify-center mb-4 ${feature.iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-semibold text-white text-base mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}