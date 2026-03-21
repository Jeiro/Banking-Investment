"use client"

import { motion } from "framer-motion"

export default function FAQHero() {
    return (
        <section className="relative pt-32 pb-10 overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-blue/6 rounded-full blur-[120px]" />
            </div>
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <span className="inline-block px-4 py-1.5 rounded-full border border-brand-blue/30 bg-brand-blue/10 text-brand-blue text-sm font-medium mb-6">
                        Help Center
                    </span>
                    <h1 className="font-display text-5xl font-bold text-white mb-5">
                        Frequently asked
                        <br />
                        <span className="text-white/40">questions.</span>
                    </h1>
                    <p className="text-white/50 text-lg">
                        Everything you need to know about NexVault.
                        Can&apos;t find the answer you need? Contact our support team.
                    </p>
                </motion.div>
            </div>
        </section>
    )
}
