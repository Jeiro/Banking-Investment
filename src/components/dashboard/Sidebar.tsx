"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, ArrowLeftRight, ArrowDownCircle, ArrowUpCircle,
  Send, TrendingUp, Users, ShieldCheck, FileText, MessageCircle,
  Settings, LogOut, Hexagon, Menu, X, ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/useUser"
import { toast } from "sonner"

const NAV = [
  { label: "Overview", href: "/dashboard/overview", icon: LayoutDashboard },
  { label: "Transactions", href: "/dashboard/transactions", icon: ArrowLeftRight },
  { label: "Deposit", href: "/dashboard/deposit", icon: ArrowDownCircle },
  { label: "Withdraw", href: "/dashboard/withdraw", icon: ArrowUpCircle },
  { label: "Transfer", href: "/dashboard/transfer", icon: Send },
  { label: "Investments", href: "/dashboard/investments", icon: TrendingUp },
  { label: "Beneficiaries", href: "/dashboard/beneficiaries", icon: Users },
  { label: "KYC", href: "/dashboard/kyc", icon: ShieldCheck },
  { label: "Statements", href: "/dashboard/statements", icon: FileText },
  { label: "Support", href: "/dashboard/support", icon: MessageCircle },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
]

export default function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { profile } = useUser()
  const [mobileOpen, setMobileOpen] = useState(false)

  // close mobile menu on route change
  useEffect(() => setMobileOpen(false), [pathname])

  async function handleLogout() {
    await supabase.auth.signOut()
    toast.success("Signed out")
    router.push("/login")
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-5 border-b border-navy-border">
        <div className="w-8 h-8 bg-gradient-to-br from-brand-blue to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Hexagon className="w-4 h-4 text-white fill-white/20" />
        </div>
        <span className="font-display font-bold text-lg text-white">
          Nex<span className="text-brand-blue">Vault</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link key={href} href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                active
                  ? "bg-brand-blue/15 text-white border border-brand-blue/20"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className={cn("w-4 h-4 flex-shrink-0 transition-colors",
                active ? "text-brand-blue" : "text-white/40 group-hover:text-white/70"
              )} />
              {label}
              {active && <ChevronRight className="w-3 h-3 ml-auto text-brand-blue/60" />}
            </Link>
          )
        })}
      </nav>

      {/* Profile + Logout */}
      <div className="px-3 py-4 border-t border-navy-border space-y-1">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-navy-card/60 border border-navy-border mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue to-brand-emerald flex items-center justify-center text-white text-xs font-bold font-display flex-shrink-0">
            {profile?.first_name?.[0]}{profile?.last_name?.[0]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-medium truncate">
              {profile?.first_name} {profile?.last_name}
            </p>
            <p className="text-white/40 text-xs truncate">{profile?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-red-400 hover:bg-red-400/5 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-navy-card border-r border-navy-border fixed inset-y-0 left-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-navy-card border border-navy-border rounded-xl flex items-center justify-center text-white/70 hover:text-white transition-colors shadow-lg"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="lg:hidden fixed inset-y-0 left-0 w-64 bg-navy-card border-r border-navy-border z-50 flex flex-col"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white"
              >
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