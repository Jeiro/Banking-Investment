"use client"

import { motion } from "framer-motion"
import { Shield, Lock, Eye, Server, CheckCircle2 } from "lucide-react"

const pillars = [
  { icon: Lock, title: "256-Bit SSL Encryption", desc: "Military-grade encryption on all data in transit and at rest." },
  { icon: Eye, title: "Fraud Detection AI", desc: "Real-time AI monitors every transaction for suspicious activity." },
  { icon: Server, title: "99.9% Uptime", desc: "Distributed infrastructure with automatic failover and backups." },
  { icon: Shield, title: "Two-Factor Auth", desc: "Add an extra layer with TOTP authenticator or SMS verification." },
]

const certifications = ["SOC 2 Type II", "PCI DSS Level 1", "ISO 27001", "GDPR Compliant", "FDIC Insured"]

export default function SecuritySection() {
  return (
    <section className="py-28 relative overflow-hidden bg-navy-card/20 border-y border-navy-border">
      <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-20 items-center">

          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full border border-brand-emerald/30 bg-brand-emerald/10 text-brand-emerald text-sm font-medium mb-6">
              Security First
            </span>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Your security is
              <br />
              our top priority.
            </h2>
            <p className="text-white/50 text-lg leading-relaxed mb-10">
              We've built NexVault from the ground up with enterprise-grade security.
              Every feature, every transaction, every login — protected by layers of intelligent defense.
            </p>

            {/* Certifications */}
            <div className="flex flex-wrap gap-2">
              {certifications.map((cert) => (
                <div
                  key={cert}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-navy-border bg-navy-card text-white/60 text-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald" />
                  {cert}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pillars.map((p, i) => {
              const Icon = p.icon
              return (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="p-6 rounded-2xl bg-navy-card border border-navy-border hover:border-brand-blue/30 transition-colors"
                >
                  <div className="w-10 h-10 bg-brand-blue/10 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-brand-blue" />
                  </div>
                  <h3 className="font-display font-semibold text-white text-sm mb-2">{p.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{p.desc}</p>
                </motion.div>
              )
            })}
          </div>

        </div>
      </div>
    </section>
  )
}