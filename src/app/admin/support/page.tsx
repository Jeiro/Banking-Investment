"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import {
  MessageCircle, Loader2, Send,
  ChevronDown, Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { formatDate, cn } from "@/lib/utils"
import { toast } from "sonner"

interface TicketEntry {
  id: string
  user_id: string
  ticket_number: string
  subject: string
  category: string | null
  priority: string
  status: string
  created_at: string
  profiles: { first_name: string; last_name: string; email: string } | null
}

const PRIORITY_COLOR: Record<string, string> = {
  low: "text-white/40 bg-white/5",
  medium: "text-brand-blue bg-brand-blue/10",
  high: "text-brand-gold bg-brand-gold/10",
  urgent: "text-red-400 bg-red-400/10",
}

const STATUS_COLOR: Record<string, string> = {
  open: "text-brand-emerald bg-brand-emerald/10",
  in_progress: "text-brand-blue bg-brand-blue/10",
  waiting: "text-brand-gold bg-brand-gold/10",
  resolved: "text-white/40 bg-white/5",
  closed: "text-white/20 bg-white/5",
}

export default function AdminSupportPage() {
  const supabase = createClient()
  const [tickets, setTickets] = useState<TicketEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("open")
  const [selectedTicket, setSelectedTicket] = useState<TicketEntry | null>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [reply, setReply] = useState("")
  const [replying, setReplying] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    let q = supabase.from("support_tickets")
      .select("*, profiles(first_name,last_name,email)")
      .order("created_at", { ascending: false })
    if (filter !== "all") q = q.eq("status", filter)
    const { data } = await q
    if (data) setTickets(data as TicketEntry[])
    setLoading(false)
  }, [filter])

  useEffect(() => { load() }, [load])

  async function openTicket(ticket: TicketEntry) {
    setSelectedTicket(ticket)
    const { data } = await supabase.from("ticket_messages")
      .select("*, profiles(first_name,last_name,role)")
      .eq("ticket_id", ticket.id)
      .order("created_at", { ascending: true })
    if (data) setMessages(data)

    // Mark as in_progress if open
    if (ticket.status === "open") {
      await supabase.from("support_tickets").update({ status: "in_progress" }).eq("id", ticket.id)
      setTickets((p) => p.map((t) => t.id === ticket.id ? { ...t, status: "in_progress" } : t))
    }
  }

  async function sendReply() {
    if (!reply.trim() || !selectedTicket) return
    setReplying(true)
    const { data: { user } } = await supabase.auth.getUser()

    await supabase.from("ticket_messages").insert({
      ticket_id: selectedTicket.id,
      sender_id: user?.id,
      message: reply,
      is_internal: false,
    })

    // Notify user
    await supabase.from("notifications").insert({
      user_id: selectedTicket.user_id,
      title: `Reply on Ticket ${selectedTicket.ticket_number}`,
      message: `Support has replied to your ticket: "${selectedTicket.subject}"`,
      type: "info",
      action_url: "/dashboard/support",
    })

    const { data } = await supabase.from("ticket_messages")
      .select("*, profiles(first_name,last_name,role)")
      .eq("ticket_id", selectedTicket.id)
      .order("created_at", { ascending: true })
    if (data) setMessages(data)

    setReply("")
    setReplying(false)
    toast.success("Reply sent")
  }

  async function closeTicket() {
    if (!selectedTicket) return
    await supabase.from("support_tickets").update({ status: "resolved" }).eq("id", selectedTicket.id)
    toast.success("Ticket resolved")
    setSelectedTicket(null)
    load()
  }

  return (
    <div className="max-w-6xl">
      <div className="grid lg:grid-cols-[1fr_1.5fr] gap-5 h-[calc(100vh-160px)]">

        {/* Ticket list */}
        <div className="flex flex-col gap-3">
          {/* Filter */}
          <div className="flex gap-1.5 flex-wrap">
            {["open", "in_progress", "resolved", "all"].map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all border",
                  filter === f ? "bg-brand-blue border-brand-blue text-white" : "border-navy-border text-white/50 hover:text-white"
                )}>
                {f.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 text-brand-blue animate-spin" />
              </div>
            ) : tickets.length === 0 ? (
              <div className="py-12 text-center">
                <MessageCircle className="w-8 h-8 text-white/10 mx-auto mb-2" />
                <p className="text-white/30 text-sm">No tickets</p>
              </div>
            ) : (
              tickets.map((ticket) => (
                <motion.button
                  key={ticket.id}
                  onClick={() => openTicket(ticket)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border transition-all",
                    selectedTicket?.id === ticket.id
                      ? "border-brand-blue bg-brand-blue/10"
                      : "border-navy-border bg-navy-card hover:border-white/10"
                  )}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-white text-sm font-medium leading-tight flex-1">{ticket.subject}</p>
                    <span className={cn("text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium capitalize", PRIORITY_COLOR[ticket.priority])}>
                      {ticket.priority}
                    </span>
                  </div>
                  <p className="text-white/40 text-xs mb-2">{ticket.profiles?.first_name} {ticket.profiles?.last_name} · {ticket.ticket_number}</p>
                  <div className="flex items-center justify-between">
                    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium capitalize", STATUS_COLOR[ticket.status])}>
                      {ticket.status.replace("_", " ")}
                    </span>
                    <span className="text-white/20 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />{formatDate(ticket.created_at)}
                    </span>
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </div>

        {/* Ticket conversation */}
        {selectedTicket ? (
          <div className="bg-navy-card border border-navy-border rounded-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between p-4 border-b border-navy-border">
              <div>
                <p className="text-white font-semibold text-sm">{selectedTicket.subject}</p>
                <p className="text-white/40 text-xs mt-0.5">
                  {selectedTicket.profiles?.email} · {selectedTicket.ticket_number}
                </p>
              </div>
              <Button onClick={closeTicket} variant="outline"
                className="h-8 px-3 border-brand-emerald/30 text-brand-emerald hover:bg-brand-emerald/10 text-xs rounded-lg">
                Resolve
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => {
                const isAdmin = msg.profiles?.role === "admin" || msg.profiles?.role === "super_admin"
                return (
                  <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                    <div className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                      isAdmin
                        ? "bg-brand-blue/20 border border-brand-blue/20 text-white rounded-br-sm"
                        : "bg-navy/60 border border-navy-border text-white/80 rounded-bl-sm"
                    )}>
                      <p className={cn("text-xs font-medium mb-1", isAdmin ? "text-brand-blue" : "text-white/40")}>
                        {isAdmin ? "Support Team" : `${msg.profiles?.first_name} ${msg.profiles?.last_name}`}
                      </p>
                      {msg.message}
                      <p className="text-white/20 text-xs mt-1">{formatDate(msg.created_at)}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Reply input */}
            <div className="p-4 border-t border-navy-border flex gap-2">
              <textarea
                value={reply}
                onChange={(e: any) => setReply(e.target.value)}
                placeholder="Type your reply..."
                rows={2}
                onKeyDown={(e: any) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply() } }}
                className="flex-1 bg-navy/60 border border-navy-border rounded-xl p-3 text-white text-sm placeholder:text-white/20 focus:border-brand-blue outline-none resize-none"
              />
              <Button onClick={sendReply} disabled={replying || !reply.trim()}
                className="self-end h-10 w-10 p-0 bg-brand-blue hover:bg-blue-600 text-white rounded-xl">
                {replying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-navy-card border border-navy-border rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-10 h-10 text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">Select a ticket to view conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}