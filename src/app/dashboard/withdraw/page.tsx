"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Building2, ArrowRight, Loader2,
  CheckCircle2, Info, AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency, cn } from "@/lib/utils"
import type { Account } from "@/types/database"

const QUICK_AMOUNTS = [100, 250, 500, 1000, 2500]
const FEE_PERCENT = 0.015

export default function WithdrawPage() {
  const supabase = createClient()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState("")
  const [amount, setAmount] = useState("")
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [accountName, setAccountName] = useState("")
  const [routingNumber, setRoutingNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [reference, setReference] = useState("")
  const [kycVerified, setKycVerified] = useState(true)

  const numAmount = parseFloat(amount) || 0
  const feeAmount = numAmount * FEE_PERCENT
  const netAmount = numAmount - feeAmount
  const selectedAcc = accounts.find((a) => a.id === selectedAccount)
  const insufficientFunds = numAmount > (selectedAcc?.available_balance || 0)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: accs }, { data: profile }] = await Promise.all([
        supabase.from("accounts").select("*").eq("user_id", user.id),
        supabase.from("profiles").select("kyc_status").eq("id", user.id).single(),
      ])

      if (accs) {
        setAccounts(accs)
        const primary = accs.find((a) => a.is_primary)
        if (primary) setSelectedAccount(primary.id)
      }

      setKycVerified(profile?.kyc_status === "verified")
    }
    load()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!kycVerified) { toast.error("Complete KYC verification first"); return }
    if (numAmount < 20) { toast.error("Minimum withdrawal is $20"); return }
    if (insufficientFunds) { toast.error("Insufficient funds"); return }
    if (!bankName || !accountNumber || !accountName) { toast.error("All bank details are required"); return }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data, error } = await supabase
      .from("withdrawals")
      .insert({
        user_id: user.id,
        account_id: selectedAccount || null,
        amount: numAmount,
        fee: feeAmount,
        method: "bank_transfer",
        bank_name: bankName,
        bank_account_number: accountNumber,
        bank_account_name: accountName,
        bank_routing_number: routingNumber || null,
        status: "pending",
      })
      .select()
      .single()

    if (error) {
      toast.error("Failed to submit withdrawal request")
      setLoading(false)
      return
    }

    await supabase.from("notifications").insert({
      user_id: user.id,
      title: "Withdrawal Request Submitted",
      message: `Your withdrawal of ${formatCurrency(netAmount)} to ${bankName} is pending approval.`,
      type: "transaction",
    })

    setReference(data.reference)
    setSuccess(true)
    setLoading(false)
    toast.success("Withdrawal request submitted!")
  }

  if (!kycVerified) {
    return (
      <div className="max-w-md">
        <div className="flex items-start gap-4 p-6 bg-brand-gold/5 border border-brand-gold/20 rounded-2xl">
          <AlertTriangle className="w-5 h-5 text-brand-gold mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-display font-semibold text-white mb-2">KYC Required</h3>
            <p className="text-white/60 text-sm mb-4">
              You must complete identity verification (KYC) before you can make withdrawals. This usually takes under 24 hours.
            </p>
            <Button
              onClick={() => window.location.href = "/dashboard/kyc"}
              className="bg-brand-gold hover:bg-yellow-500 text-navy font-semibold h-10 px-5 rounded-xl"
            >
              Verify Identity Now
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-navy-card border border-navy-border rounded-2xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-brand-emerald/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-brand-emerald" />
          </div>
          <h2 className="font-display text-2xl font-bold text-white mb-2">Withdrawal Submitted</h2>
          <p className="text-white/50 text-sm mb-6">
            Your withdrawal of <span className="text-white font-semibold">{formatCurrency(netAmount)}</span> to{" "}
            <span className="text-white font-semibold">{bankName}</span> is under review.
          </p>
          <div className="bg-navy/60 rounded-xl p-4 mb-6 text-left space-y-2">
            {[
              { label: "Reference", value: reference },
              { label: "Net amount", value: formatCurrency(netAmount) },
              { label: "Bank", value: bankName },
              { label: "Processing", value: "1–2 business days" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-white/40">{label}</span>
                <span className="text-white">{value}</span>
              </div>
            ))}
          </div>
          <Button
            onClick={() => { setSuccess(false); setAmount("") }}
            className="w-full h-11 bg-brand-blue hover:bg-blue-600 text-white rounded-xl"
          >
            New Withdrawal
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-xl space-y-5">

      <div className="flex items-start gap-3 p-4 bg-brand-blue/5 border border-brand-blue/20 rounded-xl">
        <Info className="w-4 h-4 text-brand-blue mt-0.5 flex-shrink-0" />
        <p className="text-white/60 text-sm">
          A fee of <span className="text-white">1.5%</span> applies on all withdrawals.
          Minimum withdrawal: <span className="text-white">$20</span>. Processing: 1–2 business days.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Source account */}
        <div className="bg-navy-card border border-navy-border rounded-2xl p-5 space-y-3">
          <h3 className="font-display font-semibold text-white text-sm">Source Account</h3>
          {accounts.map((acc) => (
            <button
              key={acc.id}
              type="button"
              onClick={() => setSelectedAccount(acc.id)}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all",
                selectedAccount === acc.id
                  ? "border-brand-blue bg-brand-blue/10"
                  : "border-navy-border hover:border-white/20"
              )}
            >
              <div>
                <p className={cn("font-medium text-sm", selectedAccount === acc.id ? "text-white" : "text-white/70")}>
                  {acc.account_name}
                </p>
                <p className="text-white/30 text-xs capitalize">{acc.account_type} • •••{acc.account_number.slice(-4)}</p>
              </div>
              <span className="font-display font-bold text-white">{formatCurrency(acc.available_balance)}</span>
            </button>
          ))}
        </div>

        {/* Amount */}
        <div className="bg-navy-card border border-navy-border rounded-2xl p-5 space-y-4">
          <h3 className="font-display font-semibold text-white text-sm">Withdrawal Amount</h3>

          <div className="flex flex-wrap gap-2">
            {QUICK_AMOUNTS.map((a) => (
              <button key={a} type="button" onClick={() => setAmount(a.toString())}
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

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-semibold">$</span>
            <Input
              type="number"
              min="20"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e: any) => setAmount(e.target.value)}
              className={cn(
                "pl-8 h-14 bg-navy/60 border-navy-border text-white text-xl font-display font-bold placeholder:text-white/20 rounded-xl focus:border-brand-blue focus:ring-1 focus:ring-brand-blue/30",
                insufficientFunds && "border-red-500 focus:border-red-500"
              )}
            />
          </div>

          {insufficientFunds && (
            <p className="text-red-400 text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Insufficient available balance ({formatCurrency(selectedAcc?.available_balance || 0)} available)
            </p>
          )}

          {numAmount > 0 && !insufficientFunds && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-2 pt-2 border-t border-navy-border"
            >
              {[
                { label: "Withdrawal amount", value: formatCurrency(numAmount) },
                { label: "Processing fee (1.5%)", value: formatCurrency(feeAmount) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-white/40">{label}</span>
                  <span className="text-white">{value}</span>
                </div>
              ))}
              <div className="flex justify-between text-sm font-semibold pt-2 border-t border-navy-border">
                <span className="text-white">You receive</span>
                <span className="text-brand-emerald">{formatCurrency(netAmount)}</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Bank details */}
        <div className="bg-navy-card border border-navy-border rounded-2xl p-5 space-y-4">
          <h3 className="font-display font-semibold text-white text-sm flex items-center gap-2">
            <Building2 className="w-4 h-4 text-brand-blue" />
            Bank Details
          </h3>

          {[
            { label: "Bank Name", value: bankName, setter: setBankName, placeholder: "e.g. Chase Bank" },
            { label: "Account Holder Name", value: accountName, setter: setAccountName, placeholder: "Full name on account" },
            { label: "Account Number", value: accountNumber, setter: setAccountNumber, placeholder: "•••••••••" },
            { label: "Routing Number (optional)", value: routingNumber, setter: setRoutingNumber, placeholder: "9-digit routing number" },
          ].map(({ label, value, setter, placeholder }) => (
            <div key={label} className="space-y-1.5">
              <Label className="text-white/70 text-sm">{label}</Label>
              <Input
                placeholder={placeholder}
                value={value}
                onChange={(e: any) => setter(e.target.value)}
                className="h-11 bg-navy/60 border-navy-border text-white placeholder:text-white/20 rounded-xl focus:border-brand-blue"
              />
            </div>
          ))}
        </div>

        <Button
          type="submit"
          disabled={loading || insufficientFunds || numAmount < 20}
          className="w-full h-12 bg-brand-blue hover:bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>Submit Withdrawal Request <ArrowRight className="ml-2 w-4 h-4" /></>
          )}
        </Button>
      </form>
    </div>
  )
}