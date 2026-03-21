"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import {
  User, Lock, Bell, Shield, Camera,
  Save, Loader2, Eye, EyeOff, CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import type { Profile } from "@/types/database"

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "notifications", label: "Notifications", icon: Bell },
]

export default function SettingsPage() {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [tab, setTab] = useState("profile")
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Profile form
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [phone, setPhone] = useState("")
  const [city, setCity] = useState("")
  const [country, setCountry] = useState("")

  // Security form
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPwd, setShowPwd] = useState(false)
  const [changingPwd, setChangingPwd] = useState(false)

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = useState({
    transactions: true,
    security: true,
    marketing: false,
    kyc: true,
  })

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      if (data) {
        setProfile(data)
        setFirstName(data.first_name || "")
        setLastName(data.last_name || "")
        setPhone(data.phone || "")
        setCity(data.city || "")
        setCountry(data.country || "")
        setAvatarUrl(data.avatar_url)
      }
      setLoading(false)
    }
    load()
  }, [])

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !profile) return
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be under 5MB"); return }

    setUploadingAvatar(true)
    const ext = file.name.split(".").pop()
    const path = `${profile.id}/avatar.${ext}`

    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true })
    if (error) { toast.error("Upload failed"); setUploadingAvatar(false); return }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path)
    await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", profile.id)
    setAvatarUrl(publicUrl)
    setUploadingAvatar(false)
    toast.success("Avatar updated!")
  }

  async function handleSaveProfile() {
    if (!profile) return
    setSaving(true)
    const { error } = await supabase.from("profiles").update({
      first_name: firstName,
      last_name: lastName,
      phone,
      city,
      country,
    }).eq("id", profile.id)

    if (error) { toast.error("Failed to save"); setSaving(false); return }
    toast.success("Profile updated!")
    setSaving(false)
  }

  async function handleChangePassword() {
    if (!newPassword || !confirmPassword) { toast.error("Fill in all fields"); return }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return }
    if (newPassword.length < 8) { toast.error("Password must be at least 8 characters"); return }

    setChangingPwd(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) { toast.error(error.message); setChangingPwd(false); return }

    toast.success("Password updated!")
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("")
    setChangingPwd(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="w-6 h-6 text-brand-blue animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl space-y-5">

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-navy-card border border-navy-border rounded-xl w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              tab === id
                ? "bg-brand-blue text-white shadow-sm"
                : "text-white/50 hover:text-white"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {tab === "profile" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Avatar */}
          <div className="bg-navy-card border border-navy-border rounded-2xl p-5">
            <h3 className="font-display font-semibold text-white text-sm mb-4">Profile Photo</h3>
            <div className="flex items-center gap-5">
              <div className="relative">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-navy-border" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-blue to-brand-emerald flex items-center justify-center text-white text-2xl font-bold font-display">
                    {firstName[0]}{lastName[0]}
                  </div>
                )}
                {uploadingAvatar && (
                  <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  </div>
                )}
              </div>
              <div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-navy-border text-white/70 hover:text-white rounded-xl gap-2 mb-2"
                >
                  <Camera className="w-4 h-4" />
                  Change Photo
                </Button>
                <p className="text-white/30 text-xs">JPG, PNG or WEBP · Max 5MB</p>
              </div>
            </div>
          </div>

          {/* Profile info */}
          <div className="bg-navy-card border border-navy-border rounded-2xl p-5 space-y-4">
            <h3 className="font-display font-semibold text-white text-sm">Personal Information</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: "First Name", value: firstName, setter: setFirstName, placeholder: "John" },
                { label: "Last Name", value: lastName, setter: setLastName, placeholder: "Doe" },
                { label: "Phone Number", value: phone, setter: setPhone, placeholder: "+1 555 000 0000" },
                { label: "City", value: city, setter: setCity, placeholder: "New York" },
              ].map(({ label, value, setter, placeholder }) => (
                <div key={label} className="space-y-1.5">
                  <Label className="text-white/70 text-sm">{label}</Label>
                  <Input
                    placeholder={placeholder}
                    value={value}
                    onChange={(e: any) => setter(e.target.value)}
                    className="h-11 bg-navy/60 border-navy-border text-white placeholder:text-white/20 rounded-xl focus:border-brand-blue"
                  />
                </div>
              ))}
            </div>

            {/* Read-only fields */}
            <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-navy-border">
              {[
                { label: "Email", value: profile?.email || "" },
                { label: "Account Type", value: profile?.account_type || "personal" },
                { label: "KYC Status", value: profile?.kyc_status || "unverified" },
                { label: "Referral Code", value: profile?.referral_code || "" },
              ].map(({ label, value }) => (
                <div key={label} className="space-y-1.5">
                  <Label className="text-white/40 text-sm">{label}</Label>
                  <div className="h-11 bg-navy/30 border border-navy-border/50 rounded-xl px-3 flex items-center">
                    <span className="text-white/40 text-sm capitalize">{value}</span>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full h-11 bg-brand-blue hover:bg-blue-600 text-white font-semibold rounded-xl"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" />Save Changes</>}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Security Tab */}
      {tab === "security" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Change Password */}
          <div className="bg-navy-card border border-navy-border rounded-2xl p-5 space-y-4">
            <h3 className="font-display font-semibold text-white text-sm">Change Password</h3>
            {[
              { label: "New Password", value: newPassword, setter: setNewPassword },
              { label: "Confirm New Password", value: confirmPassword, setter: setConfirmPassword },
            ].map(({ label, value, setter }) => (
              <div key={label} className="space-y-1.5">
                <Label className="text-white/70 text-sm">{label}</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    type={showPwd ? "text" : "password"}
                    placeholder="••••••••"
                    value={value}
                    onChange={(e: any) => setter(e.target.value)}
                    className="pl-10 pr-10 h-11 bg-navy/60 border-navy-border text-white placeholder:text-white/20 rounded-xl focus:border-brand-blue"
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
            <Button
              onClick={handleChangePassword}
              disabled={changingPwd}
              className="w-full h-11 bg-brand-blue hover:bg-blue-600 text-white font-semibold rounded-xl"
            >
              {changingPwd ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Password"}
            </Button>
          </div>

          {/* 2FA info card */}
          <div className="bg-navy-card border border-navy-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-semibold text-white text-sm">Two-Factor Authentication</h3>
                <p className="text-white/40 text-xs mt-0.5">Add an extra layer of security to your account</p>
              </div>
              <span className={cn(
                "text-xs font-medium px-2.5 py-1 rounded-full",
                profile?.two_factor_enabled
                  ? "bg-brand-emerald/10 text-brand-emerald"
                  : "bg-white/5 text-white/30"
              )}>
                {profile?.two_factor_enabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <Button variant="outline" className="border-navy-border text-white/60 hover:text-white rounded-xl">
              <Shield className="w-4 h-4 mr-2" />
              {profile?.two_factor_enabled ? "Manage 2FA" : "Enable 2FA"}
            </Button>
          </div>

          {/* Active sessions placeholder */}
          <div className="bg-navy-card border border-navy-border rounded-2xl p-5">
            <h3 className="font-display font-semibold text-white text-sm mb-4">Active Sessions</h3>
            <div className="flex items-center justify-between p-4 bg-brand-emerald/5 border border-brand-emerald/20 rounded-xl">
              <div>
                <p className="text-white text-sm font-medium">Current Session</p>
                <p className="text-white/40 text-xs mt-0.5">This device · Active now</p>
              </div>
              <span className="flex items-center gap-1.5 text-brand-emerald text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse" />
                Active
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Notifications Tab */}
      {tab === "notifications" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-navy-card border border-navy-border rounded-2xl p-5 space-y-1"
        >
          <h3 className="font-display font-semibold text-white text-sm mb-5">Notification Preferences</h3>
          {[
            { key: "transactions", label: "Transaction Alerts", desc: "Get notified for every deposit, withdrawal, and transfer" },
            { key: "security", label: "Security Alerts", desc: "Login attempts, password changes, and suspicious activity" },
            { key: "kyc", label: "KYC Updates", desc: "Status updates on your identity verification submissions" },
            { key: "marketing", label: "Product Updates", desc: "New features, investment opportunities, and announcements" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-4 border-b border-navy-border last:border-0">
              <div className="flex-1 mr-4">
                <p className="text-white text-sm font-medium">{label}</p>
                <p className="text-white/40 text-xs mt-0.5">{desc}</p>
              </div>
              <button
                onClick={() => setNotifPrefs((p) => ({ ...p, [key]: !p[key as keyof typeof p] }))}
                className={cn(
                  "w-11 h-6 rounded-full transition-all duration-300 relative flex-shrink-0",
                  notifPrefs[key as keyof typeof notifPrefs] ? "bg-brand-blue" : "bg-navy-border"
                )}
              >
                <span className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300",
                  notifPrefs[key as keyof typeof notifPrefs] ? "left-6" : "left-1"
                )} />
              </button>
            </div>
          ))}

          <div className="pt-4">
            <Button
              onClick={() => toast.success("Notification preferences saved!")}
              className="w-full h-11 bg-brand-blue hover:bg-blue-600 text-white font-semibold rounded-xl"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Preferences
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}