"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  ArrowDownCircle, ArrowUpCircle, ArrowLeftRight,
  TrendingUp, Search, Filter, ChevronDown,
} from "lucide-react"
import { cn, formatCurrency, formatDate } from "@/lib/utils"
import type { Transaction } from "@/types/database"

const typeConfig = {
  deposit: { icon: ArrowDownCircle, color: "text-brand-emerald", bg: "bg-brand-emerald/10", label: "Deposit" },
  withdrawal: { icon: ArrowUpCircle, color: "text-red-400", bg: "bg-red-400/10", label: "Withdrawal" },
  transfer_in: { icon: ArrowDownCircle, color: "text-brand-blue", bg: "bg-brand-blue/10", label: "Transfer In" },
  transfer_out: { icon: ArrowUpCircle, color: "text-orange-400", bg: "bg-orange-400/10", label: "Transfer Out" },
  investment: { icon: TrendingUp, color: "text-purple-400", bg: "bg-purple-400/10", label: "Investment" },
  return: { icon: TrendingUp, color: "text-brand-emerald", bg: "bg-brand-emerald/10", label: "Return" },
  fee: { icon: ArrowUpCircle, color: "text-white/40", bg: "bg-white/5", label: "Fee" },
  refund: { icon: ArrowDownCircle, color: "text-cyan-400", bg: "bg-cyan-400/10", label: "Refund" },
}

const statusConfig = {
  completed: "text-brand-emerald bg-brand-emerald/10",
  pending: "text-brand-gold bg-brand-gold/10",
  processing: "text-brand-blue bg-brand-blue/10",
  failed: "text-red-400 bg-red-400/10",
  cancelled: "text-white/40 bg-white/5",
}

// Demo transactions for display when DB is empty
const DEMO_TRANSACTIONS: Partial<Transaction>[] = [
  { id: "1", type: "deposit", status: "completed", amount: 5000, description: "Bank Transfer Deposit", reference_id: "TXN-A1B2C3", created_at: new Date().toISOString() },
  { id: "2", type: "transfer_out", status: "completed", amount: 1200, description: "Transfer to James Wilson", reference_id: "TXN-D4E5F6", created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: "3", type: "investment", status: "completed", amount: 3000, description: "Balanced Portfolio Plan", reference_id: "TXN-G7H8I9", created_at: new Date(Date.now() - 172800000).toISOString() },
  { id: "4", type: "return", status: "completed", amount: 217.50, description: "Investment Return", reference_id: "TXN-J1K2L3", created_at: new Date(Date.now() - 259200000).toISOString() },
  { id: "5", type: "withdrawal", status: "pending", amount: 800, description: "Withdrawal to Chase Bank", reference_id: "TXN-M4N5O6", created_at: new Date(Date.now() - 345600000).toISOString() },
  { id: "6", type: "transfer_in", status: "completed", amount: 2500, description: "Transfer from Sarah M.", reference_id: "TXN-P7Q8R9", created_at: new Date(Date.now() - 432000000).toISOString() },
]

interface TransactionTableProps {
  transactions?: Partial<Transaction>[]
  showFilters?: boolean
  limit?: number
}

export default function TransactionTable({
  transactions = DEMO_TRANSACTIONS,
  showFilters = false,
  limit,
}: TransactionTableProps) {
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const filtered = transactions
    .filter((t) => {
      const matchSearch = !search ||
        t.description?.toLowerCase().includes(search.toLowerCase()) ||
        t.reference_id?.toLowerCase().includes(search.toLowerCase())
      const matchType = filterType === "all" || t.type === filterType
      const matchStatus = filterStatus === "all" || t.status === filterStatus
      return matchSearch && matchType && matchStatus
    })
    .slice(0, limit)

  return (
    <div className="bg-navy-card border border-navy-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-navy-border">
        <div>
          <h3 className="font-display font-semibold text-white">Recent Transactions</h3>
          <p className="text-white/40 text-xs mt-0.5">{filtered.length} transactions</p>
        </div>

        {showFilters && (
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-2 bg-navy/60 border border-navy-border rounded-lg text-white text-xs placeholder:text-white/20 focus:border-brand-blue outline-none w-40 transition-all"
              />
            </div>

            {/* Type filter */}
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-3 pr-7 py-2 bg-navy/60 border border-navy-border rounded-lg text-white text-xs focus:border-brand-blue outline-none appearance-none cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="deposit">Deposit</option>
                <option value="withdrawal">Withdrawal</option>
                <option value="transfer_in">Transfer In</option>
                <option value="transfer_out">Transfer Out</option>
                <option value="investment">Investment</option>
                <option value="return">Return</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" />
            </div>

            {/* Status filter */}
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-3 pr-7 py-2 bg-navy/60 border border-navy-border rounded-lg text-white text-xs focus:border-brand-blue outline-none appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <ArrowLeftRight className="w-10 h-10 text-white/10 mx-auto mb-3" />
          <p className="text-white/30 text-sm">No transactions found</p>
        </div>
      ) : (
        <div className="divide-y divide-navy-border/50">
          {filtered.map((txn, i) => {
            const cfg = typeConfig[txn.type as keyof typeof typeConfig] || typeConfig.deposit
            const Icon = cfg.icon
            const isCredit = ["deposit", "transfer_in", "return", "refund"].includes(txn.type || "")

            return (
              <motion.div
                key={txn.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="flex items-center gap-4 px-5 py-4 hover:bg-white/2 transition-colors"
              >
                {/* Icon */}
                <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4 h-4 ${cfg.color}`} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{txn.description || cfg.label}</p>
                  <p className="text-white/30 text-xs">{txn.reference_id}</p>
                </div>

                {/* Status */}
                <span className={cn(
                  "hidden sm:inline-flex text-xs font-medium px-2 py-1 rounded-lg capitalize",
                  statusConfig[txn.status as keyof typeof statusConfig] || statusConfig.pending
                )}>
                  {txn.status}
                </span>

                {/* Date */}
                <span className="hidden md:block text-white/30 text-xs">
                  {txn.created_at ? formatDate(txn.created_at) : "—"}
                </span>

                {/* Amount */}
                <span className={cn(
                  "font-display font-semibold text-sm flex-shrink-0",
                  isCredit ? "text-brand-emerald" : "text-red-400"
                )}>
                  {isCredit ? "+" : "-"}{formatCurrency(txn.amount || 0)}
                </span>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}