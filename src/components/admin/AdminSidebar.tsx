"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, Users, ShieldCheck, ArrowLeftRight,
  ArrowDownCircle, ArrowUpCircle, MessageCircle, ScrollText,
  Settings, LogOut, Hexagon, Menu, X, ChevronRight,
  TrendingUp, Bell,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

const NAV = [
  { label: "Overview", href: "/admin/overview", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "KYC Review", href: "/admin/kyc", icon: ShieldCheck },
  { label: "Transactions", href: "/admin/transactions", icon: ArrowLeftRight },
  { label: "Deposits", href: "/admin/deposits", icon: ArrowDownCircle },
  { label: "Withdrawals", href: "/admin/withdrawals", icon: ArrowUpCircle },
  { label: "Investments", href: "/admin/investments", icon: TrendingUp },
  { label: "Notifications", href: "/admin/notifications", icon: Bell },
  { label: "Support", href: "/admin/support", icon: MessageCircle },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText },
  { label: "Settings", href: "/admin/settings", icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => setMobileOpen(false), [pathname])

  async function handleLogout() {
    await supabase.auth.signOut()
    toast.success("Signed out")
    router.push("/login")
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo + Admin badge */}
      <div className="px-5 py-5 border-b border-navy-border">
        <Link href="/admin/overview" className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-red-500/30">
            <Hexagon className="w-4 h-4 text-white fill-white/20" />
          </div>
          <span className="font-display font-bold text-lg text-white">
            Nex<span className="text-red-400">Vault</span>
          </span>
        </Link>
        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
          <span className="text-red-400 text-xs font-semibold tracking-wide">ADMIN PANEL</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                active
                  ? "bg-red-500/10 text-white border border-red-500/20"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className={cn(
                "w-4 h-4 flex-shrink-0 transition-colors",
                active ? "text-red-400" : "text-white/30 group-hover:text-white/60"
              )} />
              {label}
              {active && <ChevronRight className="w-3 h-3 ml-auto text-red-400/60" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-navy-border space-y-1">
        <Link
          href="/dashboard/overview"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all"
        >
          <LayoutDashboard className="w-4 h-4" />
          Switch to User View
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-red-400 hover:bg-red-400/5 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside className="hidden lg:flex flex-col w-64 bg-navy-card border-r border-navy-border fixed inset-y-0 left-0 z-40">
        <SidebarContent />
      </aside>

      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-navy-card border border-navy-border rounded-xl flex items-center justify-center text-white/70 hover:text-white transition-colors shadow-lg"
      >
        <Menu className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="lg:hidden fixed inset-y-0 left-0 w-64 bg-navy-card border-r border-navy-border z-50 flex flex-col"
            >
              <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-white/40 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}