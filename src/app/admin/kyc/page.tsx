"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, XCircle, Eye, Loader2, ChevronDown, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { formatDate, cn } from "@/lib/utils"
import { toast } from "sonner"

interface KYCEntry {
  id: string
  user_id: string
  document_type: string
  document_url: string
  status: string
  rejection_reason: string | null
  created_at: string
  profiles: {
    first_name: string
    last_name: string
    email: string
    kyc_status: string
  } | null
}

export default function AdminKYCPage() {
  const supabase = createClient()
  const [docs, setDocs] = useState<KYCEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("pending")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [rejectModal, setRejectModal] = useState<{ id: string; userId: string } | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  const loadDocs = useCallback(async () => {
    setLoading(true)
    let query = supabase
      .from("kyc_documents")
      .select("*, profiles(first_name, last_name, email, kyc_status)")
      .order("created_at", { ascending: false })
    if (filter !== "all") query = query.eq("status", filter)
    const { data } = await query
    if (data) setDocs(data as KYCEntry[])
    setLoading(false)
  }, [filter])

  useEffect(() => { loadDocs() }, [loadDocs])

  async function handleApprove(doc: KYCEntry) {
    setActionLoading(doc.id)
    const { data: { user: admin } } = await supabase.auth.getUser()

    await supabase.from("kyc_documents").update({
      status: "approved",
      reviewed_by: admin?.id,
      reviewed_at: new Date().toISOString(),
    }).eq("id", doc.id)

    await supabase.from("profiles").update({ kyc_status: "verified" }).eq("id", doc.user_id)

    await supabase.from("notifications").insert({
      user_id: doc.user_id,
      title: "KYC Verified ✅",
      message: "Your identity has been verified. You now have full access to all NexVault features.",
      type: "kyc",
    })

    await supabase.from("audit_logs").insert({
      actor_id: admin?.id,
      action: "KYC_APPROVED",
      entity_type: "kyc_documents",
      entity_id: doc.id,
    })

    toast.success("KYC approved")
    setActionLoading(null)
    loadDocs()
  }

  async function handleReject() {
    if (!rejectModal || !rejectReason.trim()) { toast.error("Rejection reason required"); return }
    setActionLoading(rejectModal.id)
    const { data: { user: admin } } = await supabase.auth.getUser()

    await supabase.from("kyc_documents").update({
      status: "rejected",
      rejection_reason: rejectReason,
      reviewed_by: admin?.id,
      reviewed_at: new Date().toISOString(),
    }).eq("id", rejectModal.id)

    await supabase.from("profiles").update({ kyc_status: "rejected" }).eq("id", rejectModal.userId)

    await supabase.from("notifications").insert({
      user_id: rejectModal.userId,
      title: "KYC Rejected",
      message: `Your KYC submission was rejected. Reason: ${rejectReason}. Please resubmit with valid documents.`,
      type: "kyc",
    })

    toast.success("KYC rejected")
    setRejectModal(null)
    setRejectReason("")
    setActionLoading(null)
    loadDocs()
  }

  const docTypeLabel = (t: string) => t.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {["all", "pending", "approved", "rejected"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all border",
              filter === f
                ? "bg-brand-blue border-brand-blue text-white"
                : "border-navy-border text-white/50 hover:text-white hover:border-white/20"
            )}>
            {f}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-brand-blue animate-spin" />
        </div>
      ) : docs.length === 0 ? (
        <div className="py-20 text-center">
          <FileText className="w-10 h-10 text-white/10 mx-auto mb-3" />
          <p className="text-white/30">No {filter !== "all" ? filter : ""} KYC submissions</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {docs.map((doc, i) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="bg-navy-card border border-navy-border rounded-2xl overflow-hidden"
            >
              {/* Doc preview placeholder */}
              <div
                className="h-40 bg-navy/60 border-b border-navy-border flex items-center justify-center cursor-pointer group relative"
                onClick={() => setPreviewUrl(doc.document_url)}
              >
                <FileText className="w-10 h-10 text-white/10 group-hover:text-white/30 transition-colors" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              <div className="p-4 space-y-3">
                {/* User */}
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-blue/60 to-brand-emerald/60 flex items-center justify-center text-white text-xs font-bold">
                    {doc.profiles?.first_name?.[0]}{doc.profiles?.last_name?.[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {doc.profiles?.first_name} {doc.profiles?.last_name}
                    </p>
                    <p className="text-white/30 text-xs truncate">{doc.profiles?.email}</p>
                  </div>
                </div>

                {/* Doc info */}
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-xs">{docTypeLabel(doc.document_type)}</span>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium capitalize",
                    doc.status === "approved" ? "text-brand-emerald bg-brand-emerald/10" :
                      doc.status === "pending" ? "text-brand-gold bg-brand-gold/10" :
                        "text-red-400 bg-red-400/10"
                  )}>{doc.status}</span>
                </div>

                <p className="text-white/30 text-xs">{formatDate(doc.created_at)}</p>

                {/* Rejection reason */}
                {doc.rejection_reason && (
                  <p className="text-red-400 text-xs bg-red-400/5 border border-red-400/10 rounded-lg p-2">
                    Rejected: {doc.rejection_reason}
                  </p>
                )}

                {/* Actions */}
                {doc.status === "pending" && (
                  <div className="flex gap-2 pt-1">
                    <Button
                      onClick={() => handleApprove(doc)}
                      disabled={actionLoading === doc.id}
                      className="flex-1 h-9 bg-brand-emerald hover:bg-emerald-600 text-white text-xs rounded-lg"
                    >
                      {actionLoading === doc.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (
                        <><CheckCircle2 className="w-3.5 h-3.5 mr-1" />Approve</>
                      )}
                    </Button>
                    <Button
                      onClick={() => setRejectModal({ id: doc.id, userId: doc.user_id })}
                      disabled={actionLoading === doc.id}
                      variant="outline"
                      className="flex-1 h-9 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 text-xs rounded-lg"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />Reject
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Reject reason modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setRejectModal(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-navy-card border border-navy-border rounded-2xl w-full max-w-sm p-6 shadow-2xl"
          >
            <h3 className="font-display font-bold text-white mb-4">Rejection Reason</h3>
            <textarea
              value={rejectReason}
              onChange={(e: any) => setRejectReason(e.target.value)}
              placeholder="Explain why this document is rejected..."
              rows={3}
              className="w-full bg-navy/60 border border-navy-border rounded-xl p-3 text-white text-sm placeholder:text-white/20 focus:border-red-500 outline-none resize-none mb-4"
            />
            <div className="flex gap-2">
              <Button onClick={() => setRejectModal(null)} variant="outline"
                className="flex-1 border-navy-border text-white/50">Cancel</Button>
              <Button onClick={handleReject} disabled={!rejectReason.trim()}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white">
                Confirm Reject
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}