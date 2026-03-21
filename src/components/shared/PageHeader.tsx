"use client"

import { ReactNode } from "react"
import { motion } from "framer-motion"

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
}

export default function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
    >
      <div>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-white mb-2">{title}</h1>
        {description && (
          <p className="text-white/60 text-sm max-w-2xl leading-relaxed">{description}</p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0 flex items-center gap-3">
          {action}
        </div>
      )}
    </motion.div>
  )
}