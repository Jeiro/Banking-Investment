"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, TrendingUp, Shield, Zap, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/utils"

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (delay = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
}

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden grid-bg">
      {/* Background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] bg-brand-blue/8 rounded-full blur-[80px] sm:blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-brand-emerald/6 rounded-full blur-[60px] sm:blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 lg:pt-32 w-full">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left — Copy */}
          <div className="relative z-10 text-center lg:text-left">

            {/* Badge */}
            <motion.div
              variants={fadeUp} initial="hidden" animate="show" custom={0.1}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full border border-brand-blue/30 bg-brand-blue/10 text-brand-blue text-xs sm:text-sm font-medium mb-6 sm:mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse" />
              Trusted by 50,000+ users worldwide
              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp} initial="hidden" animate="show" custom={0.2}
              className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-4 sm:mb-6"
            >
              Your money,
              <br />
              <span className="bg-gradient-to-r from-brand-blue via-blue-400 to-brand-emerald bg-clip-text text-transparent">
                working harder
              </span>
              <br />
              than ever.
            </motion.h1>

            {/* Sub */}
            <motion.p
              variants={fadeUp} initial="hidden" animate="show" custom={0.35}
              className="text-base sm:text-lg text-white/60 leading-relaxed max-w-lg mx-auto lg:mx-0 mb-8 sm:mb-10"
            >
              NexVault combines secure banking, smart investments, and instant
              transfers — all in one beautifully simple interface.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeUp} initial="hidden" animate="show" custom={0.5}
              className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-10 sm:mb-12"
            >
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg"
                  className="w-full sm:w-auto h-13 sm:h-14 px-6 sm:px-8 bg-brand-blue hover:bg-blue-600 text-white font-semibold text-base shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:-translate-y-0.5 rounded-xl">
                  Open Free Account
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/features" className="w-full sm:w-auto">
                <Button size="lg" variant="ghost"
                  className="w-full sm:w-auto h-13 sm:h-14 px-6 sm:px-8 text-white/70 hover:text-white hover:bg-white/10 font-semibold text-base rounded-xl border border-navy-border">
                  Explore Features
                </Button>
              </Link>
            </motion.div>

            {/* Trust row */}
            <motion.div
              variants={fadeUp} initial="hidden" animate="show" custom={0.65}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs sm:text-sm text-white/40"
            >
              {[
                { icon: Shield, label: "256-bit encryption" },
                { icon: Zap, label: "Instant transfers" },
                { icon: TrendingUp, label: "Up to 18.5% returns" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 sm:gap-2">
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-emerald" />
                  <span>{label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Dashboard Preview (hidden on small mobile, shown md+) */}
          <div className="hidden md:flex relative items-center justify-center h-[400px] lg:h-[560px]">
            {/* Central card */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative w-[280px] lg:w-[340px] bg-navy-card border border-navy-border rounded-3xl p-5 lg:p-6 shadow-2xl shadow-black/60 glow-blue"
            >
              <div className="flex items-center justify-between mb-5 lg:mb-6">
                <div>
                  <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-1">Total Balance</p>
                  <p className="font-display text-2xl lg:text-3xl font-bold text-white">
                    {formatCurrency(124850.60)}
                  </p>
                </div>
                <div className="w-9 h-9 lg:w-10 lg:h-10 bg-brand-blue/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-brand-blue" />
                </div>
              </div>

              {/* Mini chart bars */}
              <div className="flex items-end gap-1 lg:gap-1.5 h-14 lg:h-16 mb-5 lg:mb-6">
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 0.5, delay: 0.8 + i * 0.05 }}
                    className={`flex-1 rounded-sm ${i === 11 ? "bg-brand-blue" : "bg-white/10"}`}
                  />
                ))}
              </div>

              {/* Accounts */}
              <div className="space-y-2.5 lg:space-y-3">
                {[
                  { name: "Checking", amount: 48200.00, color: "bg-brand-blue" },
                  { name: "Savings", amount: 31450.60, color: "bg-brand-emerald" },
                  { name: "Investment", amount: 45200.00, color: "bg-brand-gold" },
                ].map(({ name, amount, color }) => (
                  <div key={name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${color}`} />
                      <span className="text-white/60 text-xs sm:text-sm">{name}</span>
                    </div>
                    <span className="text-white font-medium text-xs sm:text-sm">{formatCurrency(amount)}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Floating cards — only on lg */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="absolute -top-4 -right-6 lg:-right-8 w-44 lg:w-56 bg-navy-card/90 backdrop-blur-xl border border-navy-border rounded-2xl shadow-2xl p-3 lg:p-4"
            >
              <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                <div className="w-7 h-7 lg:w-8 lg:h-8 bg-brand-emerald/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-brand-emerald" />
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">Investment Return</p>
                  <p className="text-white/40 text-xs">Just now</p>
                </div>
              </div>
              <p className="text-brand-emerald font-display font-bold text-base lg:text-lg">+$1,240.00</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.9 }}
              className="absolute -bottom-2 -left-6 lg:-left-10 w-44 lg:w-52 bg-navy-card/90 backdrop-blur-xl border border-navy-border rounded-2xl shadow-2xl p-3 lg:p-4"
            >
              <p className="text-white/40 text-xs mb-1.5">Transfer Sent</p>
              <p className="text-white font-semibold text-sm">To: James Wilson</p>
              <p className="text-white font-display font-bold text-base lg:text-lg mt-0.5">$3,500.00</p>
              <div className="mt-1.5 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-emerald" />
                <span className="text-brand-emerald text-xs">Completed</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-navy to-transparent pointer-events-none" />
    </section>
  )
}