"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Building2, CreditCard, Bitcoin,
  ArrowRight, Loader2, CheckCircle2, Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency, cn } from "@/lib/utils"

const METHODS = [
  { id: "bank_transfer", label: "Bank Transfer", icon: Building2, desc: "1-3 business days", fee: "Free" },
  { id: "card", label: "Debit / Credit Card", icon: CreditCard, desc: "Instant", fee: "1.5%" },
  { id: "crypto", label: "Cryptocurrency", icon: Bitcoin, desc: "15-60 minutes", fee: "0.5%" },
]

const QUICK_AMOUNTS = [100, 500, 1000, 5000, 10000]

export default function DepositPage() {
  const supabase = createClient()
  const [method, setMethod] = useState("bank_transfer")
  const [amount, setAmount] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [reference, setReference] = useState("")

  const selectedMethod = METHODS.find((m) => m.id === method)!
  const numAmount = parseFloat(amount) || 0
  const feePercent = method === "card" ? 0.015 : method === "crypto" ? 0.005 : 0
  const feeAmount = numAmount * feePercent
  const totalAmount = numAmount + feeAmount

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || numAmount < 10) { toast.error("Minimum deposit is $10"); return }
    if (numAmount > 100000) { toast.error("Maximum deposit is $100,000"); return }

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { toast.error("Not authenticated"); setLoading(false); return }

    const { data: accounts } = await supabase
      .from("accounts")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_primary", true)
      .single()

    const { data, error } = await supabase
      .from("deposits")
      .insert({
        user_id: user.id,
        account_id: accounts?.id,
        amount: numAmount,
        method,
        notes: notes || null,
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      toast.error("Failed to submit deposit request")
      setLoading(false)
      return
    }

    // Create notification
    await supabase.from("notifications").insert({
      user_id: user.id,
      title: "Deposit Request Submitted",
      message: `Your deposit of ${formatCurrency(numAmount)} via ${selectedMethod.label} is being processed.`,
      type: "transaction",
    })

    setReference(data.reference)
    setSuccess(true)
    setLoading(false)
    toast.success("Deposit request submitted!")
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-navy-card border border-navy-border rounded-2xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-brand-emerald/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-brand-emerald" />
          </div>
          <h2 className="font-display text-2xl font-bold text-white mb-2">Deposit Requested</h2>
          <p className="text-white/50 text-sm mb-6">
            Your deposit of <span className="text-white font-semibold">{formatCurrency(numAmount)}</span> via{" "}
            <span className="text-white font-semibold">{selectedMethod.label}</span> has been submitted and is pending review.
          </p>
          <div className="bg-navy/60 rounded-xl p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Reference</span>
              <span className="text-white font-mono">{reference}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Amount</span>
              <span className="text-white">{formatCurrency(numAmount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Processing time</span>
              <span className="text-white">{selectedMethod.desc}</span>
            </div>
          </div>
          <Button
            onClick={() => { setSuccess(false); setAmount(""); setNotes("") }}
            className="w-full h-11 bg-brand-blue hover:bg-blue-600 text-white rounded-xl"
          >
            Make Another Deposit
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-xl space-y-5">

      {/* Info banner */}
      <div className="flex items-start gap-3 p-4 bg-brand-blue/5 border border-brand-blue/20 rounded-xl">
        <Info className="w-4 h-4 text-brand-blue mt-0.5 flex-shrink-0" />
        <p className="text-white/60 text-sm">
          Deposits are reviewed by our team and credited to your account within the processing time shown below.
          Minimum deposit: <span className="text-white">$10</span>
        </p>
      </div>

      {/* Payment method */}
      <div className="bg-navy-card border border-navy-border rounded-2xl p-5 space-y-3">
        <h3 className="font-display font-semibold text-white text-sm mb-4">Payment Method</h3>
        {METHODS.map(({ id, label, icon: Icon, desc, fee }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMethod(id)}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all",
              method === id
                ? "border-brand-blue bg-brand-blue/10"
                : "border-navy-border hover:border-white/20"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
              method === id ? "bg-brand-blue/20" : "bg-navy/60"
            )}>
              <Icon className={cn("w-5 h-5", method === id ? "text-brand-blue" : "text-white/40")} />
            </div>
            <div className="flex-1">
              <p className={cn("font-medium text-sm", method === id ? "text-white" : "text-white/70")}>{label}</p>
              <p className="text-white/30 text-xs">{desc}</p>
            </div>
            <div className="text-right">
              <span className={cn(
                "text-xs font-medium px-2 py-1 rounded-lg",
                fee === "Free" ? "bg-brand-emerald/10 text-brand-emerald" : "bg-navy/60 text-white/40"
              )}>
                {fee}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Amount form */}
      <form onSubmit={handleSubmit} className="bg-navy-card border border-navy-border rounded-2xl p-5 space-y-5">
        <h3 className="font-display font-semibold text-white text-sm">Deposit Amount</h3>

        {/* Quick amounts */}
        <div className="flex flex-wrap gap-2">
          {QUICK_AMOUNTS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAmount(a.toString())}
              className={cn(
                "px-3 py-1.5 rounded-lg border text-sm font-medium transition-all",
                amount === a.toString()
                  ? "border-brand-blue bg-brand-blue/10 text-white"
                  : "border-navy-border text-white/50 hover:border-white/20 hover:text-white"
              )}
            >
              {formatCurrency(a)}
            </button>
          ))}
        </div>

        {/* Amount input */}
        <div className="space-y-1.5">
          <Label className="text-white/70 text-sm">Amount (USD)</Label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-semibold">$</span>
            <Input
              type="number"
              min="10"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e: any) => setAmount(e.target.value)}
              className="pl-8 h-14 bg-navy/60 border-navy-border text-white text-xl font-display font-bold placeholder:text-white/20 rounded-xl focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <Label className="text-white/70 text-sm">Notes (optional)</Label>
          <Input
            placeholder="e.g. Monthly savings deposit"
            value={notes}
            onChange={(e: any) => setNotes(e.target.value)}
            className="h-11 bg-navy/60 border-navy-border text-white placeholder:text-white/20 rounded-xl focus:border-brand-blue"
          />
        </div>

        {/* Fee breakdown */}
        {numAmount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-2 pt-2 border-t border-navy-border"
          >
            {[
              { label: "Deposit amount", value: formatCurrency(numAmount) },
              { label: `Processing fee (${selectedMethod.fee})`, value: feeAmount > 0 ? formatCurrency(feeAmount) : "Free" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-white/40">{label}</span>
                <span className="text-white">{value}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-semibold pt-2 border-t border-navy-border">
              <span className="text-white">You pay</span>
              <span className="text-white">{formatCurrency(totalAmount)}</span>
            </div>
          </motion.div>
        )}

        <Button
          type="submit"
          disabled={loading || numAmount < 10}
          className="w-full h-12 bg-brand-blue hover:bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>Submit Deposit Request <ArrowRight className="ml-2 w-4 h-4" /></>
          )}
        </Button>
      </form>
    </div>
  )
}