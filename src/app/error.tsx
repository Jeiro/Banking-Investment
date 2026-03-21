"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, RotateCcw, Home, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("NexVault Global Error:", error)
    }, [error])

    return (
        <div className="min-h-screen bg-navy flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-destructive/10 rounded-full blur-[140px]" />
            </div>

            <div className="max-w-lg w-full bg-navy-card border border-navy-border rounded-3xl p-8 md:p-12 text-center shadow-2xl relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert className="w-8 h-8 text-destructive" />
                    </div>

                    <h1 className="font-display text-3xl font-bold text-white mb-3">
                        Something went wrong
                    </h1>
                    <p className="text-white/50 mb-8 leading-relaxed">
                        We encountered an unexpected security or system hurdle.
                        Our automated monitoring system has been notified.
                        <br />
                        <span className="text-white/20 text-xs mt-2 block font-mono">
                            Error ID: {error.digest || "INTERNAL_VAULT_FAILURE"}
                        </span>
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <Button
                            onClick={() => reset()}
                            className="h-12 bg-white text-navy hover:bg-white/90 font-bold rounded-xl"
                        >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Try Again
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => window.location.href = "/"}
                            className="h-12 border-navy-border text-white hover:bg-white/5 rounded-xl"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            Return Home
                        </Button>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
