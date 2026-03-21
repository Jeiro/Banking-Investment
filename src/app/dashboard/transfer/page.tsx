"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Send, ArrowRight, Loader2, CheckCircle2,
  Search, User, AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency, cn } from "@/lib/utils"
import type { Account, Beneficiary } from "@/types/database"

const QUICK_AMOUNTS = [50, 100, 250, 500, 1000]

export default function TransferPage() {
  const supabase = createClient()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [fromAccount, setFromAccount] = useState("")
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null)
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [beneficiarySearch, setBeneficiarySearch] = useState("")

  const numAmount = parseFloat(amount) || 0
  const sourceAccount = accounts.find((a) => a.id === fromAccount)
  const insufficient = numAmount > (sourceAccount?.available_balance || 0)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [{ data: accs }, { data: bens }] = await Promise.all([
        supabase.from("accounts").select("*").eq("user_id", user.id),
        supabase.from("beneficiaries").select("*").eq("user_id", user.id),
      ])
      if (accs) {
        setAccounts(accs)
        const primary = accs.find((a) => a.is_primary)
        if (primary) setFromAccount(primary.id)
      }
      if (bens) setBeneficiaries(bens)
    }
    load()
  }, [])

  const filteredBeneficiaries = beneficiaries.filter((b) =>
    !beneficiarySearch ||
    b.nickname.toLowerCase().includes(beneficiarySearch.toLowerCase()) ||
    b.full_name.toLowerCase().includes(beneficiarySearch.toLowerCase())
  )

  async function handleTransfer(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedBeneficiary) { toast.error("Select a beneficiary"); return }
    if (numAmount < 1) { toast.error("Enter a valid amount"); return }
    if (insufficient) { toast.error("Insufficient funds"); return }

    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { error } = await supabase.from("transactions").insert({
      user_id: user.id,
      account_id: fromAccount,
      type: "transfer_out",
      status: "pending",
      amount: numAmount,
      description: description || `Transfer to ${selectedBeneficiary.nickname}`,
    })

    if (error) { toast.error("Transfer failed"); setLoading(false); return }

    await supabase.from("notifications").insert({
      user_id: user.id,
      title: "Transfer Initiated",
      message: `Transfer of ${formatCurrency(numAmount)} to ${selectedBeneficiary.full_name} is being processed.`,
      type: "transaction",
    })

    setSuccess(true)
    setLoading(false)
    toast.success("Transfer submitted!")
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
          <h2 className="font-display text-2xl font-bold text-white mb-2">Transfer Sent!</h2>
          <p className="text-white/50 text-sm mb-6">
            <span className="text-white font-semibold">{formatCurrency(numAmount)}</span> is on its way to{" "}
            <span className="text-white font-semibold">{selectedBeneficiary?.full_name}</span>.
          </p>
          <Button
            onClick={() => { setSuccess(false); setAmount(""); setSelectedBeneficiary(null) }}
            className="w-full h-11 bg-brand-blue hover:bg-blue-600 text-white rounded-xl"
          >
            New Transfer
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-xl space-y-5">
      <form onSubmit={handleTransfer} className="space-y-5">

        {/* From account */}
        <div className="bg-navy-card border border-navy-border rounded-2xl p-5 space-y-3">
          <h3 className="font-display font-semibold text-white text-sm">From Account</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {accounts.map((acc) => (
              <button
                key={acc.id}
                type="button"
                onClick={() => setFromAccount(acc.id)}
                className={cn(
                  "flex flex-col p-4 rounded-xl border text-left transition-all",
                  fromAccount === acc.id
                    ? "border-brand-blue bg-brand-blue/10"
                    : "border-navy-border hover:border-white/20"
                )}
              >
                <span className="text-white/50 text-xs capitalize">{acc.account_type}</span>
                <span className={cn("font-medium text-sm mt-0.5", fromAccount === acc.id ? "text-white" : "text-white/70")}>
                  {acc.account_name}
                </span>
                <span className="font-display font-bold text-white mt-1">{formatCurrency(acc.available_balance)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Beneficiary selector */}
        <div className="bg-navy-card border border-navy-border rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-white text-sm">Send To</h3>
            <button
              type="button"
              onClick={() => window.location.href = "/dashboard/beneficiaries"}
              className="text-brand-blue text-xs hover:underline"
            >
              + Add Beneficiary
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <input
              type="text"
              placeholder="Search beneficiaries..."
              value={beneficiarySearch}
              onChange={(e: any) => setBeneficiarySearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2.5 bg-navy/60 border border-navy-border rounded-xl text-white text-sm placeholder:text-white/20 focus:border-brand-blue outline-none"
            />
          </div>

          {filteredBeneficiaries.length === 0 ? (
            <div className="py-8 text-center">
              <User className="w-8 h-8 text-white/10 mx-auto mb-2" />
              <p className="text-white/30 text-sm">
                {beneficiaries.length === 0
                  ? "No beneficiaries yet. Add one to start transferring."
                  : "No beneficiaries match your search."}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filteredBeneficiaries.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBeneficiary(b)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                    selectedBeneficiary?.id === b.id
                      ? "border-brand-blue bg-brand-blue/10"
                      : "border-navy-border hover:border-white/20"
                  )}
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-blue to-brand-emerald flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {b.full_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{b.nickname}</p>
                    <p className="text-white/40 text-xs">{b.bank_name} • •••{b.account_number.slice(-4)}</p>
                  </div>
                  {selectedBeneficiary?.id === b.id && (
                    <CheckCircle2 className="w-4 h-4 text-brand-blue flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Amount */}
        <div className="bg-navy-card border border-navy-border rounded-2xl p-5 space-y-4">
          <h3 className="font-display font-semibold text-white text-sm">Amount</h3>

          <div className="flex flex-wrap gap-2">
            {QUICK_AMOUNTS.map((a) => (
              <button key={a} type="button" onClick={() => setAmount(a.toString())}
                className={cn(
                  "px-3 py-1.5 rounded-lg border text-sm font-medium transition-all",
                  amount === a.toString()
                    ? "border-brand-blue bg-brand-blue/10 text-white"
                    : "border-navy-border text-white/50 hover:border-white/20 hover:text-white"
                )}>
                {formatCurrency(a)}
              </button>
            ))}
          </div>

          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-semibold">$</span>
            <Input
              type="number"
              min="1"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e: any) => setAmount(e.target.value)}
              className={cn(
                "pl-8 h-14 bg-navy/60 border-navy-border text-white text-xl font-display font-bold placeholder:text-white/20 rounded-xl focus:border-brand-blue",
                insufficient && "border-red-500"
              )}
            />
          </div>

          {insufficient && (
            <p className="text-red-400 text-xs flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Insufficient funds
            </p>
          )}

          <div className="space-y-1.5">
            <Label className="text-white/70 text-sm">Description (optional)</Label>
            <Input
              placeholder="e.g. Rent payment"
              value={description}
              onChange={(e: any) => setDescription(e.target.value)}
              className="h-11 bg-navy/60 border-navy-border text-white placeholder:text-white/20 rounded-xl focus:border-brand-blue"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading || !selectedBeneficiary || numAmount < 1 || insufficient}
          className="w-full h-12 bg-brand-blue hover:bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Send className="mr-2 w-4 h-4" />
              Send {numAmount > 0 ? formatCurrency(numAmount) : "Transfer"}
            </>
          )}
        </Button>
      </form>
    </div>
  )
}