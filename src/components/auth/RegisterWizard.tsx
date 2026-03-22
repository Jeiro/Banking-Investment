"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight, ArrowLeft, Eye, EyeOff, Loader2,
  User, MapPin, Briefcase, Lock,
  Mail, Phone, Calendar, CheckCircle2,
  Search, ChevronDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { CURRENCIES, getCurrency } from "@/lib/currencies"
import StepIndicator from "./StepIndicator"
import Link from "next/link"

// ─── Types ────────────────────────────────────────────────────────────────────
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
  // Step 3 — Account Preferences
  preferredCurrency: string
  employmentStatus: string
  annualIncome: string
  accountType: string
  referralCode: string
  // Step 4 — Password
  password: string
  confirmPassword: string
  // Step 5 — Terms
  termsAccepted: boolean
  privacyAccepted: boolean
}

const STEPS = [
  { number: 1, label: "Personal" },
  { number: 2, label: "Address" },
  { number: 3, label: "Account" },
  { number: 4, label: "Security" },
  { number: 5, label: "Confirm" },
]

const INITIAL: FormData = {
  firstName: "", lastName: "", email: "", phone: "", dateOfBirth: "",
  addressLine1: "", addressLine2: "", city: "", state: "", zipCode: "", country: "",
  preferredCurrency: "USD",
  employmentStatus: "", annualIncome: "", accountType: "personal", referralCode: "",
  password: "", confirmPassword: "",
  termsAccepted: false, privacyAccepted: false,
}

// ─── Currency Selector Component ─────────────────────────────────────────────
function CurrencySelector({
  value,
  onChange,
}: {
  value: string
  onChange: (code: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const selected = getCurrency(value)

  const filtered = CURRENCIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.country.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full h-12 bg-navy/60 border border-navy-border rounded-xl px-4 flex items-center justify-between text-left hover:border-brand-blue/50 focus:border-brand-blue transition-all"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{selected.flag}</span>
          <div>
            <span className="text-white font-medium text-sm">{selected.code}</span>
            <span className="text-white/40 text-xs ml-2">{selected.symbol}</span>
          </div>
          <span className="text-white/50 text-sm">{selected.name}</span>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-white/30 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-14 z-50 bg-navy-card border border-navy-border rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
          >
            {/* Search */}
            <div className="p-3 border-b border-navy-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                <input
                  type="text"
                  placeholder="Search currency or country..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoFocus
                  className="w-full pl-8 pr-3 py-2 bg-navy/60 border border-navy-border rounded-xl text-white text-sm placeholder:text-white/20 focus:border-brand-blue outline-none"
                />
              </div>
            </div>

            {/* Currency list */}
            <div className="max-h-60 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="py-8 text-center text-white/30 text-sm">
                  No currencies found
                </div>
              ) : (
                filtered.map((currency) => (
                  <button
                    key={currency.code}
                    type="button"
                    onClick={() => {
                      onChange(currency.code)
                      setOpen(false)
                      setSearch("")
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition-colors",
                      value === currency.code && "bg-brand-blue/10"
                    )}
                  >
                    <span className="text-xl flex-shrink-0">{currency.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold text-sm">
                          {currency.code}
                        </span>
                        <span className="text-white/40 text-xs">{currency.symbol}</span>
                      </div>
                      <p className="text-white/50 text-xs truncate">{currency.name}</p>
                    </div>
                    <span className="text-white/30 text-xs flex-shrink-0">
                      {currency.country}
                    </span>
                    {value === currency.code && (
                      <CheckCircle2 className="w-4 h-4 text-brand-blue flex-shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({
  label, id, error, icon: Icon, children,
}: {
  label: string
  id: string
  error?: string
  icon?: React.ElementType
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-white/70 text-sm">{label}</Label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 z-10 pointer-events-none" />
        )}
        {children}
      </div>
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  )
}

const inputCls = (hasIcon: boolean, error?: string) =>
  cn(
    "h-12 bg-navy/60 border-navy-border text-white placeholder:text-white/20 rounded-xl focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30 transition-all",
    hasIcon && "pl-10",
    error && "border-destructive focus:border-destructive"
  )

const selectCls = (error?: string) =>
  cn(
    "w-full h-12 bg-navy/60 border border-navy-border text-white rounded-xl px-3 focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30 outline-none transition-all text-sm appearance-none",
    error && "border-destructive"
  )

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RegisterWizard() {
  const router = useRouter()
  const supabase = createClient()

  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(INITIAL)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData | "general", string>>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [direction, setDirection] = useState(1)

  const set = (key: keyof FormData, value: string | boolean) => {
    setForm((p) => ({ ...p, [key]: value }))
    setErrors((p) => ({ ...p, [key]: undefined }))
  }

  // ─── Validation ─────────────────────────────────────────────────────────────
  function validateStep(s: number): boolean {
    const e: typeof errors = {}

    if (s === 1) {
      if (!form.firstName.trim()) e.firstName = "First name is required"
      if (!form.lastName.trim()) e.lastName = "Last name is required"
      if (!form.email) e.email = "Email is required"
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        e.email = "Enter a valid email address"
      if (!form.phone) e.phone = "Phone number is required"
      else if (form.phone.replace(/\D/g, "").length < 7)
        e.phone = "Enter a valid phone number"
      if (!form.dateOfBirth) e.dateOfBirth = "Date of birth is required"
      else {
        const age = Math.floor(
          (Date.now() - new Date(form.dateOfBirth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
        )
        if (age < 18) e.dateOfBirth = "You must be at least 18 years old"
      }
    }

    if (s === 2) {
      if (!form.addressLine1.trim()) e.addressLine1 = "Address is required"
      if (!form.city.trim()) e.city = "City is required"
      if (!form.state.trim()) e.state = "State / region is required"
      if (!form.zipCode.trim()) e.zipCode = "ZIP / postal code is required"
      if (!form.country) e.country = "Country is required"
    }

    if (s === 3) {
      if (!form.preferredCurrency) e.preferredCurrency = "Please select a currency"
      if (!form.employmentStatus) e.employmentStatus = "Select employment status"
      if (!form.annualIncome) e.annualIncome = "Select annual income range"
    }

    if (s === 4) {
      if (!form.password) e.password = "Password is required"
      else if (form.password.length < 8)
        e.password = "Password must be at least 8 characters"
      else if (!/[A-Z]/.test(form.password))
        e.password = "Include at least one uppercase letter"
      else if (!/[0-9]/.test(form.password))
        e.password = "Include at least one number"
      if (!form.confirmPassword)
        e.confirmPassword = "Please confirm your password"
      else if (form.password !== form.confirmPassword)
        e.confirmPassword = "Passwords do not match"
    }

    if (s === 5) {
      if (!form.termsAccepted)
        e.termsAccepted = "You must accept the terms of service"
      if (!form.privacyAccepted)
        e.privacyAccepted = "You must accept the privacy policy"
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

  // ─── Submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!validateStep(5)) return
    setLoading(true)

    const selectedCurrency = getCurrency(form.preferredCurrency)

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
      // Update the profile with full registration details
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
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
          preferred_currency: form.preferredCurrency,
          currency_symbol: selectedCurrency.symbol,
        })
        .eq("id", data.user.id)

      if (profileError) {
        console.error("Profile update error:", profileError)
      }

      // Update all created accounts to use the selected currency
      await supabase
        .from("accounts")
        .update({ currency: form.preferredCurrency })
        .eq("user_id", data.user.id)

      // Send welcome notification
      await supabase.from("notifications").insert({
        user_id: data.user.id,
        title: "Welcome to NexVault! 🎉",
        message: `Your account has been created in ${selectedCurrency.name} (${selectedCurrency.code}). Complete your KYC verification to unlock all features.`,
        type: "success",
      })

      toast.success(
        "Account created! Please check your email to verify your address."
      )
      router.push("/login")
    }

    setLoading(false)
  }

  // ─── Password strength ───────────────────────────────────────────────────────
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
  const strengthColor = [
    "",
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-brand-emerald",
    "bg-brand-emerald",
  ][strength]

  // ─── Animation variants ──────────────────────────────────────────────────────
  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
  }

  const selectedCurrency = getCurrency(form.preferredCurrency)

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold text-white mb-1">
          Open your account
        </h1>
        <p className="text-white/50 text-sm">
          Step {step} of {STEPS.length} —{" "}
          <span className="text-white/70">{STEPS[step - 1].label}</span>
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
          {/* ── STEP 1 — Personal Information ─────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-4 bg-brand-blue/5 border border-brand-blue/20 rounded-xl mb-2">
                <p className="text-white/60 text-xs leading-relaxed">
                  Please provide your legal name and details exactly as they appear
                  on your government-issued ID. This information is required for
                  identity verification.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="First name *" id="firstName" error={errors.firstName} icon={User}>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={form.firstName}
                    onChange={(e) => set("firstName", e.target.value)}
                    className={inputCls(true, errors.firstName)}
                  />
                </Field>
                <Field label="Last name *" id="lastName" error={errors.lastName}>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={form.lastName}
                    onChange={(e) => set("lastName", e.target.value)}
                    className={inputCls(false, errors.lastName)}
                  />
                </Field>
              </div>

              <Field label="Email address *" id="email" error={errors.email} icon={Mail}>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  className={inputCls(true, errors.email)}
                />
              </Field>

              <Field label="Phone number *" id="phone" error={errors.phone} icon={Phone}>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className={inputCls(true, errors.phone)}
                />
              </Field>

              <Field
                label="Date of birth * (must be 18+)"
                id="dob"
                error={errors.dateOfBirth}
                icon={Calendar}
              >
                <Input
                  id="dob"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => set("dateOfBirth", e.target.value)}
                  max={new Date(
                    new Date().setFullYear(new Date().getFullYear() - 18)
                  )
                    .toISOString()
                    .split("T")[0]}
                  className={inputCls(true, errors.dateOfBirth)}
                />
              </Field>
            </div>
          )}

          {/* ── STEP 2 — Address ───────────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-4 bg-brand-blue/5 border border-brand-blue/20 rounded-xl mb-2">
                <p className="text-white/60 text-xs leading-relaxed">
                  Provide your current residential address. This must match your
                  proof of address document that you will upload during KYC
                  verification.
                </p>
              </div>

              <Field
                label="Address line 1 *"
                id="addr1"
                error={errors.addressLine1}
                icon={MapPin}
              >
                <Input
                  id="addr1"
                  placeholder="123 Main Street"
                  value={form.addressLine1}
                  onChange={(e) => set("addressLine1", e.target.value)}
                  className={inputCls(true, errors.addressLine1)}
                />
              </Field>

              <Field label="Address line 2 (optional)" id="addr2">
                <Input
                  id="addr2"
                  placeholder="Apartment, suite, unit..."
                  value={form.addressLine2}
                  onChange={(e) => set("addressLine2", e.target.value)}
                  className={inputCls(false)}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="City *" id="city" error={errors.city}>
                  <Input
                    id="city"
                    placeholder="New York"
                    value={form.city}
                    onChange={(e) => set("city", e.target.value)}
                    className={inputCls(false, errors.city)}
                  />
                </Field>
                <Field label="State / Region *" id="state" error={errors.state}>
                  <Input
                    id="state"
                    placeholder="NY"
                    value={form.state}
                    onChange={(e) => set("state", e.target.value)}
                    className={inputCls(false, errors.state)}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="ZIP / Postal code *" id="zip" error={errors.zipCode}>
                  <Input
                    id="zip"
                    placeholder="10001"
                    value={form.zipCode}
                    onChange={(e) => set("zipCode", e.target.value)}
                    className={inputCls(false, errors.zipCode)}
                  />
                </Field>
                <Field label="Country *" id="country" error={errors.country}>
                  <select
                    id="country"
                    value={form.country}
                    onChange={(e) => set("country", e.target.value)}
                    className={selectCls(errors.country)}
                  >
                    <option value="">Select country</option>
                    <option value="US">🇺🇸 United States</option>
                    <option value="GB">🇬🇧 United Kingdom</option>
                    <option value="CA">🇨🇦 Canada</option>
                    <option value="AU">🇦🇺 Australia</option>
                    <option value="NG">🇳🇬 Nigeria</option>
                    <option value="GH">🇬🇭 Ghana</option>
                    <option value="KE">🇰🇪 Kenya</option>
                    <option value="ZA">🇿🇦 South Africa</option>
                    <option value="DE">🇩🇪 Germany</option>
                    <option value="FR">🇫🇷 France</option>
                    <option value="IN">🇮🇳 India</option>
                    <option value="SG">🇸🇬 Singapore</option>
                    <option value="AE">🇦🇪 UAE</option>
                    <option value="SA">🇸🇦 Saudi Arabia</option>
                    <option value="EG">🇪🇬 Egypt</option>
                    <option value="TZ">🇹🇿 Tanzania</option>
                    <option value="UG">🇺🇬 Uganda</option>
                    <option value="BR">🇧🇷 Brazil</option>
                    <option value="MX">🇲🇽 Mexico</option>
                    <option value="JP">🇯🇵 Japan</option>
                    <option value="CN">🇨🇳 China</option>
                    <option value="OTHER">🌍 Other</option>
                  </select>
                </Field>
              </div>
            </div>
          )}

          {/* ── STEP 3 — Account Preferences ──────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-5">
              {/* Currency Selection — the hero of this step */}
              <div className="space-y-2">
                <Label className="text-white/70 text-sm font-medium">
                  Account Currency *
                </Label>
                <p className="text-white/40 text-xs">
                  Choose the primary currency for your NexVault accounts.
                  All balances, deposits, and withdrawals will be in this currency.
                </p>
                <CurrencySelector
                  value={form.preferredCurrency}
                  onChange={(code) => set("preferredCurrency", code)}
                />
                {errors.preferredCurrency && (
                  <p className="text-destructive text-xs">{errors.preferredCurrency}</p>
                )}

                {/* Selected currency preview */}
                <div className="flex items-center gap-3 p-3 bg-brand-blue/5 border border-brand-blue/20 rounded-xl mt-2">
                  <span className="text-2xl">{selectedCurrency.flag}</span>
                  <div>
                    <p className="text-white text-sm font-medium">
                      {selectedCurrency.name}
                    </p>
                    <p className="text-white/40 text-xs">
                      Your accounts will be denominated in{" "}
                      <span className="text-brand-blue font-semibold">
                        {selectedCurrency.code} ({selectedCurrency.symbol})
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Account type */}
              <div className="space-y-2">
                <Label className="text-white/70 text-sm">Account Type *</Label>
                <div className="grid grid-cols-2 gap-3">
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
                          : "border-navy-border text-white/60 hover:border-white/20"
                      )}
                    >
                      <div className="text-xl mb-1">{opt.emoji}</div>
                      <div className="font-semibold text-sm">{opt.label}</div>
                      <div className="text-xs text-white/40 mt-0.5">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Employment */}
              <Field
                label="Employment status *"
                id="employment"
                error={errors.employmentStatus}
                icon={Briefcase}
              >
                <select
                  id="employment"
                  value={form.employmentStatus}
                  onChange={(e) => set("employmentStatus", e.target.value)}
                  className={cn(selectCls(errors.employmentStatus), "pl-10")}
                >
                  <option value="">Select status</option>
                  <option value="employed">Employed (Full-time)</option>
                  <option value="self_employed">Self-Employed / Freelancer</option>
                  <option value="business_owner">Business Owner</option>
                  <option value="student">Student</option>
                  <option value="unemployed">Unemployed</option>
                  <option value="retired">Retired</option>
                </select>
              </Field>

              {/* Annual income */}
              <Field
                label="Annual income *"
                id="income"
                error={errors.annualIncome}
              >
                <select
                  id="income"
                  value={form.annualIncome}
                  onChange={(e) => set("annualIncome", e.target.value)}
                  className={selectCls(errors.annualIncome)}
                >
                  <option value="">Select income range</option>
                  <option value="under_25k">Under $25,000</option>
                  <option value="25k_50k">$25,000 – $50,000</option>
                  <option value="50k_100k">$50,000 – $100,000</option>
                  <option value="100k_250k">$100,000 – $250,000</option>
                  <option value="over_250k">Over $250,000</option>
                </select>
              </Field>

              {/* Referral code */}
              <Field label="Referral code (optional)" id="referral">
                <Input
                  id="referral"
                  placeholder="e.g. NEXV1234"
                  value={form.referralCode}
                  onChange={(e) =>
                    set("referralCode", e.target.value.toUpperCase())
                  }
                  className={inputCls(false)}
                />
              </Field>
            </div>
          )}

          {/* ── STEP 4 — Password / Security ──────────────────────────────── */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="p-4 bg-brand-blue/5 border border-brand-blue/20 rounded-xl">
                <p className="text-white/60 text-xs leading-relaxed">
                  Create a strong password to protect your account. Never share
                  your password with anyone, including NexVault staff.
                </p>
              </div>

              <Field
                label="Create password *"
                id="password"
                error={errors.password}
                icon={Lock}
              >
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  className={cn(inputCls(true, errors.password), "pr-10")}
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
              </Field>

              {/* Strength meter */}
              {form.password.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-all duration-300",
                          i <= strength ? strengthColor : "bg-navy-border"
                        )}
                      />
                    ))}
                  </div>
                  <p
                    className={cn(
                      "text-xs",
                      strength <= 2 ? "text-orange-400" : "text-brand-emerald"
                    )}
                  >
                    {strengthLabel} password
                  </p>
                </div>
              )}

              {/* Requirements checklist */}
              <div className="space-y-1.5 p-4 rounded-xl bg-navy-card border border-navy-border">
                <p className="text-white/40 text-xs font-medium mb-2">
                  Password requirements:
                </p>
                {[
                  { label: "At least 8 characters", ok: form.password.length >= 8 },
                  { label: "One uppercase letter (A–Z)", ok: /[A-Z]/.test(form.password) },
                  { label: "One number (0–9)", ok: /[0-9]/.test(form.password) },
                  { label: "One special character (!@#$...)", ok: /[^A-Za-z0-9]/.test(form.password) },
                ].map(({ label, ok }) => (
                  <div
                    key={label}
                    className={cn(
                      "flex items-center gap-2 text-xs transition-colors",
                      ok ? "text-brand-emerald" : "text-white/30"
                    )}
                  >
                    <CheckCircle2
                      className={cn(
                        "w-3.5 h-3.5",
                        ok ? "text-brand-emerald" : "text-white/20"
                      )}
                    />
                    {label}
                  </div>
                ))}
              </div>

              <Field
                label="Confirm password *"
                id="confirmPassword"
                error={errors.confirmPassword}
                icon={Lock}
              >
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={(e) => set("confirmPassword", e.target.value)}
                  className={cn(
                    inputCls(true, errors.confirmPassword),
                    "pr-10"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </Field>
            </div>
          )}

          {/* ── STEP 5 — Review & Confirm ──────────────────────────────────── */}
          {step === 5 && (
            <div className="space-y-5">
              {/* Full summary card */}
              <div className="p-5 rounded-2xl border border-navy-border bg-navy-card space-y-3">
                <p className="text-white font-display font-semibold text-sm mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-emerald" />
                  Application Summary
                </p>
                {[
                  { label: "Full Name", value: `${form.firstName} ${form.lastName}` },
                  { label: "Email", value: form.email },
                  { label: "Phone", value: form.phone },
                  { label: "Date of Birth", value: form.dateOfBirth },
                  { label: "Address", value: `${form.city}, ${form.state}, ${form.country}` },
                  {
                    label: "Account Currency",
                    value: `${selectedCurrency.flag} ${selectedCurrency.name} (${selectedCurrency.code})`,
                  },
                  {
                    label: "Account Type",
                    value: form.accountType === "business" ? "Business" : "Personal",
                  },
                  {
                    label: "Employment",
                    value: form.employmentStatus.replace(/_/g, " "),
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm gap-4">
                    <span className="text-white/40 flex-shrink-0">{label}</span>
                    <span className="text-white font-medium text-right capitalize truncate">
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* What happens next */}
              <div className="p-4 bg-brand-emerald/5 border border-brand-emerald/20 rounded-xl space-y-2">
                <p className="text-brand-emerald text-xs font-semibold mb-2">
                  What happens after you submit:
                </p>
                {[
                  "Verify your email address",
                  "Log in and complete KYC identity verification",
                  "Make your first deposit and start using NexVault",
                ].map((step, i) => (
                  <div key={step} className="flex items-center gap-2.5 text-white/60 text-xs">
                    <span className="w-5 h-5 rounded-full bg-brand-emerald/20 text-brand-emerald text-xs flex items-center justify-center flex-shrink-0 font-bold">
                      {i + 1}
                    </span>
                    {step}
                  </div>
                ))}
              </div>

              {/* Terms checkboxes */}
              <div className="space-y-3">
                {[
                  {
                    key: "termsAccepted" as const,
                    label: "I agree to the Terms of Service and confirm all information provided is accurate and truthful",
                    error: errors.termsAccepted,
                  },
                  {
                    key: "privacyAccepted" as const,
                    label: "I agree to the Privacy Policy and consent to NexVault processing my personal data",
                    error: errors.privacyAccepted,
                  },
                ].map(({ key, label, error }) => (
                  <div key={key}>
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <div
                        onClick={() => set(key, !form[key])}
                        className={cn(
                          "mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer",
                          form[key]
                            ? "bg-brand-blue border-brand-blue"
                            : "border-navy-border group-hover:border-brand-blue/50"
                        )}
                      >
                        {form[key] && (
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <span className="text-white/60 text-sm leading-relaxed">
                        {label}
                      </span>
                    </label>
                    {error && (
                      <p className="text-destructive text-xs mt-1 ml-8">
                        {String(error)}
                      </p>
                    )}
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
            className="flex-1 h-12 bg-gradient-to-r from-brand-blue to-brand-emerald text-white font-semibold rounded-xl shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Open My Account <ArrowRight className="ml-2 w-4 h-4" />
              </>
            )}
          </Button>
        )}
      </div>

      <p className="text-center text-white/40 text-sm mt-6">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-brand-blue hover:underline font-medium"
        >
          Sign in
        </Link>
      </p>
    </div>
  )
}