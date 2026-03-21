"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Home, ArrowLeft, Hexagon } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-navy flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-blue/10 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-brand-emerald/5 rounded-full blur-[120px] animate-pulse-slow font-delay-2000" />
        <div className="absolute inset-0 grid-bg opacity-30" />
      </div>

      <div className="max-w-md w-full text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-20 h-20 bg-gradient-to-br from-brand-blue to-brand-emerald rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-brand-blue/20">
            <Hexagon className="w-10 h-10 text-white fill-white/20" />
          </div>

          <h1 className="font-display text-8xl font-black text-white mb-2 tracking-tighter">
            404
          </h1>
          <h2 className="font-display text-2xl font-bold text-white mb-4">
            Lost in the vault?
          </h2>
          <p className="text-white/50 mb-10 leading-relaxed">
            The page you are looking for doesn&apos;t exist or has been moved to a more secure location.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/" className="flex-1">
              <Button className="w-full h-12 bg-brand-blue hover:bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="flex-1 h-12 border-navy-border text-white hover:bg-white/5 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-white/20 text-xs font-medium uppercase tracking-widest"
        >
          NexVault Internal Error Code: VOID_PATH_404
        </motion.p>
      </div>
    </div>
  )
}