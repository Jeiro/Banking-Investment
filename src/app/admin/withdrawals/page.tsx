"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, XCircle, Loader2, ArrowUpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency, formatDate, cn } from "@/lib/utils"
import { toast } from "sonner"

interface WithdrawalEntry {
  id: string
  user_id: string
  amount: number
  fee: number
  net_amount: number
  method: string
  status: string
  reference: string
  bank_name: string | null
  bank_account_number: string | null
  bank_account_name: string | null
  created_at: string
  profiles: { first_name: string; last_name: string; email: string } | null
}

export default function AdminWithdrawalsPage() {
  const supabase = createClient()
  const [withdrawals, setWithdrawals] = useState<WithdrawalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("pending")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    setLoading(true)
    let q = supabase.from("withdrawals")
      .select("*, profiles(first_name,last_name,email)")
      .order("created_at", { ascending: false })
    if (filter !== "all") q = q.eq("status", filter)
    const { data } = await q
    if (data) setWithdrawals(data as WithdrawalEntry[])
    setLoading(false)
  }, [filter])

  useEffect(() => { load() }, [load])

  async function handleAction(w: WithdrawalEntry, action: "completed" | "failed") {
    setActionLoading(w.id)
    const { data: { user: admin } } = await supabase.auth.getUser()

    await supabase.from("withdrawals").update({
      status: action,
      reviewed_by: admin?.id,
      reviewed_at: new Date().toISOString(),
      admin_notes: adminNotes[w.id] || null,
    }).eq("id", w.id)

    if (action === "completed") {
      // Deduct from primary account
      const { data: accs } = await supabase.from("accounts")
        .select("id,balance,available_balance")
        .eq("user_id", w.user_id)
        .eq("is_primary", true)
        .single()

      if (accs) {
        await supabase.from("accounts").update({
          balance: Math.max(0, accs.balance - w.amount),
          available_balance: Math.max(0, accs.available_balance - w.amount),
        }).eq("id", accs.id)
      }

      await supabase.from("notifications").insert({
        user_id: w.user_id,
        title: "Withdrawal Approved ✅",
        message: `Your withdrawal of ${formatCurrency(w.net_amount)} to ${w.bank_name} has been approved and is being processed.`,
        type: "transaction",
      })

      await supabase.from("audit_logs").insert({
        actor_id: admin?.id,
        action: "WITHDRAWAL_APPROVED",
        entity_type: "withdrawals",
        entity_id: w.id,
        new_value: { amount: w.amount, user_id: w.user_id },
      })
    } else {
      await supabase.from("notifications").insert({
        user_id: w.user_id,
        title: "Withdrawal Rejected",
        message: `Your withdrawal of ${formatCurrency(w.amount)} was rejected. ${adminNotes[w.id] ? `Reason: ${adminNotes[w.id]}` : "Contact support for help."}`,
        type: "transaction",
      })
    }

    toast.success(`Withdrawal ${action}`)
    setActionLoading(null)
    load()
  }

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex gap-2 flex-wrap">
        {["pending", "completed", "failed", "all"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all border",
              filter === f ? "bg-brand-blue border-brand-blue text-white" : "border-navy-border text-white/50 hover:text-white"
            )}>
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-brand-blue animate-spin" />
        </div>
      ) : withdrawals.length === 0 ? (
        <div className="py-20 text-center">
          <ArrowUpCircle className="w-10 h-10 text-white/10 mx-auto mb-3" />
          <p className="text-white/30">No {filter !== "all" ? filter : ""} withdrawals</p>
        </div>
      ) : (
        <div className="space-y-3">
          {withdrawals.map((w, i) => (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
              className="bg-navy-card border border-navy-border rounded-2xl p-5 hover:border-white/10 transition-colors"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                {/* User + bank info */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 text-sm font-bold flex-shrink-0">
                    {w.profiles?.first_name?.[0]}{w.profiles?.last_name?.[0]}
                  </div>
                  <div>
                    <p className="text-white font-medium">{w.profiles?.first_name} {w.profiles?.last_name}</p>
                    <p className="text-white/40 text-xs">{w.profiles?.email}</p>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-white/50">
                      <span>Bank: <span className="text-white">{w.bank_name || "—"}</span></span>
                      <span>A/C: <span className="text-white">{w.bank_account_name || "—"}</span></span>
                      <span>Ref: <span className="text-white font-mono">{w.reference}</span></span>
                    </div>
                  </div>
                </div>

                {/* Amount + status */}
                <div className="text-right">
                  <p className="font-display font-bold text-orange-400 text-xl">{formatCurrency(w.amount)}</p>
                  <p className="text-white/30 text-xs">Net: {formatCurrency(w.net_amount)} after fee</p>
                  <p className="text-white/20 text-xs mt-1">{formatDate(w.created_at)}</p>
                </div>
              </div>

              {/* Actions for pending */}
              {w.status === "pending" && (
                <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-navy-border">
                  <input
                    placeholder="Admin note (optional)"
                    value={adminNotes[w.id] || ""}
                    onChange={(e: any) => setAdminNotes((p) => ({ ...p, [w.id]: e.target.value }))}
                    className="flex-1 min-w-40 px-3 py-2 bg-navy/60 border border-navy-border rounded-xl text-white text-sm placeholder:text-white/20 focus:border-brand-blue outline-none"
                  />
                  <Button onClick={() => handleAction(w, "completed")} disabled={actionLoading === w.id}
                    className="h-9 bg-brand-emerald hover:bg-emerald-600 text-white text-sm rounded-xl px-4">
                    {actionLoading === w.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />Approve</>}
                  </Button>
                  <Button onClick={() => handleAction(w, "failed")} disabled={actionLoading === w.id}
                    variant="outline" className="h-9 border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm rounded-xl px-4">
                    <XCircle className="w-3.5 h-3.5 mr-1.5" />Reject
                  </Button>
                </div>
              )}

              {w.status !== "pending" && (
                <div className="flex items-center gap-2 mt-3">
                  <span className={cn("text-xs font-medium px-3 py-1 rounded-full capitalize",
                    w.status === "completed" ? "bg-brand-emerald/10 text-brand-emerald" : "bg-red-500/10 text-red-400"
                  )}>{w.status}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}