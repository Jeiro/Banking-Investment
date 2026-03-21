"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

export default function ForgotPasswordForm() {
    const supabase = createClient()
    const [email, setEmail] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!email) { setError("Email is required"); return }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Enter a valid email"); return }

        setLoading(true)
        const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
        })

        if (err) { toast.error(err.message); setLoading(false); return }

        setSent(true)
        setLoading(false)
    }

    if (sent) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
            >
                <div className="w-16 h-16 bg-brand-emerald/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-8 h-8 text-brand-emerald" />
                </div>
                <h1 className="font-display text-2xl font-bold text-white mb-3">Check your email</h1>
                <p className="text-white/50 text-sm leading-relaxed mb-8">
                    We've sent a password reset link to <span className="text-white font-medium">{email}</span>.
                    Check your inbox and click the link to reset your password.
                </p>
                <Link href="/login">
                    <Button variant="outline" className="border-navy-border text-white/70 hover:text-white rounded-xl">
                        <ArrowLeft className="mr-2 w-4 h-4" /> Back to Sign In
                    </Button>
                </Link>
            </motion.div>
        )
    }

    return (
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-8">
                <h1 className="font-display text-3xl font-bold text-white mb-2">Reset password</h1>
                <p className="text-white/50 text-sm">
                    Enter your email and we'll send you a reset link.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-white/70 text-sm">Email address</Label>
                    <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                        <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e: any) => { setEmail(e.target.value); setError("") }}
                            className={cn(
                                "pl-10 h-12 bg-navy-card border-navy-border text-white placeholder:text-white/20 rounded-xl focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30 transition-all",
                                error && "border-destructive"
                            )}
                        />
                    </div>
                    {error && <p className="text-destructive text-xs">{error}</p>}
                </div>

                <Button type="submit" disabled={loading}
                    className="w-full h-12 bg-brand-blue hover:bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Link"}
                </Button>
            </form>

            <div className="mt-6 text-center">
                <Link href="/login" className="text-white/40 hover:text-white text-sm flex items-center justify-center gap-2 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Sign In
                </Link>
            </div>
        </motion.div>
    )
}