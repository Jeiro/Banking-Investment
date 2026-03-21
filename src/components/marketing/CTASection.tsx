"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CTASection() {
  return (
    <section className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 via-transparent to-brand-emerald/5 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-blue/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-gold/30 bg-brand-gold/10 text-brand-gold text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            No credit card required · Free forever plan
          </div>

          <h2 className="font-display text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Start growing your
            <br />
            wealth today.
          </h2>

          <p className="text-xl text-white/50 mb-12 max-w-xl mx-auto">
            Join over 50,000 users who trust NexVault to manage, grow, and protect their finances.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <Button
                size="lg"
                className="h-14 px-10 bg-brand-blue hover:bg-blue-600 text-white font-semibold text-base shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:-translate-y-0.5 rounded-xl"
              >
                Create Free Account
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-10 border-navy-border text-white/70 hover:text-white hover:bg-white/5 font-semibold text-base rounded-xl"
              >
                Talk to Sales
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}