"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  TrendingUp, Lock, Clock, ChevronRight,
  ArrowRight, Loader2, CheckCircle2,
  BarChart3, Shield, Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency, cn } from "@/lib/utils"
import type { InvestmentPlan, Investment } from "@/types/database"

const RISK_CONFIG = {
  low: { color: "text-brand-emerald", bg: "bg-brand-emerald/10", border: "border-brand-emerald/20", label: "Low Risk" },
  medium: { color: "text-brand-gold", bg: "bg-brand-gold/10", border: "border-brand-gold/20", label: "Medium Risk" },
  high: { color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20", label: "High Risk" },
}

export default function InvestmentsPage() {
  const supabase = createClient()
  const [plans, setPlans] = useState<InvestmentPlan[]>([])
  const [investments, setInvestments] = useState<any[]>([])
  const [selectedPlan, setSelectedPlan] = useState<InvestmentPlan | null>(null)
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(true)
  const [investing, setInvesting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [primaryBalance, setPrimaryBalance] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const [{ data: plansData }, { data: invData }, { data: accData }] = await Promise.all([
        supabase.from("investment_plans").select("*").eq("is_active", true).order("min_amount"),
        supabase.from("investments").select("*, investment_plans(name,return_rate,duration_days)")
          .eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("accounts").select("available_balance").eq("user_id", user.id).eq("is_primary", true).single(),
      ])

      if (plansData) setPlans(plansData)
      if (invData) setInvestments(invData)
      if (accData) setPrimaryBalance(accData.available_balance)
      setLoading(false)
    }
    load()
  }, [])

  const numAmount = parseFloat(amount) || 0
  const expectedReturn = selectedPlan
    ? numAmount * selectedPlan.return_rate * (selectedPlan.duration_days / 365)
    : 0
  const endDate = selectedPlan
    ? new Date(Date.now() + selectedPlan.duration_days * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : null

  async function handleInvest() {
    if (!selectedPlan || !userId) return
    if (numAmount < selectedPlan.min_amount) {
      toast.error(`Minimum investment is ${formatCurrency(selectedPlan.min_amount)}`)
      return
    }
    if (selectedPlan.max_amount && numAmount > selectedPlan.max_amount) {
      toast.error(`Maximum investment is ${formatCurrency(selectedPlan.max_amount)}`)
      return
    }
    if (numAmount > primaryBalance) {
      toast.error("Insufficient balance")
      return
    }

    setInvesting(true)

    const endDate = new Date(Date.now() + selectedPlan.duration_days * 86400000).toISOString()

    const { error } = await supabase.from("investments").insert({
      user_id: userId,
      plan_id: selectedPlan.id,
      amount: numAmount,
      expected_return: expectedReturn,
      status: "active",
      end_date: endDate,
    })

    if (error) { toast.error("Investment failed"); setInvesting(false); return }

    // Deduct balance
    await supabase.from("accounts")
      .update({ available_balance: primaryBalance - numAmount })
      .eq("user_id", userId)
      .eq("is_primary", true)

    // Create transaction
    await supabase.from("transactions").insert({
      user_id: userId,
      type: "investment",
      status: "completed",
      amount: numAmount,
      description: `Investment: ${selectedPlan.name}`,
    })

    await supabase.from("notifications").insert({
      user_id: userId,
      title: "Investment Started 📈",
      message: `Your ${formatCurrency(numAmount)} investment in "${selectedPlan.name}" is now active. Expected return: ${formatCurrency(expectedReturn + numAmount)}.`,
      type: "transaction",
    })

    toast.success("Investment placed!")
    setSuccess(true)
    setInvesting(false)
  }

  const totalInvested = investments.filter((i) => i.status === "active").reduce((s, i) => s + i.amount, 0)
  const totalExpected = investments.filter((i) => i.status === "active").reduce((s, i) => s + (i.expected_return || 0), 0)

  return (
    <div className="max-w-5xl space-y-6">

      {/* Summary row */}
      {investments.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Invested", value: formatCurrency(totalInvested), icon: TrendingUp, color: "text-brand-blue", bg: "bg-brand-blue/10" },
            { label: "Expected Returns", value: formatCurrency(totalExpected), icon: BarChart3, color: "text-brand-emerald", bg: "bg-brand-emerald/10" },
            { label: "Active Plans", value: investments.filter((i) => i.status === "active").length.toString(), icon: Lock, color: "text-purple-400", bg: "bg-purple-400/10" },
          ].map(({ label, value, icon: Icon, color, bg }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-navy-card border border-navy-border rounded-2xl p-5"
            >
              <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="text-white/50 text-xs mb-1">{label}</p>
              <p className="font-display font-bold text-white text-xl">{value}</p>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-6">

        {/* Investment plans */}
        <div className="space-y-3">
          <h3 className="font-display font-semibold text-white">Available Plans</h3>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-brand-blue animate-spin" />
            </div>
          ) : (
            plans.map((plan, i) => {
              const riskCfg = RISK_CONFIG[plan.risk_level as keyof typeof RISK_CONFIG] || RISK_CONFIG.medium
              const isSelected = selectedPlan?.id === plan.id

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  onClick={() => { setSelectedPlan(plan); setAmount(plan.min_amount.toString()); setSuccess(false) }}
                  className={cn(
                    "p-5 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01]",
                    isSelected
                      ? "border-brand-blue bg-brand-blue/5 shadow-lg shadow-brand-blue/10"
                      : "border-navy-border bg-navy-card hover:border-white/10"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-display font-semibold text-white">{plan.name}</h4>
                      <p className="text-white/40 text-xs mt-0.5">{plan.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="font-display font-bold text-brand-emerald text-2xl">
                        {(plan.return_rate * 100).toFixed(1)}%
                      </p>
                      <p className="text-white/30 text-xs">per year</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className={cn("text-xs px-2.5 py-1 rounded-full border font-medium", riskCfg.bg, riskCfg.color, riskCfg.border)}>
                      {riskCfg.label}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-white/5 text-white/50">
                      <Clock className="w-3 h-3" />
                      {plan.duration_days} days
                    </span>
                    <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-white/5 text-white/50">
                      Min: {formatCurrency(plan.min_amount)}
                    </span>
                    {plan.max_amount && (
                      <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-white/50">
                        Max: {formatCurrency(plan.max_amount)}
                      </span>
                    )}
                  </div>

                  {isSelected && (
                    <div className="mt-3 flex items-center gap-2 text-brand-blue text-xs font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Selected — fill in amount on the right
                    </div>
                  )}
                </motion.div>
              )
            })
          )}
        </div>

        {/* Investment form */}
        <div className="space-y-4">
          <h3 className="font-display font-semibold text-white">Invest Now</h3>

          {!selectedPlan ? (
            <div className="bg-navy-card border border-navy-border rounded-2xl p-10 text-center">
              <TrendingUp className="w-10 h-10 text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">Select a plan to get started</p>
            </div>
          ) : success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-navy-card border border-brand-emerald/20 rounded-2xl p-8 text-center"
            >
              <div className="w-14 h-14 bg-brand-emerald/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-brand-emerald" />
              </div>
              <h4 className="font-display font-bold text-white text-lg mb-2">Investment Active!</h4>
              <p className="text-white/50 text-sm mb-4">
                {formatCurrency(numAmount)} invested in <span className="text-white">{selectedPlan.name}</span>
              </p>
              <p className="text-brand-emerald font-semibold text-sm">
                Expected return: {formatCurrency(expectedReturn + numAmount)}
              </p>
              <Button
                onClick={() => { setSuccess(false); setAmount(""); setSelectedPlan(null) }}
                className="mt-5 w-full h-10 bg-brand-blue hover:bg-blue-600 text-white rounded-xl text-sm"
              >
                Invest in Another Plan
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-navy-card border border-navy-border rounded-2xl p-5 space-y-5"
            >
              {/* Selected plan summary */}
              <div className={cn("p-4 rounded-xl border", RISK_CONFIG[selectedPlan.risk_level as keyof typeof RISK_CONFIG]?.border || "border-navy-border")}>
                <div className="flex items-center justify-between">
                  <p className="text-white font-semibold">{selectedPlan.name}</p>
                  <p className="font-display font-bold text-brand-emerald text-lg">
                    {(selectedPlan.return_rate * 100).toFixed(1)}% p.a.
                  </p>
                </div>
                <p className="text-white/40 text-xs mt-1">
                  {selectedPlan.duration_days}-day lock period · Matures {endDate}
                </p>
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-white/70 text-sm">Investment Amount</Label>
                  <span className="text-white/30 text-xs">
                    Available: {formatCurrency(primaryBalance)}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-semibold">$</span>
                  <Input
                    type="number"
                    min={selectedPlan.min_amount}
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e: any) => setAmount(e.target.value)}
                    className="pl-8 h-14 bg-navy/60 border-navy-border text-white text-xl font-display font-bold placeholder:text-white/20 rounded-xl focus:border-brand-blue"
                  />
                </div>
                {/* Quick amount buttons */}
                <div className="flex gap-2 flex-wrap">
                  {[selectedPlan.min_amount, selectedPlan.min_amount * 2, selectedPlan.min_amount * 5].map((a) => (
                    <button key={a} type="button" onClick={() => setAmount(a.toString())}
                      className={cn(
                        "px-3 py-1 rounded-lg border text-xs font-medium transition-all",
                        amount === a.toString()
                          ? "border-brand-blue bg-brand-blue/10 text-white"
                          : "border-navy-border text-white/40 hover:text-white hover:border-white/20"
                      )}>
                      {formatCurrency(a)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Return projection */}
              {numAmount >= selectedPlan.min_amount && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2 p-4 bg-brand-emerald/5 border border-brand-emerald/20 rounded-xl"
                >
                  <p className="text-brand-emerald text-xs font-semibold mb-2">Projected Returns</p>
                  {[
                    { label: "Principal", value: formatCurrency(numAmount) },
                    { label: `Return (${(selectedPlan.return_rate * 100).toFixed(1)}% × ${selectedPlan.duration_days}d)`, value: formatCurrency(expectedReturn) },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-white/50">{label}</span>
                      <span className="text-white">{value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-semibold pt-2 border-t border-brand-emerald/20">
                    <span className="text-white">Total at maturity</span>
                    <span className="text-brand-emerald font-display text-base">{formatCurrency(numAmount + expectedReturn)}</span>
                  </div>
                </motion.div>
              )}

              <Button
                onClick={handleInvest}
                disabled={investing || numAmount < selectedPlan.min_amount || numAmount > primaryBalance}
                className="w-full h-12 bg-gradient-to-r from-brand-blue to-brand-emerald text-white font-semibold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {investing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>Confirm Investment <ArrowRight className="ml-2 w-4 h-4" /></>
                )}
              </Button>
            </motion.div>
          )}

          {/* Features */}
          <div className="space-y-2">
            {[
              { icon: Shield, text: "Capital protected by NexVault guarantee" },
              { icon: Zap, text: "Returns credited automatically at maturity" },
              { icon: Lock, text: "Funds locked for the plan duration" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5 text-white/40 text-xs">
                <Icon className="w-3.5 h-3.5 text-brand-emerald flex-shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active investments */}
      {investments.length > 0 && (
        <div className="bg-navy-card border border-navy-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-navy-border">
            <h3 className="font-display font-semibold text-white">Your Investments</h3>
          </div>
          <div className="divide-y divide-navy-border/50">
            {investments.map((inv, i) => {
              const daysLeft = inv.end_date
                ? Math.max(0, Math.ceil((new Date(inv.end_date).getTime() - Date.now()) / 86400000))
                : 0
              const progress = inv.investment_plans
                ? Math.round(((inv.investment_plans.duration_days - daysLeft) / inv.investment_plans.duration_days) * 100)
                : 0

              return (
                <motion.div
                  key={inv.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  className="px-5 py-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-white font-medium text-sm">{inv.investment_plans?.name || "Investment Plan"}</p>
                      <p className="text-white/40 text-xs mt-0.5">
                        {daysLeft} days remaining · {(inv.investment_plans?.return_rate * 100).toFixed(1)}% p.a.
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-bold text-white">{formatCurrency(inv.amount)}</p>
                      <p className="text-brand-emerald text-xs">+{formatCurrency(inv.expected_return || 0)} expected</p>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 bg-navy-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-brand-blue to-brand-emerald rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-white/20 text-xs">{progress}% complete</span>
                    <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full capitalize",
                      inv.status === "active" ? "bg-brand-emerald/10 text-brand-emerald" :
                        inv.status === "completed" ? "bg-white/5 text-white/40" : "bg-red-500/10 text-red-400"
                    )}>{inv.status}</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}