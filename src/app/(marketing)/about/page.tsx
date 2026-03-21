"use client"

import { motion } from "framer-motion"
import type { Metadata } from "next"
import { TrendingUp, Shield, Users, Globe } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const VALUES = [
  { icon: Shield, title: "Trust", desc: "We hold your money and data to the highest security standards. Transparency is non-negotiable." },
  { icon: TrendingUp, title: "Growth", desc: "We believe everyone deserves access to wealth-building tools previously reserved for the elite." },
  { icon: Users, title: "People First", desc: "Every product decision starts with one question: does this make our users' lives better?" },
  { icon: Globe, title: "Global", desc: "Financial freedom has no borders. We're building for everyone, everywhere." },
]

const TEAM = [
  { name: "Alex Morgan", role: "CEO & Co-Founder", avatar: "AM", bg: "from-blue-500 to-cyan-500" },
  { name: "Priya Patel", role: "CTO & Co-Founder", avatar: "PP", bg: "from-emerald-500 to-teal-500" },
  { name: "James Carter", role: "Head of Product", avatar: "JC", bg: "from-purple-500 to-pink-500" },
  { name: "Sofia Reyes", role: "Head of Design", avatar: "SR", bg: "from-orange-500 to-yellow-500" },
  { name: "David Kim", role: "Head of Security", avatar: "DK", bg: "from-red-500 to-rose-500" },
  { name: "Amara Osei", role: "Head of Operations", avatar: "AO", bg: "from-indigo-500 to-purple-500" },
]

export default function AboutPage() {
  return (
    <div className="pt-24">

      {/* Hero */}
      <section className="relative py-20 overflow-hidden grid-bg">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-brand-blue/6 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block px-4 py-1.5 rounded-full border border-brand-blue/30 bg-brand-blue/10 text-brand-blue text-sm font-medium mb-6">
              Our Story
            </span>
            <h1 className="font-display text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              We&apos;re building the
              <br />
              <span className="bg-gradient-to-r from-brand-blue to-brand-emerald bg-clip-text text-transparent">
                future of finance.
              </span>
            </h1>
            <p className="text-white/50 text-xl max-w-2xl mx-auto">
              NexVault was founded in 2021 with a simple belief: everyone deserves access to a
              world-class banking and investment experience — not just the wealthy.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 border-y border-navy-border bg-navy-card/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-white/30 text-sm font-medium uppercase tracking-widest mb-4">Our Mission</p>
            <p className="font-display text-3xl lg:text-4xl font-bold text-white leading-snug">
              &ldquo;To democratize access to financial tools that create real,
              lasting wealth for individuals and families worldwide.&rdquo;
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-display text-4xl font-bold text-white mb-4">What we stand for</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-navy-card border border-navy-border rounded-2xl p-6"
              >
                <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-brand-blue" />
                </div>
                <h3 className="font-display font-bold text-white mb-2">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-navy-card/20 border-y border-navy-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="font-display text-4xl font-bold text-white mb-4">Meet the team</h2>
            <p className="text-white/40 text-lg">The people building NexVault</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {TEAM.map(({ name, role, avatar, bg }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex items-center gap-4 p-5 bg-navy-card border border-navy-border rounded-2xl"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${bg} flex items-center justify-center text-white font-bold font-display flex-shrink-0`}>
                  {avatar}
                </div>
                <div>
                  <p className="text-white font-semibold">{name}</p>
                  <p className="text-white/40 text-sm">{role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-4xl font-bold text-white mb-4">Ready to join us?</h2>
            <p className="text-white/50 mb-8">Open your account in under 5 minutes. No credit card required.</p>
            <Link href="/register">
              <Button className="h-13 px-10 bg-brand-blue hover:bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20">
                Create Free Account
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}