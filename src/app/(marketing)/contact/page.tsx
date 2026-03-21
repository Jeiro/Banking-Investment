"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Mail, MessageCircle, Phone, MapPin,
  Send, Loader2, CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

const CHANNELS = [
  { icon: Mail, label: "Email Us", value: "support@nexvault.io", color: "text-brand-blue" },
  { icon: MessageCircle, label: "Live Chat", value: "Available Mon–Fri, 9am–6pm EST", color: "text-brand-emerald" },
  { icon: Phone, label: "Phone", value: "+1 (800) NEX-VAULT", color: "text-purple-400" },
  { icon: MapPin, label: "Office", value: "350 Fifth Ave, New York, NY 10118", color: "text-brand-gold" },
]

export default function ContactPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !email || !message) { toast.error("Please fill in all required fields"); return }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    setSent(true)
    setLoading(false)
    toast.success("Message sent! We'll respond within 24 hours.")
  }

  return (
    <div className="pt-32 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-blue/6 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full border border-brand-blue/30 bg-brand-blue/10 text-brand-blue text-sm font-medium mb-4">
            Get in Touch
          </span>
          <h1 className="font-display text-5xl font-bold text-white mb-4">
            We&apos;d love to hear
            <br />
            <span className="text-white/40">from you.</span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Have a question, concern, or just want to say hello? Our team is here to help.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">

          {/* Left — contact channels */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            <h2 className="font-display font-bold text-white text-xl mb-6">Contact channels</h2>
            {CHANNELS.map(({ icon: Icon, label, value, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                className="flex items-start gap-4 p-5 bg-navy-card border border-navy-border rounded-2xl"
              >
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{label}</p>
                  <p className="text-white/50 text-sm mt-0.5">{value}</p>
                </div>
              </motion.div>
            ))}

            {/* Response time note */}
            <div className="flex items-center gap-3 p-4 bg-brand-emerald/5 border border-brand-emerald/20 rounded-2xl">
              <div className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
              <p className="text-brand-emerald text-sm">Average response time: <span className="font-semibold">under 4 hours</span></p>
            </div>
          </motion.div>

          {/* Right — contact form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {sent ? (
              <div className="bg-navy-card border border-brand-emerald/20 rounded-2xl p-10 text-center h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-brand-emerald/10 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="w-8 h-8 text-brand-emerald" />
                </div>
                <h3 className="font-display font-bold text-white text-xl mb-2">Message Sent!</h3>
                <p className="text-white/50 text-sm">
                  Thanks for reaching out. We&apos;ll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => { setSent(false); setName(""); setEmail(""); setSubject(""); setMessage("") }}
                  className="mt-6 text-brand-blue text-sm hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-navy-card border border-navy-border rounded-2xl p-7 space-y-5">
                <h2 className="font-display font-bold text-white text-xl">Send a message</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-white/70 text-sm">Full Name *</Label>
                    <Input placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)}
                      className="h-11 bg-navy/60 border-navy-border text-white placeholder:text-white/20 rounded-xl focus:border-brand-blue" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-white/70 text-sm">Email *</Label>
                    <Input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="h-11 bg-navy/60 border-navy-border text-white placeholder:text-white/20 rounded-xl focus:border-brand-blue" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-sm">Subject</Label>
                  <Input placeholder="What's this about?" value={subject} onChange={(e) => setSubject(e.target.value)}
                    className="h-11 bg-navy/60 border-navy-border text-white placeholder:text-white/20 rounded-xl focus:border-brand-blue" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-white/70 text-sm">Message *</Label>
                  <textarea
                    placeholder="Tell us how we can help..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    className="w-full bg-navy/60 border border-navy-border rounded-xl p-3 text-white text-sm placeholder:text-white/20 focus:border-brand-blue outline-none resize-none"
                  />
                </div>
                <Button type="submit" disabled={loading}
                  className="w-full h-12 bg-brand-blue hover:bg-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-2" />Send Message</>}
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}