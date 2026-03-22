"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowDownCircle, ArrowUpCircle, Send,
  TrendingUp, FileText, ShieldCheck,
} from "lucide-react"

const actions = [
  { label: "Deposit", href: "/dashboard/deposit", icon: ArrowDownCircle, color: "from-brand-emerald/20 to-brand-emerald/5", iconColor: "text-brand-emerald", border: "border-brand-emerald/20" },
  { label: "Withdraw", href: "/dashboard/withdraw", icon: ArrowUpCircle, color: "from-red-500/20 to-red-500/5", iconColor: "text-red-400", border: "border-red-500/20" },
  { label: "Transfer", href: "/dashboard/transfer", icon: Send, color: "from-brand-blue/20 to-brand-blue/5", iconColor: "text-brand-blue", border: "border-brand-blue/20" },
  { label: "Invest", href: "/dashboard/investments", icon: TrendingUp, color: "from-purple-500/20 to-purple-500/5", iconColor: "text-purple-400", border: "border-purple-500/20" },
  { label: "Statement", href: "/dashboard/statements", icon: FileText, color: "from-orange-500/20 to-orange-500/5", iconColor: "text-orange-400", border: "border-orange-500/20" },
  { label: "Verify KYC", href: "/dashboard/kyc", icon: ShieldCheck, color: "from-cyan-500/20 to-cyan-500/5", iconColor: "text-cyan-400", border: "border-cyan-500/20" },
]

export default function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-navy-card border border-navy-border rounded-2xl p-4 sm:p-5"
    >
      <h3 className="font-display font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">
        Quick Actions
      </h3>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {actions.map(({ label, href, icon: Icon, color, iconColor, border }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 + i * 0.06 }}
          >
            <Link
              href={href}
              className={`flex flex-col items-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-xl border ${border} bg-gradient-to-br ${color} hover:scale-105 active:scale-95 transition-all duration-200 text-center`}
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-navy-card/80 rounded-xl flex items-center justify-center">
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${iconColor}`} />
              </div>
              <span className="text-white/80 text-[10px] sm:text-xs font-medium leading-tight">
                {label}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}