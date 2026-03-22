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
  icon: Icon, iconColor = "text-brand-blue",
  iconBg = "bg-brand-blue/10", delay = 0, className,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "bg-navy-card border border-navy-border rounded-2xl p-3.5 sm:p-5 hover:border-white/10 transition-colors",
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${iconColor}`} />
        </div>
        {change && (
          <span className={cn(
            "text-xs font-semibold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg",
            changePositive
              ? "text-brand-emerald bg-brand-emerald/10"
              : "text-red-400 bg-red-400/10"
          )}>
            {changePositive ? "+" : ""}{change}
          </span>
        )}
      </div>
      <p className="text-white/50 text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1 truncate">
        {title}
      </p>
      <p className="font-display text-lg sm:text-2xl font-bold text-white leading-tight truncate">
        {value}
      </p>
    </motion.div>
  )
}