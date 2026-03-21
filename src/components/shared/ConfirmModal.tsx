"use client"

import { motion, AnimatePresence } from "framer-motion"
import { AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
  loading?: boolean
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDestructive = false,
  loading = false,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={loading ? undefined : onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative bg-navy-card border border-navy-border rounded-2xl w-full max-w-sm shadow-2xl p-6 overflow-hidden"
          >
            <div className="flex flex-col items-center text-center">
              <div className={`w-12 h-12 rounded-full mb-4 flex items-center justify-center ${isDestructive ? 'bg-red-500/10' : 'bg-brand-blue/10'}`}>
                <AlertCircle className={`w-6 h-6 ${isDestructive ? 'text-red-500' : 'text-brand-blue'}`} />
              </div>
              <h3 className="font-display font-bold text-xl text-white mb-2">{title}</h3>
              <p className="text-white/60 text-sm mb-8 leading-relaxed">
                {description}
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1 border-navy-border text-white/70 hover:text-white rounded-xl h-11"
                onClick={onClose}
                disabled={loading}
              >
                {cancelText}
              </Button>
              <Button
                variant={isDestructive ? "destructive" : "default"}
                className="flex-1 rounded-xl h-11 font-semibold"
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmText}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}