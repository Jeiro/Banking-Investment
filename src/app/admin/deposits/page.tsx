"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import {
  CheckCircle2, XCircle, Loader2,
  ChevronDown, ArrowDownCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency, formatDate, cn } from "@/lib/utils"
import { toast } from "sonner"

interface DepositEntry {
  id: string
  user_id: string
  amount: number
  currency: string
  method: string
  status: string
  reference: string
  notes: string | null
  created_at: string
  profiles: { first_name: string; last_name: string; email: string } | null
  accounts: { account_name: string; account_number: string } | null
}

export default function AdminDepositsPage() {
  const supabase = createClient()
  const [deposits, setDeposits] = useState<DepositEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("pending")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({})

  const load = useCallback(async () => {
    setLoading(true)
    let q = supabase.from("deposits")
      .select("*, profiles(first_name,last_name,email), accounts(account_name,account_number)")
      .order("created_at", { ascending: false })
    if (filter !== "all") q = q.eq("status", filter)
    const { data } = await q
    if (data) setDeposits(data as DepositEntry[])
    setLoading(false)
  }, [filter])

  useEffect(() => { load() }, [load])

  async function handleAction(dep: DepositEntry, action: "completed" | "failed") {
    setActionLoading(dep.id)
    const { data: { user: admin } } = await supabase.auth.getUser()

    await supabase.from("deposits").update({
      status: action,
      reviewed_by: admin?.id,
      reviewed_at: new Date().toISOString(),
      admin_notes: adminNotes[dep.id] || null,
    }).eq("id", dep.id)

    if (action === "completed") {
      // Credit the account
      const { data: acc } = await supabase.from("accounts")
        .select("balance,available_balance")
        .eq("id", dep.accounts as any)
        .single()

      if (acc) {
        await supabase.from("accounts").update({
          balance: acc.balance + dep.amount,
          available_balance: acc.available_balance + dep.amount,
        }).eq("user_id", dep.user_id).eq("is_primary", true)
      }

      // Notification
      await supabase.from("notifications").insert({
        user_id: dep.user_id,
        title: "Deposit Approved ✅",
        message: `Your deposit of ${formatCurrency(dep.amount)} via ${dep.method.replace("_", " ")} has been approved and credited to your account.`,
        type: "transaction",
      })

      await supabase.from("audit_logs").insert({
        actor_id: admin?.id,
        action: "DEPOSIT_APPROVED",
        entity_type: "deposits",
        entity_id: dep.id,
        new_value: { amount: dep.amount, user_id: dep.user_id },
      })
    } else {
      await supabase.from("notifications").insert({
        user_id: dep.user_id,
        title: "Deposit Rejected",
        message: `Your deposit of ${formatCurrency(dep.amount)} was rejected. ${adminNotes[dep.id] ? `Reason: ${adminNotes[dep.id]}` : "Please contact support."}`,
        type: "transaction",
      })
    }

    toast.success(`Deposit ${action}`)
    setActionLoading(null)
    load()
  }

  const methodLabel = (m: string) => m.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Filter tabs */}
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
      ) : deposits.length === 0 ? (
        <div className="py-20 text-center">
          <ArrowDownCircle className="w-10 h-10 text-white/10 mx-auto mb-3" />
          <p className="text-white/30">No {filter !== "all" ? filter : ""} deposits</p>
        </div>
      ) : (
        <div className="bg-navy-card border border-navy-border rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="hidden lg:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_160px] gap-4 px-5 py-3 border-b border-navy-border bg-navy/40">
            {["User", "Amount", "Method", "Reference", "Date", "Actions"].map((h) => (
              <span key={h} className="text-white/30 text-xs font-semibold uppercase tracking-wide">{h}</span>
            ))}
          </div>

          <div className="divide-y divide-navy-border/50">
            {deposits.map((dep, i) => (
              <motion.div
                key={dep.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className="px-5 py-4 hover:bg-white/2 transition-colors"
              >
                <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr_160px] gap-4 items-center">
                  {/* User */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-blue/20 flex items-center justify-center text-brand-blue text-xs font-bold">
                      {dep.profiles?.first_name?.[0]}{dep.profiles?.last_name?.[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{dep.profiles?.first_name} {dep.profiles?.last_name}</p>
                      <p className="text-white/30 text-xs truncate">{dep.profiles?.email}</p>
                    </div>
                  </div>

                  {/* Amount */}
                  <p className="font-display font-bold text-brand-emerald">{formatCurrency(dep.amount)}</p>

                  {/* Method */}
                  <span className="text-white/60 text-sm">{methodLabel(dep.method)}</span>

                  {/* Reference */}
                  <span className="text-white/30 text-xs font-mono">{dep.reference}</span>

                  {/* Date */}
                  <span className="text-white/30 text-xs">{formatDate(dep.created_at)}</span>

                  {/* Actions */}
                  <div>
                    {dep.status === "pending" ? (
                      <div className="space-y-2">
                        <input
                          placeholder="Admin note (optional)"
                          value={adminNotes[dep.id] || ""}
                          onChange={(e: any) => setAdminNotes((p) => ({ ...p, [dep.id]: e.target.value }))}
                          className="w-full px-2 py-1 bg-navy/60 border border-navy-border rounded-lg text-white text-xs placeholder:text-white/20 focus:border-brand-blue outline-none"
                        />
                        <div className="flex gap-1.5">
                          <Button
                            onClick={() => handleAction(dep, "completed")}
                            disabled={actionLoading === dep.id}
                            className="flex-1 h-8 bg-brand-emerald hover:bg-emerald-600 text-white text-xs rounded-lg px-2"
                          >
                            {actionLoading === dep.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <><CheckCircle2 className="w-3 h-3 mr-1" />Approve</>}
                          </Button>
                          <Button
                            onClick={() => handleAction(dep, "failed")}
                            disabled={actionLoading === dep.id}
                            variant="outline"
                            className="flex-1 h-8 border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs rounded-lg px-2"
                          >
                            <XCircle className="w-3 h-3 mr-1" />Reject
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full capitalize",
                        dep.status === "completed" ? "bg-brand-emerald/10 text-brand-emerald" : "bg-red-500/10 text-red-400"
                      )}>{dep.status}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}