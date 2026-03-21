"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X, Plus, Minus, Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency, cn } from "@/lib/utils"
import type { Profile, Account } from "@/types/database"

interface Props { user: Profile; onClose: () => void }

export default function BalanceAdjustModal({ user, onClose }: Props) {
    const supabase = createClient()
    const [accounts, setAccounts] = useState<Account[]>([])
    const [selectedAccount, setSelectedAccount] = useState("")
    const [type, setType] = useState<"credit" | "debit">("credit")
    const [amount, setAmount] = useState("")
    const [reason, setReason] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        supabase.from("accounts").select("*").eq("user_id", user.id)
            .then(({ data }) => {
                if (data) {
                    setAccounts(data)
                    const primary = data.find((a) => a.is_primary)
                    if (primary) setSelectedAccount(primary.id)
                }
            })
    }, [user.id])

    const numAmount = parseFloat(amount) || 0
    const selectedAcc = accounts.find((a) => a.id === selectedAccount)

    async function handleAdjust() {
        if (!numAmount || numAmount <= 0) { toast.error("Enter a valid amount"); return }
        if (!reason.trim()) { toast.error("Reason is required"); return }
        if (type === "debit" && numAmount > (selectedAcc?.balance || 0)) {
            toast.error("Debit exceeds account balance"); return
        }

        setLoading(true)
        const { data: { user: admin } } = await supabase.auth.getUser()

        const newBalance = type === "credit"
            ? (selectedAcc?.balance || 0) + numAmount
            : (selectedAcc?.balance || 0) - numAmount

        const { error } = await supabase.from("accounts").update({
            balance: newBalance,
            available_balance: newBalance,
        }).eq("id", selectedAccount)

        if (error) { toast.error("Adjustment failed"); setLoading(false); return }

        // Create transaction record
        await supabase.from("transactions").insert({
            user_id: user.id,
            account_id: selectedAccount,
            type: type === "credit" ? "deposit" : "withdrawal",
            status: "completed",
            amount: numAmount,
            description: `Admin adjustment: ${reason}`,
            processed_by: admin?.id,
            processed_at: new Date().toISOString(),
        })

        // Audit log
        await supabase.from("audit_logs").insert({
            actor_id: admin?.id,
            action: `BALANCE_${type.toUpperCase()}`,
            entity_type: "account",
            entity_id: selectedAccount,
            old_value: { balance: selectedAcc?.balance },
            new_value: { balance: newBalance, reason },
        })

        // Notify user
        await supabase.from("notifications").insert({
            user_id: user.id,
            title: `Account ${type === "credit" ? "Credited" : "Debited"}`,
            message: `Your account has been ${type === "credit" ? "credited" : "debited"} ${formatCurrency(numAmount)}. Reason: ${reason}`,
            type: "transaction",
        })

        toast.success(`Balance ${type === "credit" ? "credited" : "debited"} successfully`)
        setLoading(false)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative bg-navy-card border border-navy-border rounded-2xl w-full max-w-md shadow-2xl shadow-black/60"
            >
                <div className="flex items-center justify-between p-6 border-b border-navy-border">
                    <h2 className="font-display font-bold text-white text-lg">Adjust Balance</h2>
                    <button onClick={onClose} className="text-white/30 hover:text-white"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6 space-y-5">
                    {/* User info */}
                    <div className="flex items-center gap-3 p-3 bg-navy/40 rounded-xl">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-blue to-brand-emerald flex items-center justify-center text-white text-xs font-bold">
                            {user.first_name?.[0]}{user.last_name?.[0]}
                        </div>
                        <div>
                            <p className="text-white text-sm font-medium">{user.first_name} {user.last_name}</p>
                            <p className="text-white/40 text-xs">{user.email}</p>
                        </div>
                    </div>

                    {/* Account selector */}
                    <div className="space-y-1.5">
                        <Label className="text-white/70 text-sm">Account</Label>
                        <select value={selectedAccount} onChange={(e: any) => setSelectedAccount(e.target.value)}
                            className="w-full h-11 bg-navy/60 border border-navy-border rounded-xl px-3 text-white text-sm focus:border-brand-blue outline-none">
                            {accounts.map((a) => (
                                <option key={a.id} value={a.id}>
                                    {a.account_name} — {formatCurrency(a.balance)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Credit / Debit toggle */}
                    <div className="space-y-1.5">
                        <Label className="text-white/70 text-sm">Adjustment Type</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {(["credit", "debit"] as const).map((t) => (
                                <button key={t} type="button" onClick={() => setType(t)}
                                    className={cn(
                                        "flex items-center justify-center gap-2 h-11 rounded-xl border font-medium text-sm capitalize transition-all",
                                        type === t
                                            ? t === "credit" ? "border-brand-emerald bg-brand-emerald/10 text-brand-emerald" : "border-red-500 bg-red-500/10 text-red-400"
                                            : "border-navy-border text-white/50 hover:border-white/20"
                                    )}>
                                    {t === "credit" ? <Plus className="w-4 h-4" /> : <Minus className="w-4 h-4" />}
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Amount */}
                    <div className="space-y-1.5">
                        <Label className="text-white/70 text-sm">Amount (USD)</Label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-semibold">$</span>
                            <Input type="number" min="0.01" step="0.01" placeholder="0.00" value={amount}
                                onChange={(e: any) => setAmount(e.target.value)}
                                className="pl-8 h-12 bg-navy/60 border-navy-border text-white text-lg font-display font-bold placeholder:text-white/20 rounded-xl focus:border-brand-blue" />
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="space-y-1.5">
                        <Label className="text-white/70 text-sm">Reason (required)</Label>
                        <Input placeholder="e.g. Manual correction, bonus credit..." value={reason}
                            onChange={(e: any) => setReason(e.target.value)}
                            className="h-11 bg-navy/60 border-navy-border text-white placeholder:text-white/20 rounded-xl focus:border-brand-blue" />
                    </div>

                    {/* Warning for debit */}
                    {type === "debit" && numAmount > 0 && (
                        <div className="flex items-start gap-2 p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                            <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                            <p className="text-red-400 text-xs">
                                This will deduct {formatCurrency(numAmount)} from the user's account. This action is logged and irreversible.
                            </p>
                        </div>
                    )}

                    <Button onClick={handleAdjust} disabled={loading || !numAmount || !reason.trim()}
                        className={cn(
                            "w-full h-12 font-semibold rounded-xl disabled:opacity-50",
                            type === "credit" ? "bg-brand-emerald hover:bg-emerald-600 text-white" : "bg-red-500 hover:bg-red-600 text-white"
                        )}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : `${type === "credit" ? "Credit" : "Debit"} Account`}
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}