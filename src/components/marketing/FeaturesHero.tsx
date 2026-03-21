"use client"

import { motion } from "framer-motion"

export default function FeaturesHero() {
    return (
        <section className="relative pt-32 pb-20 overflow-hidden grid-bg">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-blue/8 rounded-full blur-[120px]" />
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <span className="inline-block px-4 py-1.5 rounded-full border border-brand-blue/30 bg-brand-blue/10 text-brand-blue text-sm font-medium mb-6">
                        Platform Features
                    </span>
                    <h1 className="font-display text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                        Everything you need,
                        <br />
                        <span className="text-white/40">nothing you don&apos;t.</span>
                    </h1>
                    <p className="text-white/50 text-xl max-w-2xl mx-auto">
                        NexVault brings together secure banking, smart investments, instant transfers,
                        and powerful analytics in one beautifully simple platform.
                    </p>
                </motion.div>
            </div>
        </section>
    )
}
