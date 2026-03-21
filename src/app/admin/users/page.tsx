"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import {
  Search, Filter, MoreHorizontal, Eye, Ban,
  CheckCircle, XCircle, DollarSign, ChevronDown,
  Loader2, UserCheck, Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { formatDate, cn } from "@/lib/utils"
import { toast } from "sonner"
import type { Profile } from "@/types/database"
import UserDetailModal from "@/components/admin/UserDetailModal"
import BalancedAdjustModal from "@/components/admin/BalancedAdjustModal"

const STATUS_COLORS: Record<string, string> = {
  active: "text-brand-emerald bg-brand-emerald/10",
  suspended: "text-red-400 bg-red-400/10",
  pending: "text-brand-gold bg-brand-gold/10",
  closed: "text-white/30 bg-white/5",
}

const KYC_COLORS: Record<string, string> = {
  verified: "text-brand-emerald bg-brand-emerald/10",
  pending: "text-brand-gold bg-brand-gold/10",
  unverified: "text-white/40 bg-white/5",
  rejected: "text-red-400 bg-red-400/10",
}

export default function AdminUsersPage() {
  const supabase = createClient()
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [kycFilter, setKycFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)
  const [balanceUser, setBalanceUser] = useState<Profile | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    let query = supabase.from("profiles").select("*").order("created_at", { ascending: false })
    if (statusFilter !== "all") query = query.eq("status", statusFilter)
    if (kycFilter !== "all") query = query.eq("kyc_status", kycFilter)
    const { data } = await query
    if (data) setUsers(data)
    setLoading(false)
  }, [statusFilter, kycFilter])

  useEffect(() => { loadUsers() }, [loadUsers])

  const filtered = users.filter((u) =>
    !search || [u.first_name, u.last_name, u.email, u.phone].some(
      (f) => f?.toLowerCase().includes(search.toLowerCase())
    )
  )

  async function toggleStatus(user: Profile) {
    const newStatus = user.status === "active" ? "suspended" : "active"
    setActionLoading(user.id)

    const { error } = await supabase.from("profiles").update({ status: newStatus }).eq("id", user.id)
    if (error) { toast.error("Failed to update status"); setActionLoading(null); return }

    // Audit log
    await supabase.from("audit_logs").insert({
      action: `USER_${newStatus.toUpperCase()}`,
      entity_type: "profile",
      entity_id: user.id,
      new_value: { status: newStatus },
    })

    toast.success(`User ${newStatus === "active" ? "activated" : "suspended"}`)
    setUsers((p) => p.map((u2) => u2.id === user.id ? { ...u2, status: newStatus } : u2))
    setActionLoading(null)
    setOpenMenu(null)
  }

  return (
    <div className="space-y-5 max-w-7xl">

      {/* Filters row */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48 max-w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-navy-card border-navy-border text-white placeholder:text-white/20 rounded-xl focus:border-brand-blue"
          />
        </div>

        {/* Status filter */}
        <div className="relative">
          <select value={statusFilter} onChange={(e: any) => setStatusFilter(e.target.value)}
            className="pl-3 pr-8 h-10 bg-navy-card border border-navy-border rounded-xl text-white text-sm focus:border-brand-blue outline-none appearance-none cursor-pointer">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
        </div>

        {/* KYC filter */}
        <div className="relative">
          <select value={kycFilter} onChange={(e: any) => setKycFilter(e.target.value)}
            className="pl-3 pr-8 h-10 bg-navy-card border border-navy-border rounded-xl text-white text-sm focus:border-brand-blue outline-none appearance-none cursor-pointer">
            <option value="all">All KYC</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="unverified">Unverified</option>
            <option value="rejected">Rejected</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 pointer-events-none" />
        </div>

        <div className="ml-auto text-white/30 text-sm">
          {filtered.length} user{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Table */}
      <div className="bg-navy-card border border-navy-border rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="hidden lg:grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_80px] gap-4 px-5 py-3 border-b border-navy-border bg-navy/40">
          {["User", "Email", "Status", "KYC", "Joined", "Actions"].map((h) => (
            <span key={h} className="text-white/30 text-xs font-semibold uppercase tracking-wide">{h}</span>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-brand-blue animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-white/30 text-sm">No users found</div>
        ) : (
          <div className="divide-y divide-navy-border/50">
            {filtered.map((user, i) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className="grid grid-cols-1 lg:grid-cols-[2fr_1.5fr_1fr_1fr_1fr_80px] gap-4 px-5 py-4 hover:bg-white/2 transition-colors items-center relative"
              >
                {/* User */}
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-blue/60 to-brand-emerald/60 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {user.first_name?.[0]}{user.last_name?.[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{user.first_name} {user.last_name}</p>
                    <p className="text-white/30 text-xs truncate lg:hidden">{user.email}</p>
                    <p className="text-white/30 text-xs capitalize">{user.account_type} · {user.role}</p>
                  </div>
                </div>

                {/* Email */}
                <p className="text-white/60 text-sm truncate hidden lg:block">{user.email}</p>

                {/* Status */}
                <span className={`inline-flex w-fit text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[user.status] || STATUS_COLORS.pending}`}>
                  {user.status}
                </span>

                {/* KYC */}
                <span className={`inline-flex w-fit text-xs font-medium px-2.5 py-1 rounded-full capitalize ${KYC_COLORS[user.kyc_status] || KYC_COLORS.unverified}`}>
                  {user.kyc_status}
                </span>

                {/* Joined */}
                <span className="text-white/30 text-xs hidden lg:block">{formatDate(user.created_at)}</span>

                {/* Actions dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)}
                    className="w-8 h-8 rounded-lg border border-navy-border bg-navy/60 flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all"
                  >
                    {actionLoading === user.id
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <MoreHorizontal className="w-3.5 h-3.5" />
                    }
                  </button>

                  {openMenu === user.id && (
                    <div className="absolute right-0 top-10 w-44 bg-navy-card border border-navy-border rounded-xl shadow-2xl shadow-black/40 z-20 overflow-hidden">
                      {[
                        { label: "View Details", icon: Eye, action: () => { setSelectedUser(user); setOpenMenu(null) } },
                        { label: "Adjust Balance", icon: DollarSign, action: () => { setBalanceUser(user); setOpenMenu(null) } },
                        { label: user.status === "active" ? "Suspend User" : "Activate User", icon: user.status === "active" ? Ban : CheckCircle, action: () => toggleStatus(user), danger: user.status === "active" },
                      ].map(({ label, icon: Icon, action, danger }) => (
                        <button
                          key={label}
                          onClick={action}
                          className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:bg-white/5 ${danger ? "text-red-400" : "text-white/70 hover:text-white"}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedUser && <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
      {balanceUser && <BalancedAdjustModal user={balanceUser} onClose={() => { setBalanceUser(null); loadUsers() }} />}
    </div>
  )
}