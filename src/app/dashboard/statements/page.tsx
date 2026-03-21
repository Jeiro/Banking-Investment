"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  FileText, Download, Calendar,
  Loader2, TrendingUp, ArrowDownCircle, ArrowUpCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency, formatDate, cn } from "@/lib/utils"

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

export default function StatementsPage() {
  const supabase = createClient()
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const startDate = new Date(selectedYear, selectedMonth, 1).toISOString()
      const endDate = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59).toISOString()

      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", startDate)
        .lte("created_at", endDate)
        .order("created_at", { ascending: false })

      if (data) setTransactions(data)
      setLoading(false)
    }
    load()
  }, [selectedMonth, selectedYear])

  const credits = transactions.filter((t) =>
    ["deposit", "transfer_in", "return", "refund"].includes(t.type)
  )
  const debits = transactions.filter((t) =>
    ["withdrawal", "transfer_out", "investment", "fee"].includes(t.type)
  )
  const totalCredits = credits.reduce((s, t) => s + t.amount, 0)
  const totalDebits = debits.reduce((s, t) => s + t.amount, 0)

  async function handleDownload() {
    setGenerating(true)
    await new Promise((r) => setTimeout(r, 1500))

    // Generate simple CSV
    const rows = [
      ["Date", "Description", "Reference", "Type", "Amount", "Status"],
      ...transactions.map((t) => [
        formatDate(t.created_at),
        t.description || t.type,
        t.reference_id,
        t.type,
        t.amount.toFixed(2),
        t.status,
      ]),
    ]
    const csv = rows.map((r) => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `NexVault-Statement-${MONTHS[selectedMonth]}-${selectedYear}.csv`
    a.click()
    URL.revokeObjectURL(url)

    setGenerating(false)
  }

  const years = [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2]

  return (
    <div className="max-w-3xl space-y-5">

      {/* Period selector */}
      <div className="bg-navy-card border border-navy-border rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-semibold text-white">Statement Period</h3>
            <p className="text-white/40 text-xs mt-0.5">Select month and year to view transactions</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="pl-3 pr-8 h-10 bg-navy/60 border border-navy-border rounded-xl text-white text-sm focus:border-brand-blue outline-none appearance-none cursor-pointer"
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i}>{m}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="pl-3 pr-8 h-10 bg-navy/60 border border-navy-border rounded-xl text-white text-sm focus:border-brand-blue outline-none appearance-none cursor-pointer"
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <Button
              onClick={handleDownload}
              disabled={generating || transactions.length === 0}
              className="h-10 bg-brand-blue hover:bg-blue-600 text-white rounded-xl gap-2 disabled:opacity-50"
            >
              {generating ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" />Generating...</>
              ) : (
                <><Download className="w-3.5 h-3.5" />Download CSV</>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Credits", value: formatCurrency(totalCredits), icon: ArrowDownCircle, color: "text-brand-emerald", bg: "bg-brand-emerald/10" },
          { label: "Total Debits", value: formatCurrency(totalDebits), icon: ArrowUpCircle, color: "text-red-400", bg: "bg-red-400/10" },
          { label: "Net Flow", value: formatCurrency(totalCredits - totalDebits), icon: TrendingUp, color: totalCredits >= totalDebits ? "text-brand-emerald" : "text-red-400", bg: "bg-white/5" },
        ].map(({ label, value, icon: Icon, color, bg }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
            className="bg-navy-card border border-navy-border rounded-2xl p-4"
          >
            <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-3`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-white/40 text-xs mb-1">{label}</p>
            <p className={`font-display font-bold text-lg ${color}`}>{value}</p>
          </motion.div>
        ))}
      </div>

      {/* Transactions list */}
      <div className="bg-navy-card border border-navy-border rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-navy-border">
          <div>
            <h3 className="font-display font-semibold text-white">
              {MONTHS[selectedMonth]} {selectedYear}
            </h3>
            <p className="text-white/40 text-xs mt-0.5">{transactions.length} transactions</p>
          </div>
          <Calendar className="w-4 h-4 text-white/30" />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-5 h-5 text-brand-blue animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-10 h-10 text-white/10 mx-auto mb-3" />
            <p className="text-white/30 text-sm">No transactions for this period</p>
          </div>
        ) : (
          <div className="divide-y divide-navy-border/50">
            {transactions.map((txn, i) => {
              const isCredit = ["deposit", "transfer_in", "return", "refund"].includes(txn.type)
              return (
                <motion.div
                  key={txn.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25, delay: i * 0.03 }}
                  className="flex items-center gap-4 px-5 py-3.5"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isCredit ? "bg-brand-emerald/10" : "bg-red-400/10"}`}>
                    {isCredit
                      ? <ArrowDownCircle className="w-4 h-4 text-brand-emerald" />
                      : <ArrowUpCircle className="w-4 h-4 text-red-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{txn.description || txn.type}</p>
                    <p className="text-white/30 text-xs">{formatDate(txn.created_at)}</p>
                  </div>
                  <span className={cn(
                    "font-display font-semibold text-sm flex-shrink-0",
                    isCredit ? "text-brand-emerald" : "text-red-400"
                  )}>
                    {isCredit ? "+" : "-"}{formatCurrency(txn.amount)}
                  </span>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}