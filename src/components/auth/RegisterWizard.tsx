"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight, ArrowLeft, Eye, EyeOff, Loader2,
  User, MapPin, Briefcase, Settings, Lock,
  Mail, Phone, Calendar, CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import StepIndicator from "./StepIndicator"
import Link from "next/link"

// ─── Types ───────────────────────────────────────────────────────────
interface FormData {
  // Step 1 — Personal
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  // Step 2 — Address
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  zipCode: string
  country: string
  // Step 3 — Employment
  employmentStatus: string
  annualIncome: string
  accountType: string
  // Step 4 — Password
  password: string
  confirmPassword: string
  // Step 5 — Terms
  termsAccepted: boolean
  privacyAccepted: boolean
  referralCode: string
}

const STEPS = [
  { number: 1, label: "Personal" },
  { number: 2, label: "Address" },
  { number: 3, label: "Profile" },
  { number: 4, label: "Security" },
  { number: 5, label: "Confirm" },
]

const INITIAL: FormData = {
  firstName: "", lastName: "", email: "", phone: "", dateOfBirth: "",
  addressLine1: "", addressLine2: "", city: "", state: "", zipCode: "", country: "US",
  employmentStatus: "", annualIncome: "", accountType: "personal",
  password: "", confirmPassword: "",
  termsAccepted: false, privacyAccepted: false, referralCode: "",
}

// ─── Field component ────────────────────────────────────────────────
function Field({
  label, id, error, icon: Icon, children,
}: {
  label: string; id: string; error?: string; icon?: React.ElementType; children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-white/70 text-sm">{label}</Label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 z-10 pointer-events-none" />}
        {children}
      </div>
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  )
}

const inputCls = (hasIcon: boolean, error?: string) =>
  cn(
    "h-12 bg-navy-card border-navy-border text-white placeholder:text-white/20 rounded-xl focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30 transition-all",
    hasIcon && "pl-10",
    error && "border-destructive focus:border-destructive"
  )

const selectCls = (error?: string) =>
  cn(
    "w-full h-12 bg-navy-card border border-navy-border text-white rounded-xl px-3 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30 outline-none transition-all text-sm",
    error && "border-destructive"
  )

// ─── Main Component ──────────────────────────────────────────────────
export default function RegisterWizard() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(INITIAL)
  const [errors, setErrors] = useState<Partial<FormData & { general: string }>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [direction, setDirection] = useState(1)

  const set = (key: keyof FormData, value: string | boolean) => {
    setForm((p) => ({ ...p, [key]: value }))
    setErrors((p) => ({ ...p, [key]: undefined }))
  }

  // ─── Validation per step ───────────────────────────────────────────
  function validateStep(s: number): boolean {
    const e: typeof errors = {}

    if (s === 1) {
      if (!form.firstName.trim()) e.firstName = "First name is required"
      if (!form.lastName.trim()) e.lastName = "Last name is required"
      if (!form.email) e.email = "Email is required"
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email"
      if (!form.phone) e.phone = "Phone number is required"
      if (!form.dateOfBirth) e.dateOfBirth = "Date of birth is required"
    }

    if (s === 2) {
      if (!form.addressLine1.trim()) e.addressLine1 = "Address is required"
      if (!form.city.trim()) e.city = "City is required"
      if (!form.state.trim()) e.state = "State / region is required"
      if (!form.zipCode.trim()) e.zipCode = "ZIP / postal code is required"
      if (!form.country) e.country = "Country is required"
    }

    if (s === 3) {
      if (!form.employmentStatus) e.employmentStatus = "Select employment status"
      if (!form.annualIncome) e.annualIncome = "Select annual income range"
      if (!form.accountType) e.accountType = "Select account type"
    }

    if (s === 4) {
      if (!form.password) e.password = "Password is required"
      else if (form.password.length < 8) e.password = "Password must be at least 8 characters"
      else if (!/[A-Z]/.test(form.password)) e.password = "Include at least one uppercase letter"
      else if (!/[0-9]/.test(form.password)) e.password = "Include at least one number"
      if (!form.confirmPassword) e.confirmPassword = "Please confirm your password"
      else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match"
    }

    if (s === 5) {
      if (!form.termsAccepted) e.termsAccepted = "You must accept the terms" as any
      if (!form.privacyAccepted) e.privacyAccepted = "You must accept the privacy policy" as any
    }

    setErrors(e)
    return Object.keys(e).length === 0
  }

  function next() {
    if (!validateStep(step)) return
    setDirection(1)
    setStep((s) => s + 1)
    window.scrollTo(0, 0)
  }

  function back() {
    setDirection(-1)
    setStep((s) => s - 1)
  }

  // ─── Submit ────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!validateStep(5)) return
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          first_name: form.firstName,
          last_name: form.lastName,
        },
      },
    })

    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }

    if (data.user) {
      // Update profile with all extra data
      await supabase.from("profiles").update({
        phone: form.phone,
        date_of_birth: form.dateOfBirth,
        address_line1: form.addressLine1,
        address_line2: form.addressLine2 || null,
        city: form.city,
        state: form.state,
        zip_code: form.zipCode,
        country: form.country,
        employment_status: form.employmentStatus,
        annual_income: form.annualIncome,
        account_type: form.accountType,
      }).eq("id", data.user.id)

      toast.success("Account created! Please check your email to verify.")
      router.push("/login")
    }

    setLoading(false)
  }

  // ─── Password strength ────────────────────────────────────────────
  function passwordStrength(p: string) {
    let score = 0
    if (p.length >= 8) score++
    if (p.length >= 12) score++
    if (/[A-Z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    return score
  }

  const strength = passwordStrength(form.password)
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Excellent"][strength]
  const strengthColor = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-emerald-500", "bg-emerald-400"][strength]

  // ─── Animation variants ────────────────────────────────────────────
  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
  }

  // ─── Render ────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-white mb-1">Create account</h1>
        <p className="text-white/50 text-sm">
          Step {step} of {STEPS.length} — {STEPS[step - 1].label} information
        </p>
      </div>

      {/* Step indicator */}
      <StepIndicator steps={STEPS} currentStep={step} />

      {/* Animated step content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >

          {/* ── STEP 1 — Personal Info ─────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="First name" id="firstName" error={errors.firstName} icon={User}>
                  <Input id="firstName" placeholder="John" value={form.firstName}
                    onChange={(e: any) => set("firstName", e.target.value)}
                    className={inputCls(true, errors.firstName)} />
                </Field>
                <Field label="Last name" id="lastName" error={errors.lastName}>
                  <Input id="lastName" placeholder="Doe" value={form.lastName}
                    onChange={(e: any) => set("lastName", e.target.value)}
                    className={inputCls(false, errors.lastName)} />
                </Field>
              </div>

              <Field label="Email address" id="email" error={errors.email} icon={Mail}>
                <Input id="email" type="email" placeholder="you@example.com" value={form.email}
                  onChange={(e: any) => set("email", e.target.value)}
                  className={inputCls(true, errors.email)} />
              </Field>

              <Field label="Phone number" id="phone" error={errors.phone} icon={Phone}>
                <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" value={form.phone}
                  onChange={(e: any) => set("phone", e.target.value)}
                  className={inputCls(true, errors.phone)} />
              </Field>

              <Field label="Date of birth" id="dob" error={errors.dateOfBirth} icon={Calendar}>
                <Input id="dob" type="date" value={form.dateOfBirth}
                  onChange={(e: any) => set("dateOfBirth", e.target.value)}
                  className={inputCls(true, errors.dateOfBirth)} />
              </Field>
            </div>
          )}

          {/* ── STEP 2 — Address ──────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-4">
              <Field label="Address line 1" id="addr1" error={errors.addressLine1} icon={MapPin}>
                <Input id="addr1" placeholder="123 Main Street" value={form.addressLine1}
                  onChange={(e: any) => set("addressLine1", e.target.value)}
                  className={inputCls(true, errors.addressLine1)} />
              </Field>

              <Field label="Address line 2 (optional)" id="addr2">
                <Input id="addr2" placeholder="Apt, suite, unit..." value={form.addressLine2}
                  onChange={(e: any) => set("addressLine2", e.target.value)}
                  className={inputCls(false)} />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="City" id="city" error={errors.city}>
                  <Input id="city" placeholder="New York" value={form.city}
                    onChange={(e: any) => set("city", e.target.value)}
                    className={inputCls(false, errors.city)} />
                </Field>
                <Field label="State / Region" id="state" error={errors.state}>
                  <Input id="state" placeholder="NY" value={form.state}
                    onChange={(e: any) => set("state", e.target.value)}
                    className={inputCls(false, errors.state)} />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="ZIP / Postal code" id="zip" error={errors.zipCode}>
                  <Input id="zip" placeholder="10001" value={form.zipCode}
                    onChange={(e: any) => set("zipCode", e.target.value)}
                    className={inputCls(false, errors.zipCode)} />
                </Field>
                <Field label="Country" id="country" error={errors.country}>
                  <select id="country" value={form.country}
                    onChange={(e: any) => set("country", e.target.value)}
                    className={selectCls(errors.country)}>
                    <option value="US">🇺🇸 United States</option>
                    <option value="GB">🇬🇧 United Kingdom</option>
                    <option value="CA">🇨🇦 Canada</option>
                    <option value="AU">🇦🇺 Australia</option>
                    <option value="NG">🇳🇬 Nigeria</option>
                    <option value="GH">🇬🇭 Ghana</option>
                    <option value="DE">🇩🇪 Germany</option>
                    <option value="FR">🇫🇷 France</option>
                    <option value="IN">🇮🇳 India</option>
                    <option value="SG">🇸🇬 Singapore</option>
                    <option value="AE">🇦🇪 UAE</option>
                    <option value="OTHER">🌍 Other</option>
                  </select>
                </Field>
              </div>
            </div>
          )}

          {/* ── STEP 3 — Employment / Profile ─────────────────────── */}
          {step === 3 && (
            <div className="space-y-4">
              <Field label="Employment status" id="employment" error={errors.employmentStatus} icon={Briefcase}>
                <select id="employment" value={form.employmentStatus}
                  onChange={(e: any) => set("employmentStatus", e.target.value)}
                  className={cn(selectCls(errors.employmentStatus), "pl-10")}>
                  <option value="">Select status</option>
                  <option value="employed">Employed (Full-time)</option>
                  <option value="self_employed">Self-Employed / Freelancer</option>
                  <option value="student">Student</option>
                  <option value="unemployed">Unemployed</option>
                  <option value="retired">Retired</option>
                </select>
              </Field>

              <Field label="Annual income" id="income" error={errors.annualIncome}>
                <select id="income" value={form.annualIncome}
                  onChange={(e: any) => set("annualIncome", e.target.value)}
                  className={selectCls(errors.annualIncome)}>
                  <option value="">Select income range</option>
                  <option value="under_25k">Under $25,000</option>
                  <option value="25k_50k">$25,000 – $50,000</option>
                  <option value="50k_100k">$50,000 – $100,000</option>
                  <option value="100k_250k">$100,000 – $250,000</option>
                  <option value="over_250k">Over $250,000</option>
                </select>
              </Field>

              <Field label="Account type" id="accountType" error={errors.accountType}>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {[
                    { value: "personal", label: "Personal", desc: "For individuals", emoji: "👤" },
                    { value: "business", label: "Business", desc: "For companies", emoji: "🏢" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set("accountType", opt.value)}
                      className={cn(
                        "p-4 rounded-xl border text-left transition-all",
                        form.accountType === opt.value
                          ? "border-brand-blue bg-brand-blue/10 text-white"
                          : "border-navy-border bg-navy-card text-white/60 hover:border-white/20"
                      )}
                    >
                      <div className="text-xl mb-1">{opt.emoji}</div>
                      <div className="font-semibold text-sm">{opt.label}</div>
                      <div className="text-xs text-white/40">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Referral code (optional)" id="referral">
                <Input id="referral" placeholder="e.g. NEXV1234" value={form.referralCode}
                  onChange={(e: any) => set("referralCode", e.target.value.toUpperCase())}
                  className={inputCls(false)} />
              </Field>
            </div>
          )}

          {/* ── STEP 4 — Password / Security ─────────────────────── */}
          {step === 4 && (
            <div className="space-y-4">
              <Field label="Create password" id="password" error={errors.password} icon={Lock}>
                <Input id="password" type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e: any) => set("password", e.target.value)}
                  className={cn(inputCls(true, errors.password), "pr-10")} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </Field>

              {/* Strength meter */}
              {form.password.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-all duration-300",
                          i <= strength ? strengthColor : "bg-navy-border"
                        )} />
                    ))}
                  </div>
                  <p className={cn("text-xs", strength <= 2 ? "text-orange-400" : "text-emerald-400")}>
                    {strengthLabel} password
                  </p>
                </div>
              )}

              {/* Requirements */}
              <div className="space-y-1.5 p-4 rounded-xl bg-navy-card border border-navy-border">
                <p className="text-white/40 text-xs font-medium mb-2">Password requirements:</p>
                {[
                  { label: "At least 8 characters", ok: form.password.length >= 8 },
                  { label: "One uppercase letter", ok: /[A-Z]/.test(form.password) },
                  { label: "One number", ok: /[0-9]/.test(form.password) },
                  { label: "One special character", ok: /[^A-Za-z0-9]/.test(form.password) },
                ].map(({ label, ok }) => (
                  <div key={label} className={cn("flex items-center gap-2 text-xs transition-colors", ok ? "text-brand-emerald" : "text-white/30")}>
                    <CheckCircle2 className={cn("w-3.5 h-3.5", ok ? "text-brand-emerald" : "text-white/20")} />
                    {label}
                  </div>
                ))}
              </div>

              <Field label="Confirm password" id="confirmPassword" error={errors.confirmPassword} icon={Lock}>
                <Input id="confirmPassword" type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={(e: any) => set("confirmPassword", e.target.value)}
                  className={cn(inputCls(true, errors.confirmPassword), "pr-10")} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </Field>
            </div>
          )}

          {/* ── STEP 5 — Review & Accept ─────────────────────────── */}
          {step === 5 && (
            <div className="space-y-5">
              {/* Summary card */}
              <div className="p-5 rounded-2xl border border-navy-border bg-navy-card space-y-3">
                <p className="text-white font-semibold text-sm mb-3">Account Summary</p>
                {[
                  { label: "Name", value: `${form.firstName} ${form.lastName}` },
                  { label: "Email", value: form.email },
                  { label: "Phone", value: form.phone },
                  { label: "Location", value: `${form.city}, ${form.country}` },
                  { label: "Account Type", value: form.accountType === "business" ? "Business" : "Personal" },
                  { label: "Employment", value: form.employmentStatus.replace("_", " ") },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-white/40">{label}</span>
                    <span className="text-white font-medium capitalize">{value}</span>
                  </div>
                ))}
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                {[
                  {
                    key: "termsAccepted" as const,
                    label: "I agree to the Terms of Service",
                    error: errors.termsAccepted,
                  },
                  {
                    key: "privacyAccepted" as const,
                    label: "I agree to the Privacy Policy",
                    error: errors.privacyAccepted,
                  },
                ].map(({ key, label, error }) => (
                  <div key={key}>
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div
                        onClick={() => set(key, !form[key])}
                        className={cn(
                          "mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all",
                          form[key]
                            ? "bg-brand-blue border-brand-blue"
                            : "border-navy-border group-hover:border-brand-blue/50"
                        )}
                      >
                        {form[key] && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-white/60 text-sm leading-relaxed">{label}</span>
                    </label>
                    {error && <p className="text-destructive text-xs mt-1 ml-8">{String(error)}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="flex gap-3 mt-8">
        {step > 1 && (
          <Button
            type="button"
            variant="outline"
            onClick={back}
            className="flex-1 h-12 border-navy-border text-white/70 hover:text-white hover:bg-white/5 rounded-xl"
          >
            <ArrowLeft className="mr-2 w-4 h-4" /> Back
          </Button>
        )}

        {step < 5 ? (
          <Button
            type="button"
            onClick={next}
            className="flex-1 h-12 bg-brand-blue hover:bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20"
          >
            Continue <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 h-12 bg-gradient-to-r from-brand-blue to-brand-emerald text-white font-semibold rounded-xl shadow-lg hover:opacity-90 transition-opacity"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>Create My Account <ArrowRight className="ml-2 w-4 h-4" /></>
            )}
          </Button>
        )}
      </div>

      {/* Sign in link */}
      <p className="text-center text-white/40 text-sm mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-brand-blue hover:underline font-medium">Sign in</Link>
      </p>
    </div>
  )
}