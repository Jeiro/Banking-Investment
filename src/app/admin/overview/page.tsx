"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import {
  Users, ArrowDownCircle, ArrowUpCircle,
  DollarSign, ShieldCheck, TrendingUp,
  Clock, AlertTriangle, CheckCircle2,
  XCircle, Activity,
} from "lucide-react"
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import { createClient } from "@/lib/supabase/client"
import { formatCurrency, formatDate } from "@/lib/utils"
import { motion as m } from "framer-motion"

// ── Metric card ──────────────────────────────────────────────────────
function MetricCard({
  title, value, sub, icon: Icon, iconColor, iconBg, change, delay = 0,
}: {
  title: string; value: string; sub?: string; icon: any
  iconColor: string; iconBg: string; change?: string; delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-navy-card border border-navy-border rounded-2xl p-5 hover:border-white/10 transition-colors"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        {change && (
          <span className="text-xs font-semibold px-2 py-1 rounded-lg text-brand-emerald bg-brand-emerald/10">
            {change}
          </span>
        )}
      </div>
      <p className="text-white/50 text-xs font-medium mb-1">{title}</p>
      <p className="font-display text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-white/30 text-xs mt-1">{sub}</p>}
    </motion.div>
  )
}

// ── Demo data ────────────────────────────────────────────────────────
const revenueData = [
  { month: "Oct", deposits: 420000, withdrawals: 180000 },
  { month: "Nov", deposits: 380000, withdrawals: 210000 },
  { month: "Dec", deposits: 510000, withdrawals: 195000 },
  { month: "Jan", deposits: 460000, withdrawals: 220000 },
  { month: "Feb", deposits: 590000, withdrawals: 245000 },
  { month: "Mar", deposits: 680000, withdrawals: 260000 },
]

const userGrowth = [
  { month: "Oct", users: 38000 },
  { month: "Nov", users: 41000 },
  { month: "Dec", users: 43500 },
  { month: "Jan", users: 46000 },
  { month: "Feb", users: 48500 },
  { month: "Mar", users: 51200 },
]

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-navy-card border border-navy-border rounded-xl p-3 shadow-xl">
      <p className="text-white/50 text-xs mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-white text-xs font-semibold">
          {p.name}: {p.name.includes("users") ? p.value.toLocaleString() : formatCurrency(p.value)}
        </p>
      ))}
    </div>
  )
}

export default function AdminOverviewPage() {
  const supabase = createClient()
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingKyc: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    totalDeposited: 0,
    totalWithdrawn: 0,
    openTickets: 0,
  })
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [pendingActions, setPendingActions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [
        { count: totalUsers },
        { count: activeUsers },
        { count: pendingKyc },
        { count: pendingDeposits },
        { count: pendingWithdrawals },
        { count: openTickets },
        { data: recentU },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("kyc_status", "pending"),
        supabase.from("deposits").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("withdrawals").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("support_tickets").select("*", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("profiles").select("id,first_name,last_name,email,created_at,kyc_status,status")
          .order("created_at", { ascending: false }).limit(5),
      ])

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        pendingKyc: pendingKyc || 0,
        pendingDeposits: pendingDeposits || 0,
        pendingWithdrawals: pendingWithdrawals || 0,
        totalDeposited: 2400000,
        totalWithdrawn: 980000,
        openTickets: openTickets || 0,
      })

      if (recentU) setRecentUsers(recentU)

      // Build pending actions list
      const actions: any[] = []
      if (pendingKyc && pendingKyc > 0) actions.push({ type: "kyc", label: `${pendingKyc} KYC submissions pending review`, href: "/admin/kyc", icon: ShieldCheck, color: "text-brand-gold" })
      if (pendingDeposits && pendingDeposits > 0) actions.push({ type: "deposit", label: `${pendingDeposits} deposit requests awaiting approval`, href: "/admin/deposits", icon: ArrowDownCircle, color: "text-brand-blue" })
      if (pendingWithdrawals && pendingWithdrawals > 0) actions.push({ type: "withdrawal", label: `${pendingWithdrawals} withdrawal requests awaiting approval`, href: "/admin/withdrawals", icon: ArrowUpCircle, color: "text-orange-400" })
      if (openTickets && openTickets > 0) actions.push({ type: "tickets", label: `${openTickets} open support tickets`, href: "/admin/support", icon: MessageCircle, color: "text-purple-400" })
      setPendingActions(actions)

      setLoading(false)
    }
    load()
  }, [])

  const kycBadge = (status: string) => {
    const map: Record<string, string> = {
      verified: "bg-brand-emerald/10 text-brand-emerald",
      pending: "bg-brand-gold/10 text-brand-gold",
      unverified: "bg-white/5 text-white/30",
      rejected: "bg-red-500/10 text-red-400",
    }
    return map[status] || map.unverified
  }

  return (
    <div className="space-y-6 max-w-7xl">

      {/* Alert banner — pending items */}
      {pendingActions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 bg-brand-gold/5 border border-brand-gold/20 rounded-xl"
        >
          <AlertTriangle className="w-4 h-4 text-brand-gold mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-brand-gold text-sm font-semibold mb-1">Action Required</p>
            <div className="flex flex-wrap gap-3">
              {pendingActions.map((a) => (
                <a key={a.type} href={a.href}
                  className={`text-xs ${a.color} hover:underline flex items-center gap-1`}>
                  <a.icon className="w-3 h-3" />
                  {a.label}
                </a>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Users" value={stats.totalUsers.toLocaleString()}
          sub={`${stats.activeUsers.toLocaleString()} active`}
          icon={Users} iconColor="text-brand-blue" iconBg="bg-brand-blue/10" change="+12%" delay={0} />
        <MetricCard title="Total Deposited" value={formatCurrency(stats.totalDeposited)}
          sub="All time"
          icon={ArrowDownCircle} iconColor="text-brand-emerald" iconBg="bg-brand-emerald/10" change="+8.4%" delay={0.1} />
        <MetricCard title="Total Withdrawn" value={formatCurrency(stats.totalWithdrawn)}
          sub="All time"
          icon={ArrowUpCircle} iconColor="text-orange-400" iconBg="bg-orange-400/10" delay={0.2} />
        <MetricCard title="Open Tickets" value={stats.openTickets.toString()}
          sub="Need response"
          icon={Activity} iconColor="text-purple-400" iconBg="bg-purple-400/10" delay={0.3} />
      </div>

      {/* Pending review cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Pending KYC", value: stats.pendingKyc, href: "/admin/kyc", color: "border-brand-gold/20 bg-brand-gold/5", badge: "text-brand-gold", icon: ShieldCheck },
          { label: "Pending Deposits", value: stats.pendingDeposits, href: "/admin/deposits", color: "border-brand-blue/20 bg-brand-blue/5", badge: "text-brand-blue", icon: ArrowDownCircle },
          { label: "Pending Withdrawals", value: stats.pendingWithdrawals, href: "/admin/withdrawals", color: "border-orange-500/20 bg-orange-500/5", badge: "text-orange-400", icon: ArrowUpCircle },
        ].map(({ label, value, href, color, badge, icon: Icon }, i) => (
          <motion.a
            key={label}
            href={href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
            className={`flex items-center justify-between p-5 rounded-2xl border ${color} hover:scale-[1.02] transition-transform cursor-pointer`}
          >
            <div>
              <p className="text-white/50 text-xs mb-1">{label}</p>
              <p className={`font-display text-3xl font-bold ${badge}`}>{value}</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl bg-navy-card/60 flex items-center justify-center`}>
              <Icon className={`w-6 h-6 ${badge}`} />
            </div>
          </motion.a>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-4">

        {/* Revenue chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-navy-card border border-navy-border rounded-2xl p-5"
        >
          <div className="mb-5">
            <h3 className="font-display font-semibold text-white">Deposit vs Withdrawal Volume</h3>
            <p className="text-white/40 text-xs mt-0.5">6-month comparison</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
              <Bar dataKey="deposits" fill="#2563EB" radius={[4, 4, 0, 0]} opacity={0.9} />
              <Bar dataKey="withdrawals" fill="#F59E0B" radius={[4, 4, 0, 0]} opacity={0.9} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3">
            <span className="flex items-center gap-1.5 text-xs text-white/40"><span className="w-2.5 h-2.5 rounded-sm bg-brand-blue" />Deposits</span>
            <span className="flex items-center gap-1.5 text-xs text-white/40"><span className="w-2.5 h-2.5 rounded-sm bg-brand-gold" />Withdrawals</span>
          </div>
        </motion.div>

        {/* User growth chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-navy-card border border-navy-border rounded-2xl p-5"
        >
          <div className="mb-5">
            <h3 className="font-display font-semibold text-white">User Growth</h3>
            <p className="text-white/40 text-xs mt-0.5">Cumulative registered users</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={userGrowth}>
              <defs>
                <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "rgba(255,255,255,0.08)" }} />
              <Area type="monotone" dataKey="users" stroke="#10B981" strokeWidth={2} fill="url(#userGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent users table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="bg-navy-card border border-navy-border rounded-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-navy-border">
          <div>
            <h3 className="font-display font-semibold text-white">Recently Registered</h3>
            <p className="text-white/40 text-xs mt-0.5">Latest {recentUsers.length} users</p>
          </div>
          <a href="/admin/users" className="text-brand-blue text-xs hover:underline">View all →</a>
        </div>

        {recentUsers.length === 0 ? (
          <div className="py-12 text-center text-white/30 text-sm">No users yet</div>
        ) : (
          <div className="divide-y divide-navy-border/50">
            {recentUsers.map((u, i) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.8 + i * 0.05 }}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/2 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-brand-emerald flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {u.first_name?.[0]}{u.last_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{u.first_name} {u.last_name}</p>
                  <p className="text-white/40 text-xs truncate">{u.email}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${kycBadge(u.kyc_status)}`}>
                  {u.kyc_status}
                </span>
                <span className="text-white/30 text-xs hidden md:block">{formatDate(u.created_at)}</span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}

// Needed for pending actions (avoid import error)
function MessageCircle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}