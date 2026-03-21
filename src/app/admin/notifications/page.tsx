"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Bell, Send, Loader2, CheckCircle2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

const TYPES = ["info", "success", "warning", "error", "transaction", "kyc", "security"] as const
type NotifType = typeof TYPES[number]

export default function AdminNotificationsPage() {
  const supabase = createClient()
  const [target, setTarget] = useState<"all" | "specific">("all")
  const [targetEmail, setTargetEmail] = useState("")
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [type, setType] = useState<NotifType>("info")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const TYPE_COLORS: Record<NotifType, string> = {
    info: "border-brand-blue bg-brand-blue/10 text-brand-blue",
    success: "border-brand-emerald bg-brand-emerald/10 text-brand-emerald",
    warning: "border-brand-gold bg-brand-gold/10 text-brand-gold",
    error: "border-red-500 bg-red-500/10 text-red-400",
    transaction: "border-purple-500 bg-purple-500/10 text-purple-400",
    kyc: "border-cyan-500 bg-cyan-500/10 text-cyan-400",
    security: "border-orange-500 bg-orange-500/10 text-orange-400",
  }

  async function handleSend() {
    if (!title.trim() || !message.trim()) { toast.error("Title and message are required"); return }
    if (target === "specific" && !targetEmail.trim()) { toast.error("Enter target email"); return }
    setLoading(true)

    if (target === "all") {
      // Get all user IDs
      const { data: users } = await supabase.from("profiles").select("id").eq("role", "user")
      if (users && users.length > 0) {
        const inserts = users.map((u) => ({ user_id: u.id, title, message, type }))
        // Batch insert in chunks of 100
        for (let i = 0; i < inserts.length; i += 100) {
          await supabase.from("notifications").insert(inserts.slice(i, i + 100))
        }
      }
      toast.success(`Notification sent to ${users?.length || 0} users`)
    } else {
      const { data: profile } = await supabase.from("profiles").select("id").eq("email", targetEmail).single()
      if (!profile) { toast.error("User not found"); setLoading(false); return }
      await supabase.from("notifications").insert({ user_id: profile.id, title, message, type })
      toast.success("Notification sent to user")
    }

    setSent(true)
    setLoading(false)
    setTitle(""); setMessage(""); setTargetEmail("")
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <div className="max-w-xl space-y-5">

      {/* Target selector */}
      <div className="bg-navy-card border border-navy-border rounded-2xl p-5 space-y-4">
        <h3 className="font-display font-semibold text-white text-sm">Recipients</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: "all", label: "All Users", icon: Users, desc: "Broadcast to everyone" },
            { value: "specific", label: "Specific User", icon: Bell, desc: "Send to one user" },
          ].map(({ value, label, icon: Icon, desc }) => (
            <button key={value} type="button" onClick={() => setTarget(value as any)}
              className={cn(
                "p-4 rounded-xl border text-left transition-all",
                target === value
                  ? "border-brand-blue bg-brand-blue/10"
                  : "border-navy-border hover:border-white/20"
              )}>
              <Icon className={cn("w-5 h-5 mb-2", target === value ? "text-brand-blue" : "text-white/40")} />
              <p className={cn("font-semibold text-sm", target === value ? "text-white" : "text-white/70")}>{label}</p>
              <p className="text-white/30 text-xs mt-0.5">{desc}</p>
            </button>
          ))}
        </div>

        {target === "specific" && (
          <div className="space-y-1.5">
            <Label className="text-white/70 text-sm">User Email</Label>
            <Input
              placeholder="user@example.com"
              value={targetEmail}
              onChange={(e: any) => setTargetEmail(e.target.value)}
              className="h-11 bg-navy/60 border-navy-border text-white placeholder:text-white/20 rounded-xl focus:border-brand-blue"
            />
          </div>
        )}
      </div>

      {/* Notification content */}
      <div className="bg-navy-card border border-navy-border rounded-2xl p-5 space-y-4">
        <h3 className="font-display font-semibold text-white text-sm">Notification Content</h3>

        {/* Type selector */}
        <div className="space-y-1.5">
          <Label className="text-white/70 text-sm">Type</Label>
          <div className="flex flex-wrap gap-2">
            {TYPES.map((t) => (
              <button key={t} type="button" onClick={() => setType(t)}
                className={cn(
                  "px-3 py-1.5 rounded-lg border text-xs font-medium capitalize transition-all",
                  type === t ? TYPE_COLORS[t] : "border-navy-border text-white/40 hover:border-white/20 hover:text-white"
                )}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-white/70 text-sm">Title</Label>
          <Input
            placeholder="Notification title..."
            value={title}
            onChange={(e: any) => setTitle(e.target.value)}
            className="h-11 bg-navy/60 border-navy-border text-white placeholder:text-white/20 rounded-xl focus:border-brand-blue"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-white/70 text-sm">Message</Label>
          <textarea
            placeholder="Write your message here..."
            value={message}
            onChange={(e: any) => setMessage(e.target.value)}
            rows={4}
            className="w-full bg-navy/60 border border-navy-border rounded-xl p-3 text-white text-sm placeholder:text-white/20 focus:border-brand-blue outline-none resize-none"
          />
        </div>

        {/* Preview */}
        {(title || message) && (
          <div className={cn("p-4 rounded-xl border", TYPE_COLORS[type])}>
            <p className="font-semibold text-sm mb-1">{title || "Title preview"}</p>
            <p className="text-sm opacity-80">{message || "Message preview"}</p>
          </div>
        )}

        <Button
          onClick={handleSend}
          disabled={loading || sent}
          className="w-full h-12 bg-brand-blue hover:bg-blue-600 text-white font-semibold rounded-xl"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> :
            sent ? <><CheckCircle2 className="w-4 h-4 mr-2" />Sent!</> :
              <><Send className="w-4 h-4 mr-2" />Send Notification</>}
        </Button>
      </div>
    </div>
  )
}