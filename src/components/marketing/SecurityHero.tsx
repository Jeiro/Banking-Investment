"use client"

import { motion } from "framer-motion"
import { Shield, Lock, Eye, Server, CheckCircle2 } from "lucide-react"

const STATS = [
    { icon: Shield, value: "256-bit", label: "AES Encryption" },
    { icon: Lock, value: "SOC 2", label: "Type II Certified" },
    { icon: Eye, value: "24/7", label: "Fraud Monitoring" },
    { icon: Server, value: "99.9%", label: "Uptime SLA" },
]

export default function SecurityHero() {
    return (
        <section className="relative pt-32 pb-20 overflow-hidden grid-bg">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-emerald/5 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-1.5 rounded-full border border-brand-emerald/30 bg-brand-emerald/10 text-brand-emerald text-sm font-medium mb-6">
                        Security First
                    </span>
                    <h1 className="font-display text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                        Your money is safe
                        <br />
                        <span className="text-white/40">with us. Always.</span>
                    </h1>
                    <p className="text-white/50 text-xl max-w-2xl mx-auto">
                        NexVault is built on a foundation of enterprise-grade security.
                        Every layer of our platform is designed to protect what matters most — your money and data.
                    </p>
                </motion.div>

                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
                    {STATS.map(({ icon: Icon, value, label }, i) => (
                        <motion.div
                            key={label}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                            className="bg-navy-card border border-navy-border rounded-2xl p-5 text-center"
                        >
                            <div className="w-10 h-10 bg-brand-emerald/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <Icon className="w-5 h-5 text-brand-emerald" />
                            </div>
                            <p className="font-display font-bold text-white text-xl">{value}</p>
                            <p className="text-white/40 text-xs mt-0.5">{label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
