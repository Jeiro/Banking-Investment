"use client"

import { useEffect, useState } from "react"
import {
  Wallet, TrendingUp, ArrowDownCircle,
  ArrowUpCircle, CreditCard,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/useUser"
import { formatCurrency } from "@/lib/utils"
import StatCard from "@/components/shared/StatCard"
import AnalyticsChart from "@/components/dashboard/AnalyticsChart"
import TransactionTable from "@/components/dashboard/TransactionTable"
import QuickActions from "@/components/dashboard/QuickActions"
import OnboardingChecklist from "@/components/dashboard/OnboardingChecklist"
import { DashboardSkeleton } from "@/components/shared/LoadingSkeleton"
import type { Account, Transaction } from "@/types/database"

export default function DashboardOverviewPage() {
  const supabase = createClient()
  const { profile, loading: profileLoading } = useUser()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Partial<Transaction>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: accs }, { data: txns }] = await Promise.all([
        supabase.from("accounts").select("*").eq("user_id", user.id),
        supabase.from("transactions").select("*").eq("user_id", user.id)
          .order("created_at", { ascending: false }).limit(5),
      ])

      if (accs) setAccounts(accs)
      if (txns) setTransactions(txns)
      setLoading(false)
    }
    load()
  }, [])

  if (loading || profileLoading) return <DashboardSkeleton />

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0)
  const checking = accounts.find((a) => a.account_type === "checking")
  const savings = accounts.find((a) => a.account_type === "savings")
  const investment = accounts.find((a) => a.account_type === "investment")

  return (
    <div className="space-y-6 max-w-7xl">

      {/* Welcome banner */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">
            Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},{" "}
            <span className="text-brand-blue">{profile?.first_name}</span> 👋
          </h2>
          <p className="text-white/40 text-sm mt-1">
            Here&apos;s what&apos;s happening with your finances today.
          </p>
        </div>

        {/* Total balance pill */}
        <div className="flex items-center gap-3 px-5 py-3 bg-navy-card border border-navy-border rounded-2xl">
          <div className="w-9 h-9 bg-brand-blue/10 rounded-xl flex items-center justify-center">
            <Wallet className="w-4 h-4 text-brand-blue" />
          </div>
          <div>
            <p className="text-white/40 text-xs">Total Balance</p>
            <p className="font-display font-bold text-white text-lg">{formatCurrency(totalBalance)}</p>
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Checking Account"
          value={formatCurrency(checking?.balance || 0)}
          change="2.4%"
          changePositive={true}
          icon={CreditCard}
          iconColor="text-brand-blue"
          iconBg="bg-brand-blue/10"
          delay={0}
        />
        <StatCard
          title="Savings Account"
          value={formatCurrency(savings?.balance || 0)}
          change="5.1%"
          changePositive={true}
          icon={Wallet}
          iconColor="text-brand-emerald"
          iconBg="bg-brand-emerald/10"
          delay={0.1}
        />
        <StatCard
          title="Investments"
          value={formatCurrency(investment?.balance || 0)}
          change="12.7%"
          changePositive={true}
          icon={TrendingUp}
          iconColor="text-purple-400"
          iconBg="bg-purple-400/10"
          delay={0.2}
        />
        <StatCard
          title="Monthly Return"
          value={formatCurrency(1240.50)}
          change="8.3%"
          changePositive={true}
          icon={ArrowDownCircle}
          iconColor="text-brand-gold"
          iconBg="bg-brand-gold/10"
          delay={0.3}
        />
      </div>

      {/* Chart + Quick actions */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <AnalyticsChart />
        </div>
        <div className="flex flex-col gap-4">
          <QuickActions />
          {profile && <OnboardingChecklist profile={profile} />}
        </div>
      </div>

      {/* Account cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {accounts.map((acc, i) => (
          <div
            key={acc.id}
            className="relative overflow-hidden bg-navy-card border border-navy-border rounded-2xl p-5 hover:border-white/10 transition-colors"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] pointer-events-none ${
              acc.account_type === "checking" ? "bg-brand-blue/15" :
              acc.account_type === "savings" ? "bg-brand-emerald/15" : "bg-purple-500/15"
            }`} />
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                  acc.account_type === "checking" ? "bg-brand-blue/10 text-brand-blue" :
                  acc.account_type === "savings" ? "bg-brand-emerald/10 text-brand-emerald" :
                  "bg-purple-500/10 text-purple-400"
                }`}>
                  {acc.account_name}
                </span>
                {acc.is_primary && (
                  <span className="text-xs text-white/30">Primary</span>
                )}
              </div>
              <p className="font-display text-2xl font-bold text-white mb-1">
                {formatCurrency(acc.balance)}
              </p>
              <p className="text-white/30 text-xs">
                •••• {acc.account_number.slice(-4)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent transactions */}
      <TransactionTable transactions={transactions.length > 0 ? transactions : undefined} limit={5} />
    </div>
  )
}