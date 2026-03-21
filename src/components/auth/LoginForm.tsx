"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

export default function LoginForm() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  function validate() {
    const errs: typeof errors = {}
    if (!email) errs.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Enter a valid email"
    if (!password) errs.password = "Password is required"
    else if (password.length < 6)
      errs.password = "Password must be at least 6 characters"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast.error("Invalid email or password")
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single()

    toast.success("Welcome back!")

    // Only admin role goes to admin panel
    if (profile?.role === "admin") {
      router.push("/admin/overview")
    } else {
      router.push("/dashboard/overview")
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-2">
          Welcome back
        </h1>
        <p className="text-white/50 text-sm">
          Sign in to your NexVault account to continue.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-white/70 text-sm">
            Email address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors((p) => ({ ...p, email: undefined }))
              }}
              className={cn(
                "pl-10 h-12 bg-navy-card border-navy-border text-white placeholder:text-white/20 rounded-xl focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30 transition-all",
                errors.email && "border-destructive focus:border-destructive"
              )}
            />
          </div>
          {errors.email && (
            <p className="text-destructive text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-white/70 text-sm">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-brand-blue text-xs hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (errors.password)
                  setErrors((p) => ({ ...p, password: undefined }))
              }}
              className={cn(
                "pl-10 pr-10 h-12 bg-navy-card border-navy-border text-white placeholder:text-white/20 rounded-xl focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30 transition-all",
                errors.password && "border-destructive focus:border-destructive"
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-destructive text-xs mt-1">{errors.password}</p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-brand-blue hover:bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Sign In <ArrowRight className="ml-2 w-4 h-4" />
            </>
          )}
        </Button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-navy-border" />
        <span className="text-white/30 text-xs">NEW TO NEXVAULT</span>
        <div className="flex-1 h-px bg-navy-border" />
      </div>

      <p className="text-center text-white/40 text-sm">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-brand-blue hover:underline font-medium"
        >
          Create one free
        </Link>
      </p>
    </motion.div>
  )
}