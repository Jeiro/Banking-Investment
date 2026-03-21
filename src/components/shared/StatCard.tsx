"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  change?: string
  changePositive?: boolean
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  delay?: number
  className?: string
}

export default function StatCard({
  title, value, change, changePositive = true,
  icon: Icon, iconColor = "text-brand-blue", iconBg = "bg-brand-blue/10",
  delay = 0, className,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "bg-navy-card border border-navy-border rounded-2xl p-5 hover:border-white/10 transition-colors",
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        {change && (
          <span className={cn(
            "text-xs font-semibold px-2 py-1 rounded-lg",
            changePositive
              ? "text-brand-emerald bg-brand-emerald/10"
              : "text-red-400 bg-red-400/10"
          )}>
            {changePositive ? "+" : ""}{change}
          </span>
        )}
      </div>
      <p className="text-white/50 text-xs font-medium mb-1">{title}</p>
      <p className="font-display text-2xl font-bold text-white">{value}</p>
    </motion.div>
  )
}