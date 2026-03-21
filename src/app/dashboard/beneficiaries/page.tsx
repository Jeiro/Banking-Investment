"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus, Trash2, User, Building2,
  Loader2, CheckCircle2, X, Search,
  Phone, Mail,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import type { Beneficiary } from "@/types/database"

const AVATAR_GRADIENTS = [
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-purple-500 to-pink-500",
  "from-orange-500 to-yellow-500",
  "from-red-500 to-rose-500",
  "from-indigo-500 to-purple-500",
]

export default function BeneficiariesPage() {
  const supabase = createClient()
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const [form, setForm] = useState({
    nickname: "",
    full_name: "",
    bank_name: "",
    account_number: "",
    routing_number: "",
    email: "",
    phone: "",
  })
  const [errors, setErrors] = useState<Partial<typeof form>>({})

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data } = await supabase
        .from("beneficiaries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
      if (data) setBeneficiaries(data)
      setLoading(false)
    }
    load()
  }, [])

  const set = (key: keyof typeof form, value: string) => {
    setForm((p) => ({ ...p, [key]: value }))
    setErrors((p) => ({ ...p, [key]: undefined }))
  }

  function validate() {
    const e: Partial<typeof form> = {}
    if (!form.nickname.trim()) e.nickname = "Nickname required"
    if (!form.full_name.trim()) e.full_name = "Full name required"
    if (!form.account_number.trim()) e.account_number = "Account number required"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave() {
    if (!validate() || !userId) return
    setSaving(true)

    const { data, error } = await supabase.from("beneficiaries").insert({
      user_id: userId,
      nickname: form.nickname,
      full_name: form.full_name,
      bank_name: form.bank_name || null,
      account_number: form.account_number,
      routing_number: form.routing_number || null,
      email: form.email || null,
      phone: form.phone || null,
    }).select().single()

    if (error) { toast.error("Failed to add beneficiary"); setSaving(false); return }

    setBeneficiaries((p) => [data, ...p])
    setForm({ nickname: "", full_name: "", bank_name: "", account_number: "", routing_number: "", email: "", phone: "" })
    setShowForm(false)
    setSaving(false)
    toast.success("Beneficiary added!")
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from("beneficiaries").delete().eq("id", id)
    if (error) { toast.error("Failed to delete"); return }
    setBeneficiaries((p) => p.filter((b) => b.id !== id))
    setDeleteId(null)
    toast.success("Beneficiary removed")
  }

  const filtered = beneficiaries.filter((b) =>
    !search ||
    b.nickname.toLowerCase().includes(search.toLowerCase()) ||
    b.full_name.toLowerCase().includes(search.toLowerCase()) ||
    b.bank_name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-3xl space-y-5">

      {/* Header actions */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            placeholder="Search beneficiaries..."
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
            className="pl-9 h-10 bg-navy-card border-navy-border text-white placeholder:text-white/20 rounded-xl focus:border-brand-blue"
          />
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="h-10 bg-brand-blue hover:bg-blue-600 text-white rounded-xl gap-2"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancel" : "Add Beneficiary"}
        </Button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-navy-card border border-brand-blue/20 rounded-2xl p-5 space-y-4">
              <h3 className="font-display font-semibold text-white text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-blue" />
                New Beneficiary
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { key: "nickname", label: "Nickname *", placeholder: "e.g. Mom, John Rent" },
                  { key: "full_name", label: "Full Legal Name *", placeholder: "As on bank account" },
                  { key: "bank_name", label: "Bank Name", placeholder: "e.g. Chase Bank" },
                  { key: "account_number", label: "Account Number *", placeholder: "Bank account number" },
                  { key: "routing_number", label: "Routing Number", placeholder: "9-digit routing number" },
                  { key: "email", label: "Email (optional)", placeholder: "recipient@email.com" },
                  { key: "phone", label: "Phone (optional)", placeholder: "+1 555 000 0000" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key} className="space-y-1.5">
                    <Label className="text-white/70 text-sm">{label}</Label>
                    <Input
                      placeholder={placeholder}
                      value={form[key as keyof typeof form]}
                      onChange={(e: any) => set(key as keyof typeof form, e.target.value)}
                      className={cn(
                        "h-11 bg-navy/60 border-navy-border text-white placeholder:text-white/20 rounded-xl focus:border-brand-blue",
                        errors[key as keyof typeof errors] && "border-destructive"
                      )}
                    />
                    {errors[key as keyof typeof errors] && (
                      <p className="text-destructive text-xs">{errors[key as keyof typeof errors]}</p>
                    )}
                  </div>
                ))}
              </div>

              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full h-11 bg-brand-blue hover:bg-blue-600 text-white font-semibold rounded-xl"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle2 className="w-4 h-4 mr-2" />Save Beneficiary</>}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Beneficiaries list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 text-brand-blue animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center bg-navy-card border border-navy-border rounded-2xl">
          <User className="w-10 h-10 text-white/10 mx-auto mb-3" />
          <p className="text-white/30 text-sm">
            {beneficiaries.length === 0
              ? "No beneficiaries yet. Add one to start making transfers."
              : "No results match your search."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
              className="flex items-center gap-4 p-5 bg-navy-card border border-navy-border rounded-2xl hover:border-white/10 transition-colors group"
            >
              {/* Avatar */}
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]} flex items-center justify-center text-white font-bold font-display text-sm flex-shrink-0`}>
                {b.full_name[0]}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">{b.nickname}</p>
                <p className="text-white/50 text-xs">{b.full_name}</p>
                <div className="flex flex-wrap gap-3 mt-1.5">
                  {b.bank_name && (
                    <span className="flex items-center gap-1.5 text-white/30 text-xs">
                      <Building2 className="w-3 h-3" />
                      {b.bank_name}
                    </span>
                  )}
                  <span className="text-white/30 text-xs font-mono">
                    •••• {b.account_number.slice(-4)}
                  </span>
                  {b.email && (
                    <span className="hidden sm:flex items-center gap-1.5 text-white/30 text-xs">
                      <Mail className="w-3 h-3" />
                      {b.email}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {deleteId === b.id ? (
                  <div className="flex items-center gap-2">
                    <span className="text-white/50 text-xs">Remove?</span>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="text-xs px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => setDeleteId(null)}
                      className="text-xs px-3 py-1.5 border border-navy-border text-white/50 hover:text-white rounded-lg transition-colors"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteId(b.id)}
                    className="w-8 h-8 rounded-lg border border-navy-border bg-navy/60 flex items-center justify-center text-white/30 hover:text-red-400 hover:border-red-500/30 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}