"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MessageCircle, Plus, Send, Loader2,
  ChevronRight, X, Clock, CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { formatDate, cn } from "@/lib/utils"

const CATEGORIES = ["account", "transaction", "kyc", "technical", "billing", "other"]
const PRIORITIES = ["low", "medium", "high"]

const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  open: { color: "text-brand-emerald", bg: "bg-brand-emerald/10", label: "Open" },
  in_progress: { color: "text-brand-blue", bg: "bg-brand-blue/10", label: "In Progress" },
  waiting: { color: "text-brand-gold", bg: "bg-brand-gold/10", label: "Waiting" },
  resolved: { color: "text-white/40", bg: "bg-white/5", label: "Resolved" },
  closed: { color: "text-white/20", bg: "bg-white/5", label: "Closed" },
}

export default function SupportPage() {
  const supabase = createClient()
  const [tickets, setTickets] = useState<any[]>([])
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewForm, setShowNewForm] = useState(false)
  const [reply, setReply] = useState("")
  const [sending, setSending] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // New ticket form
  const [subject, setSubject] = useState("")
  const [category, setCategory] = useState("account")
  const [priority, setPriority] = useState("medium")
  const [firstMessage, setFirstMessage] = useState("")
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (data) setTickets(data)
      setLoading(false)
    }
    load()
  }, [])

  async function openTicket(ticket: any) {
    setSelectedTicket(ticket)
    const { data } = await supabase
      .from("ticket_messages")
      .select("*, profiles(first_name, last_name, role)")
      .eq("ticket_id", ticket.id)
      .order("created_at", { ascending: true })
    if (data) setMessages(data)
  }

  async function handleCreateTicket() {
    if (!subject.trim() || !firstMessage.trim() || !userId) return
    setCreating(true)

    const { data: ticket, error } = await supabase
      .from("support_tickets")
      .insert({
        user_id: userId,
        subject,
        category,
        priority,
        status: "open",
      })
      .select()
      .single()

    if (error || !ticket) { toast.error("Failed to create ticket"); setCreating(false); return }

    await supabase.from("ticket_messages").insert({
      ticket_id: ticket.id,
      sender_id: userId,
      message: firstMessage,
    })

    toast.success(`Ticket ${ticket.ticket_number} created!`)
    setTickets((p) => [ticket, ...p])
    setSubject(""); setFirstMessage(""); setCategory("account"); setPriority("medium")
    setShowNewForm(false)
    setCreating(false)
    openTicket(ticket)
  }

  async function handleReply() {
    if (!reply.trim() || !selectedTicket || !userId) return
    setSending(true)

    await supabase.from("ticket_messages").insert({
      ticket_id: selectedTicket.id,
      sender_id: userId,
      message: reply,
    })

    const { data } = await supabase
      .from("ticket_messages")
      .select("*, profiles(first_name,last_name,role)")
      .eq("ticket_id", selectedTicket.id)
      .order("created_at", { ascending: true })

    if (data) setMessages(data)
    setReply("")
    setSending(false)
    toast.success("Message sent")
  }

  return (
    <div className="max-w-5xl">
      <div className={cn(
        "grid gap-5",
        selectedTicket ? "lg:grid-cols-[1fr_1.5fr]" : "grid-cols-1"
      )}>

        {/* Left — Ticket list */}
        <div className="flex flex-col gap-3">

          {/* New ticket button */}
          <Button
            onClick={() => { setShowNewForm(!showNewForm); setSelectedTicket(null) }}
            className={cn(
              "h-11 font-semibold rounded-xl gap-2 transition-all",
              showNewForm
                ? "bg-navy-card border border-navy-border text-white/70 hover:text-white"
                : "bg-brand-blue hover:bg-blue-600 text-white"
            )}
          >
            {showNewForm ? <><X className="w-4 h-4" />Cancel</> : <><Plus className="w-4 h-4" />New Ticket</>}
          </Button>

          {/* New ticket form */}
          <AnimatePresence>
            {showNewForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-navy-card border border-brand-blue/20 rounded-2xl p-5 space-y-4">
                  <h3 className="font-display font-semibold text-white text-sm">New Support Ticket</h3>

                  <div className="space-y-1.5">
                    <Label className="text-white/70 text-sm">Subject *</Label>
                    <Input
                      placeholder="Brief description of your issue"
                      value={subject}
                      onChange={(e: any) => setSubject(e.target.value)}
                      className="h-11 bg-navy/60 border-navy-border text-white placeholder:text-white/20 rounded-xl focus:border-brand-blue"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-white/70 text-sm">Category</Label>
                      <select value={category} onChange={(e: any) => setCategory(e.target.value)}
                        className="w-full h-11 bg-navy/60 border border-navy-border rounded-xl px-3 text-white text-sm focus:border-brand-blue outline-none capitalize">
                        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-white/70 text-sm">Priority</Label>
                      <select value={priority} onChange={(e: any) => setPriority(e.target.value)}
                        className="w-full h-11 bg-navy/60 border border-navy-border rounded-xl px-3 text-white text-sm focus:border-brand-blue outline-none capitalize">
                        {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-white/70 text-sm">Message *</Label>
                    <textarea
                      placeholder="Describe your issue in detail..."
                      value={firstMessage}
                      onChange={(e: any) => setFirstMessage(e.target.value)}
                      rows={4}
                      className="w-full bg-navy/60 border border-navy-border rounded-xl p-3 text-white text-sm placeholder:text-white/20 focus:border-brand-blue outline-none resize-none"
                    />
                  </div>

                  <Button
                    onClick={handleCreateTicket}
                    disabled={creating || !subject.trim() || !firstMessage.trim()}
                    className="w-full h-11 bg-brand-blue hover:bg-blue-600 text-white font-semibold rounded-xl"
                  >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Ticket"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tickets list */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-brand-blue animate-spin" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="py-16 text-center bg-navy-card border border-navy-border rounded-2xl">
              <MessageCircle className="w-10 h-10 text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">No tickets yet</p>
              <p className="text-white/20 text-xs mt-1">Create a ticket to get support</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tickets.map((ticket) => {
                const statusCfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.open
                return (
                  <motion.button
                    key={ticket.id}
                    onClick={() => { openTicket(ticket); setShowNewForm(false) }}
                    className={cn(
                      "w-full text-left p-4 rounded-xl border transition-all",
                      selectedTicket?.id === ticket.id
                        ? "border-brand-blue bg-brand-blue/10"
                        : "border-navy-border bg-navy-card hover:border-white/10"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-white text-sm font-medium leading-snug flex-1">
                        {ticket.subject}
                      </p>
                      <ChevronRight className="w-4 h-4 text-white/20 flex-shrink-0 mt-0.5" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusCfg.bg, statusCfg.color)}>
                          {statusCfg.label}
                        </span>
                        <span className="text-white/30 text-xs font-mono">{ticket.ticket_number}</span>
                      </div>
                      <span className="text-white/20 text-xs flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(ticket.created_at)}
                      </span>
                    </div>
                  </motion.button>
                )
              })}
            </div>
          )}
        </div>

        {/* Right — Conversation view */}
        {selectedTicket && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-navy-card border border-navy-border rounded-2xl flex flex-col overflow-hidden h-[600px]"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-4 border-b border-navy-border flex-shrink-0">
              <div>
                <p className="text-white font-semibold text-sm leading-snug">{selectedTicket.subject}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={cn(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    STATUS_CONFIG[selectedTicket.status]?.bg,
                    STATUS_CONFIG[selectedTicket.status]?.color
                  )}>
                    {STATUS_CONFIG[selectedTicket.status]?.label}
                  </span>
                  <span className="text-white/30 text-xs capitalize">{selectedTicket.category}</span>
                  <span className="text-white/30 text-xs font-mono">{selectedTicket.ticket_number}</span>
                </div>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-white/30 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-white/20 text-sm">No messages yet</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isSupport = msg.profiles?.role === "admin" || msg.profiles?.role === "super_admin"
                  return (
                    <div key={msg.id} className={`flex ${isSupport ? "justify-start" : "justify-end"}`}>
                      <div className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                        isSupport
                          ? "bg-navy/60 border border-navy-border text-white/80 rounded-bl-sm"
                          : "bg-brand-blue/20 border border-brand-blue/20 text-white rounded-br-sm"
                      )}>
                        <p className={cn("text-xs font-medium mb-1", isSupport ? "text-white/40" : "text-brand-blue")}>
                          {isSupport ? "Support Team" : "You"}
                        </p>
                        {msg.message}
                        <p className="text-white/20 text-xs mt-1.5">{formatDate(msg.created_at)}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Reply input */}
            {!["resolved", "closed"].includes(selectedTicket.status) && (
              <div className="p-4 border-t border-navy-border flex gap-2 flex-shrink-0">
                <textarea
                  value={reply}
                  onChange={(e: any) => setReply(e.target.value)}
                  placeholder="Type your message..."
                  rows={2}
                  onKeyDown={(e: any) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply() }
                  }}
                  className="flex-1 bg-navy/60 border border-navy-border rounded-xl p-3 text-white text-sm placeholder:text-white/20 focus:border-brand-blue outline-none resize-none"
                />
                <Button
                  onClick={handleReply}
                  disabled={sending || !reply.trim()}
                  className="self-end h-10 w-10 p-0 bg-brand-blue hover:bg-blue-600 text-white rounded-xl flex-shrink-0"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            )}

            {["resolved", "closed"].includes(selectedTicket.status) && (
              <div className="px-4 py-3 border-t border-navy-border bg-brand-emerald/5 flex-shrink-0">
                <p className="text-brand-emerald text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  This ticket has been resolved. Open a new ticket if you need further help.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}