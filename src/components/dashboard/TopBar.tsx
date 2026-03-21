"use client"

import { useState, useEffect } from "react"
import { Bell, Search, Sun, Moon, X } from "lucide-react"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@/hooks/useUser"
import { formatDate } from "@/lib/utils"
import type { Notification } from "@/types/database"

const PAGE_TITLES: Record<string, string> = {
  "/dashboard/overview": "Overview",
  "/dashboard/transactions": "Transactions",
  "/dashboard/deposit": "Deposit Funds",
  "/dashboard/withdraw": "Withdraw Funds",
  "/dashboard/transfer": "Transfer Money",
  "/dashboard/investments": "Investments",
  "/dashboard/beneficiaries": "Beneficiaries",
  "/dashboard/kyc": "KYC Verification",
  "/dashboard/statements": "Statements",
  "/dashboard/support": "Support",
  "/dashboard/settings": "Settings",
}

export default function DashboardTopBar() {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const supabase = createClient()
  const { profile } = useUser()
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread] = useState(0)

  const title = PAGE_TITLES[pathname] || "Dashboard"

  useEffect(() => {
    async function loadNotifications() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10)
      if (data) {
        setNotifications(data)
        setUnread(data.filter((n) => !n.is_read).length)
      }
    }
    loadNotifications()
  }, [])

  async function markAllRead() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id)
    setNotifications((p) => p.map((n) => ({ ...n, is_read: true })))
    setUnread(0)
  }

  const notifTypeColor: Record<string, string> = {
    success: "bg-brand-emerald",
    error: "bg-red-500",
    warning: "bg-brand-gold",
    info: "bg-brand-blue",
    transaction: "bg-purple-500",
    kyc: "bg-cyan-500",
    security: "bg-orange-500",
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 bg-navy/80 backdrop-blur-xl border-b border-navy-border">

      {/* Left — title (with left padding on mobile for burger button) */}
      <div className="pl-12 lg:pl-0">
        <h1 className="font-display font-bold text-white text-lg">{title}</h1>
        <p className="text-white/30 text-xs hidden sm:block">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">

        {/* KYC badge */}
        {profile?.kyc_status !== "verified" && (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/10 border border-brand-gold/20 text-brand-gold text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
            KYC Pending
          </span>
        )}

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-9 h-9 rounded-xl border border-navy-border bg-navy-card flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="w-9 h-9 rounded-xl border border-navy-border bg-navy-card flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all relative"
          >
            <Bell className="w-4 h-4" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-12 w-80 bg-navy-card border border-navy-border rounded-2xl shadow-2xl shadow-black/40 overflow-hidden z-50"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-navy-border">
                  <span className="font-display font-semibold text-white text-sm">Notifications</span>
                  <div className="flex items-center gap-2">
                    {unread > 0 && (
                      <button onClick={markAllRead} className="text-brand-blue text-xs hover:underline">
                        Mark all read
                      </button>
                    )}
                    <button onClick={() => setNotifOpen(false)} className="text-white/30 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* List */}
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="py-10 text-center text-white/30 text-sm">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id}
                        className={`flex gap-3 px-4 py-3 border-b border-navy-border/50 hover:bg-white/3 transition-colors ${!n.is_read ? "bg-brand-blue/3" : ""}`}
                      >
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${notifTypeColor[n.type] || "bg-brand-blue"}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-white text-xs font-semibold truncate">{n.title}</p>
                          <p className="text-white/40 text-xs leading-relaxed">{n.message}</p>
                          <p className="text-white/20 text-xs mt-1">{formatDate(n.created_at)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-blue to-brand-emerald flex items-center justify-center text-white text-xs font-bold font-display border border-navy-border">
          {profile?.first_name?.[0]}{profile?.last_name?.[0]}
        </div>
      </div>
    </header>
  )
}