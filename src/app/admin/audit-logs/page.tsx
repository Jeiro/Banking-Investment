"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ScrollText, Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { formatDate, cn } from "@/lib/utils"

interface AuditEntry {
  id: string
  actor_id: string | null
  action: string
  entity_type: string
  entity_id: string | null
  old_value: any
  new_value: any
  ip_address: string | null
  created_at: string
  profiles: { first_name: string; last_name: string; email: string } | null
}

const ACTION_COLOR: Record<string, string> = {
  DEPOSIT_APPROVED: "text-brand-emerald bg-brand-emerald/10",
  WITHDRAWAL_APPROVED: "text-brand-emerald bg-brand-emerald/10",
  KYC_APPROVED: "text-brand-emerald bg-brand-emerald/10",
  DEPOSIT_REJECTED: "text-red-400 bg-red-400/10",
  WITHDRAWAL_REJECTED: "text-red-400 bg-red-400/10",
  KYC_REJECTED: "text-red-400 bg-red-400/10",
  USER_SUSPENDED: "text-orange-400 bg-orange-400/10",
  USER_ACTIVE: "text-brand-blue bg-brand-blue/10",
  BALANCE_CREDIT: "text-brand-emerald bg-brand-emerald/10",
  BALANCE_DEBIT: "text-red-400 bg-red-400/10",
}

export default function AuditLogsPage() {
  const supabase = createClient()
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("audit_logs")
        .select("*, profiles(first_name,last_name,email)")
        .order("created_at", { ascending: false })
        .limit(100)
      if (data) setLogs(data as AuditEntry[])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = logs.filter((l) =>
    !search || l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.entity_type.toLowerCase().includes(search.toLowerCase()) ||
    l.profiles?.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Search */}
      <div className="relative max-w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <Input
          placeholder="Search action, entity, admin..."
          value={search}
          onChange={(e: any) => setSearch(e.target.value)}
          className="pl-9 h-10 bg-navy-card border-navy-border text-white placeholder:text-white/20 rounded-xl focus:border-brand-blue"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-brand-blue animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <ScrollText className="w-10 h-10 text-white/10 mx-auto mb-3" />
          <p className="text-white/30">No audit logs found</p>
        </div>
      ) : (
        <div className="bg-navy-card border border-navy-border rounded-2xl overflow-hidden">
          <div className="hidden lg:grid grid-cols-[1.5fr_1fr_1fr_1fr_120px] gap-4 px-5 py-3 border-b border-navy-border bg-navy/40">
            {["Admin", "Action", "Entity", "Entity ID", "Timestamp"].map((h) => (
              <span key={h} className="text-white/30 text-xs font-semibold uppercase tracking-wide">{h}</span>
            ))}
          </div>

          <div className="divide-y divide-navy-border/50">
            {filtered.map((log, i) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25, delay: i * 0.02 }}
                className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr_1fr_1fr_120px] gap-4 px-5 py-3.5 hover:bg-white/2 transition-colors items-center"
              >
                {/* Admin */}
                <div className="min-w-0">
                  <p className="text-white text-sm truncate">
                    {log.profiles ? `${log.profiles.first_name} ${log.profiles.last_name}` : "System"}
                  </p>
                  <p className="text-white/30 text-xs truncate">{log.profiles?.email || "—"}</p>
                </div>

                {/* Action */}
                <span className={cn(
                  "inline-flex w-fit text-xs font-semibold px-2.5 py-1 rounded-full",
                  ACTION_COLOR[log.action] || "bg-white/5 text-white/40"
                )}>
                  {log.action.replace(/_/g, " ")}
                </span>

                {/* Entity type */}
                <span className="text-white/50 text-sm capitalize">{log.entity_type.replace("_", " ")}</span>

                {/* Entity ID */}
                <span className="text-white/30 text-xs font-mono truncate">{log.entity_id?.slice(0, 12) || "—"}...</span>

                {/* Timestamp */}
                <span className="text-white/30 text-xs">{formatDate(log.created_at)}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}