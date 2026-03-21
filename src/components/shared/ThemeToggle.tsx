"use client"

import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { useEffect, useState } from "react"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="w-10 h-10 rounded-xl" />

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative w-10 h-10 rounded-xl bg-navy-card border border-navy-border flex items-center justify-center text-white/50 hover:text-white hover:border-white/20 transition-all group overflow-hidden shadow-sm"
      aria-label="Toggle theme"
    >
      <div className="relative z-10">
        {theme === "dark" ? (
          <Moon className="w-5 h-5 transition-transform group-hover:rotate-12" />
        ) : (
          <Sun className="w-5 h-5 transition-transform group-hover:rotate-45" />
        )}
      </div>
      {/* Subtle hover glow */}
      <div className="absolute inset-0 bg-brand-blue/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  )
}