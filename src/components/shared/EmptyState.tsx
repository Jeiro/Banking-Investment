"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export default function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-navy-border rounded-2xl bg-navy/20",
        className
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-navy-card border border-navy-border flex items-center justify-center mb-5 shadow-lg shadow-black/20">
        <Icon className="w-8 h-8 text-white/30" />
      </div>
      <h3 className="font-display font-semibold text-white text-lg mb-2">{title}</h3>
      <p className="text-white/40 text-sm max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </motion.div>
  )
}