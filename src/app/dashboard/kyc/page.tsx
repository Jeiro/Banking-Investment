"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShieldCheck, Upload, CheckCircle2, Clock,
  XCircle, FileText, Loader2, AlertTriangle,
  Camera, CreditCard, FileCheck, X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { formatDate, cn } from "@/lib/utils"
import type { KycDocument } from "@/types/database"

const DOC_TYPES = [
  {
    id: "passport",
    label: "Passport",
    icon: FileCheck,
    desc: "Main bio-data page clearly visible",
  },
  {
    id: "drivers_license",
    label: "Driver's License",
    icon: CreditCard,
    desc: "Front and back of your license",
  },
  {
    id: "national_id",
    label: "National ID",
    icon: CreditCard,
    desc: "Government-issued national ID card",
  },
  {
    id: "utility_bill",
    label: "Utility Bill",
    icon: FileText,
    desc: "Proof of address, dated within 90 days",
  },
  {
    id: "selfie",
    label: "Selfie with ID",
    icon: Camera,
    desc: "Hold your ID next to your face clearly",
  },
]

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: "text-brand-gold",
    bg: "bg-brand-gold/10",
    border: "border-brand-gold/20",
    label: "Under Review",
  },
  approved: {
    icon: CheckCircle2,
    color: "text-brand-emerald",
    bg: "bg-brand-emerald/10",
    border: "border-brand-emerald/20",
    label: "Approved",
  },
  rejected: {
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/20",
    label: "Rejected",
  },
}

export default function KYCPage() {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [docs, setDocs] = useState<KycDocument[]>([])
  const [kycStatus, setKycStatus] = useState<string>("unverified")
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const [{ data: docsData }, { data: profile }] = await Promise.all([
        supabase.from("kyc_documents").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        supabase.from("profiles").select("kyc_status").eq("id", user.id).single(),
      ])

      if (docsData) setDocs(docsData)
      if (profile) setKycStatus(profile.kyc_status)
    }
    load()
  }, [])

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return

    if (f.size > 10 * 1024 * 1024) {
      toast.error("File must be under 10MB")
      return
    }
    if (!["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(f.type)) {
      toast.error("Only JPG, PNG, WEBP, or PDF files allowed")
      return
    }

    setFile(f)
    if (f.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onload = (ev) => setPreview(ev.target?.result as string)
      reader.readAsDataURL(f)
    } else {
      setPreview(null)
    }
  }

  async function handleUpload() {
    if (!file || !selectedType || !userId) return
    setUploading(true)

    const ext = file.name.split(".").pop()
    const path = `${userId}/${selectedType}-${Date.now()}.${ext}`

    const { error: uploadError } = await supabase.storage
      .from("kyc-documents")
      .upload(path, file, { upsert: true })

    if (uploadError) {
      toast.error("Upload failed: " + uploadError.message)
      setUploading(false)
      return
    }

    const { data: { publicUrl } } = supabase.storage
      .from("kyc-documents")
      .getPublicUrl(path)

    const { error: dbError } = await supabase.from("kyc_documents").insert({
      user_id: userId,
      document_type: selectedType,
      document_url: publicUrl,
      status: "pending",
    })

    if (dbError) {
      toast.error("Failed to save document record")
      setUploading(false)
      return
    }

    // Update kyc_status to pending if unverified
    if (kycStatus === "unverified" || kycStatus === "rejected") {
      await supabase.from("profiles").update({ kyc_status: "pending" }).eq("id", userId)
      setKycStatus("pending")
    }

    await supabase.from("notifications").insert({
      user_id: userId,
      title: "KYC Document Submitted",
      message: `Your ${selectedType.replace("_", " ")} has been submitted for review. We'll notify you within 24 hours.`,
      type: "kyc",
    })

    toast.success("Document uploaded successfully!")

    // Reload docs
    const { data } = await supabase.from("kyc_documents").select("*").eq("user_id", userId).order("created_at", { ascending: false })
    if (data) setDocs(data)

    setFile(null)
    setPreview(null)
    setSelectedType(null)
    setUploading(false)
  }

  const submittedTypes = docs.map((d) => d.document_type)

  return (
    <div className="max-w-3xl space-y-6">

      {/* Status banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex items-center gap-4 p-5 rounded-2xl border",
          kycStatus === "verified" ? "bg-brand-emerald/5 border-brand-emerald/20" :
          kycStatus === "pending" ? "bg-brand-gold/5 border-brand-gold/20" :
          kycStatus === "rejected" ? "bg-red-500/5 border-red-500/20" :
          "bg-brand-blue/5 border-brand-blue/20"
        )}
      >
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0",
          kycStatus === "verified" ? "bg-brand-emerald/20" :
          kycStatus === "pending" ? "bg-brand-gold/20" :
          kycStatus === "rejected" ? "bg-red-500/20" : "bg-brand-blue/20"
        )}>
          <ShieldCheck className={cn(
            "w-6 h-6",
            kycStatus === "verified" ? "text-brand-emerald" :
            kycStatus === "pending" ? "text-brand-gold" :
            kycStatus === "rejected" ? "text-red-400" : "text-brand-blue"
          )} />
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold font-display">
            {kycStatus === "verified" ? "Identity Verified" :
             kycStatus === "pending" ? "Verification In Progress" :
             kycStatus === "rejected" ? "Verification Rejected" :
             "Identity Verification Required"}
          </p>
          <p className="text-white/50 text-sm mt-0.5">
            {kycStatus === "verified" ? "Your identity has been fully verified. You have access to all features." :
             kycStatus === "pending" ? "Your documents are under review. This usually takes under 24 hours." :
             kycStatus === "rejected" ? "Some documents were rejected. Please resubmit valid documents below." :
             "Upload your identity documents to unlock withdrawals and full platform access."}
          </p>
        </div>
        <div className={cn(
          "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
          kycStatus === "verified" ? "bg-brand-emerald/10 text-brand-emerald" :
          kycStatus === "pending" ? "bg-brand-gold/10 text-brand-gold" :
          kycStatus === "rejected" ? "bg-red-500/10 text-red-400" :
          "bg-brand-blue/10 text-brand-blue"
        )}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          {kycStatus.charAt(0).toUpperCase() + kycStatus.slice(1)}
        </div>
      </motion.div>

      {/* Document type selection */}
      {kycStatus !== "verified" && (
        <div className="bg-navy-card border border-navy-border rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="font-display font-semibold text-white">Upload Documents</h3>
            <p className="text-white/40 text-sm mt-0.5">
              Select the document type and upload a clear image or PDF
            </p>
          </div>

          {/* Doc type grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {DOC_TYPES.map(({ id, label, icon: Icon, desc }) => {
              const submitted = submittedTypes.includes(id)
              const submittedDoc = docs.find((d) => d.document_type === id)
              const statusCfg = submittedDoc ? STATUS_CONFIG[submittedDoc.status as keyof typeof STATUS_CONFIG] : null

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => !submitted && setSelectedType(id === selectedType ? null : id)}
                  disabled={submitted}
                  className={cn(
                    "relative p-4 rounded-xl border text-left transition-all",
                    submitted
                      ? `${statusCfg?.border} ${statusCfg?.bg} cursor-default`
                      : selectedType === id
                        ? "border-brand-blue bg-brand-blue/10"
                        : "border-navy-border hover:border-white/20"
                  )}
                >
                  {submitted && statusCfg && (
                    <div className={`absolute top-2 right-2 ${statusCfg.color}`}>
                      <statusCfg.icon className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <Icon className={cn(
                    "w-5 h-5 mb-2",
                    submitted ? statusCfg?.color : selectedType === id ? "text-brand-blue" : "text-white/40"
                  )} />
                  <p className={cn("font-medium text-xs", submitted ? "text-white/60" : "text-white/80")}>{label}</p>
                  <p className="text-white/30 text-xs mt-0.5 leading-tight">{desc}</p>
                  {submitted && statusCfg && (
                    <p className={`text-xs mt-1.5 font-medium ${statusCfg.color}`}>{statusCfg.label}</p>
                  )}
                </button>
              )
            })}
          </div>

          {/* File upload area */}
          <AnimatePresence>
            {selectedType && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-2 space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {!file ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-navy-border hover:border-brand-blue/50 rounded-xl p-8 text-center cursor-pointer transition-colors group"
                    >
                      <Upload className="w-8 h-8 text-white/20 group-hover:text-brand-blue/60 mx-auto mb-3 transition-colors" />
                      <p className="text-white/60 text-sm font-medium mb-1">
                        Click to upload {DOC_TYPES.find((d) => d.id === selectedType)?.label}
                      </p>
                      <p className="text-white/30 text-xs">JPG, PNG, WEBP or PDF · Max 10MB</p>
                    </div>
                  ) : (
                    <div className="border border-navy-border rounded-xl p-4 flex items-center gap-4">
                      {preview ? (
                        <img src={preview} alt="Preview" className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                      ) : (
                        <div className="w-16 h-16 bg-navy/60 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-6 h-6 text-white/40" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{file.name}</p>
                        <p className="text-white/40 text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button
                        onClick={() => { setFile(null); setPreview(null) }}
                        className="text-white/30 hover:text-white transition-colors flex-shrink-0"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => { setSelectedType(null); setFile(null); setPreview(null) }}
                      className="flex-1 h-11 border-navy-border text-white/50 hover:text-white rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleUpload}
                      disabled={!file || uploading}
                      className="flex-1 h-11 bg-brand-blue hover:bg-blue-600 text-white font-semibold rounded-xl disabled:opacity-50"
                    >
                      {uploading ? (
                        <><Loader2 className="w-4 h-4 animate-spin mr-2" />Uploading...</>
                      ) : (
                        <><Upload className="w-4 h-4 mr-2" />Submit Document</>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Submitted docs list */}
      {docs.length > 0 && (
        <div className="bg-navy-card border border-navy-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-navy-border">
            <h3 className="font-display font-semibold text-white">Submission History</h3>
          </div>
          <div className="divide-y divide-navy-border/50">
            {docs.map((doc, i) => {
              const statusCfg = STATUS_CONFIG[doc.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending
              const StatusIcon = statusCfg.icon
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="flex items-center gap-4 px-5 py-4"
                >
                  <div className={`w-9 h-9 rounded-xl ${statusCfg.bg} flex items-center justify-center flex-shrink-0`}>
                    <StatusIcon className={`w-4 h-4 ${statusCfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium capitalize">
                      {doc.document_type.replace(/_/g, " ")}
                    </p>
                    {doc.rejection_reason && (
                      <p className="text-red-400 text-xs mt-0.5">{doc.rejection_reason}</p>
                    )}
                    <p className="text-white/30 text-xs">{formatDate(doc.created_at)}</p>
                  </div>
                  <span className={cn(
                    "text-xs font-medium px-2.5 py-1 rounded-full capitalize",
                    `${statusCfg.bg} ${statusCfg.color}`
                  )}>
                    {statusCfg.label}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {/* Requirements info */}
      <div className="p-5 bg-navy-card/50 border border-navy-border rounded-2xl">
        <h4 className="font-display font-semibold text-white text-sm mb-3">Document Requirements</h4>
        <div className="grid sm:grid-cols-2 gap-2">
          {[
            "Must be government-issued and valid",
            "All four corners must be visible",
            "No blurring or reflections",
            "Must be in colour (not black & white)",
            "File size must be under 10MB",
            "JPG, PNG, WEBP or PDF format only",
          ].map((req) => (
            <div key={req} className="flex items-center gap-2 text-white/50 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald flex-shrink-0" />
              {req}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}