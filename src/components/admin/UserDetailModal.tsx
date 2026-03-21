"use client"

import { motion } from "framer-motion"
import { X, Mail, Phone, MapPin, Calendar, Shield, Briefcase } from "lucide-react"
import { formatDate, cn } from "@/lib/utils"
import type { Profile } from "@/types/database"

interface Props { user: Profile; onClose: () => void }

export default function UserDetailModal({ user, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="relative bg-navy-card border border-navy-border rounded-2xl w-full max-w-lg shadow-2xl shadow-black/60 overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-navy-border">
          <h2 className="font-display font-bold text-white text-lg">User Profile</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Avatar + name */}
        <div className="flex items-center gap-4 p-6 border-b border-navy-border">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-emerald flex items-center justify-center text-white text-xl font-bold font-display">
            {user.first_name?.[0]}{user.last_name?.[0]}
          </div>
          <div>
            <p className="font-display font-bold text-white text-lg">{user.first_name} {user.last_name}</p>
            <p className="text-white/40 text-sm">{user.email}</p>
            <div className="flex gap-2 mt-2">
              <span className={cn("text-xs px-2.5 py-0.5 rounded-full font-medium capitalize",
                user.status === "active" ? "bg-brand-emerald/10 text-brand-emerald" : "bg-red-500/10 text-red-400"
              )}>{user.status}</span>
              <span className={cn("text-xs px-2.5 py-0.5 rounded-full font-medium capitalize",
                user.kyc_status === "verified" ? "bg-brand-emerald/10 text-brand-emerald" :
                user.kyc_status === "pending" ? "bg-brand-gold/10 text-brand-gold" : "bg-white/5 text-white/30"
              )}>{user.kyc_status} KYC</span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { icon: Mail, label: "Email", value: user.email },
            { icon: Phone, label: "Phone", value: user.phone || "—" },
            { icon: MapPin, label: "Location", value: user.city ? `${user.city}, ${user.country}` : "—" },
            { icon: Calendar, label: "Date of Birth", value: user.date_of_birth ? formatDate(user.date_of_birth) : "—" },
            { icon: Briefcase, label: "Employment", value: user.employment_status?.replace("_", " ") || "—" },
            { icon: Shield, label: "Role", value: user.role },
            { icon: Calendar, label: "Joined", value: formatDate(user.created_at) },
            { icon: Mail, label: "2FA", value: user.two_factor_enabled ? "Enabled" : "Disabled" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3 p-3 bg-navy/40 rounded-xl">
              <Icon className="w-4 h-4 text-white/30 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white/30 text-xs">{label}</p>
                <p className="text-white text-sm font-medium capitalize">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}