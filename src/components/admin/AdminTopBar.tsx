"use client"

import { usePathname } from "next/navigation"
import { Shield, Clock } from "lucide-react"

const PAGE_TITLES: Record<string, string> = {
  "/admin/overview": "Admin Overview",
  "/admin/users": "User Management",
  "/admin/kyc": "KYC Review",
  "/admin/transactions": "Transactions",
  "/admin/deposits": "Deposits",
  "/admin/withdrawals": "Withdrawals",
  "/admin/investments": "Investments",
  "/admin/notifications": "Send Notifications",
  "/admin/support": "Support Tickets",
  "/admin/audit-logs": "Audit Logs",
  "/admin/settings": "System Settings",
}

export default function AdminTopBar() {
  const pathname = usePathname()
  const title = PAGE_TITLES[pathname] || "Admin"
  const now = new Date()

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 bg-navy/80 backdrop-blur-xl border-b border-navy-border">
      <div className="pl-12 lg:pl-0">
        <h1 className="font-display font-bold text-white text-lg">{title}</h1>
        <p className="text-white/30 text-xs hidden sm:block">
          {now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {/* Live clock */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-navy-card border border-navy-border rounded-lg">
          <Clock className="w-3.5 h-3.5 text-white/30" />
          <span className="text-white/50 text-xs font-mono">
            {now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        {/* Admin badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg">
          <Shield className="w-3.5 h-3.5 text-red-400" />
          <span className="text-red-400 text-xs font-semibold">Super Admin</span>
        </div>
      </div>
    </header>
  )
}