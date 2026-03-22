import { Hexagon } from "lucide-react"
import Link from "next/link"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-navy flex flex-col lg:flex-row">

      {/* Left — Brand Panel (desktop only) */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-navy via-navy-card to-[#0a1628]">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-blue/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 right-0 w-[300px] h-[300px] bg-brand-emerald/8 rounded-full blur-[80px]" />

        <Link href="/" className="relative flex items-center gap-2.5 z-10">
          <div className="w-9 h-9 bg-gradient-to-br from-brand-blue to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Hexagon className="w-5 h-5 text-white fill-white/20" />
          </div>
          <span className="font-display font-bold text-xl text-white tracking-tight">
            Nex<span className="text-brand-blue">Vault</span>
          </span>
        </Link>

        <div className="relative z-10">
          <h2 className="font-display text-4xl font-bold text-white leading-tight mb-6">
            Your complete<br />
            <span className="bg-gradient-to-r from-brand-blue to-brand-emerald bg-clip-text text-transparent">
              financial universe.
            </span>
          </h2>
          <p className="text-white/50 text-base leading-relaxed max-w-sm mb-10">
            Banking, investments, transfers, and analytics — all in one secure,
            elegant platform built for the modern world.
          </p>
          <div className="flex flex-col gap-3">
            {[
              { emoji: "🔒", text: "256-bit bank-grade encryption" },
              { emoji: "📈", text: "Investment returns up to 18.5%" },
              { emoji: "⚡", text: "Instant global transfers" },
              { emoji: "🌍", text: "50+ currencies supported" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3 text-white/60 text-sm">
                <span className="text-base">{item.emoji}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="flex -space-x-2">
            {["from-blue-500 to-cyan-500", "from-emerald-500 to-teal-500", "from-purple-500 to-pink-500", "from-orange-500 to-yellow-500"].map((g, i) => (
              <div key={i} className={`w-8 h-8 rounded-full bg-gradient-to-br ${g} border-2 border-navy flex items-center justify-center text-white text-xs font-bold`}>
                {["S", "D", "P", "M"][i]}
              </div>
            ))}
          </div>
          <p className="text-white/40 text-sm">
            Joined by <span className="text-white/70 font-medium">50,000+</span> users
          </p>
        </div>
      </div>

      {/* Right — Form Panel */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-4 py-4 border-b border-navy-border bg-navy-card/50">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-blue to-blue-600 rounded-lg flex items-center justify-center">
              <Hexagon className="w-4 h-4 text-white fill-white/20" />
            </div>
            <span className="font-display font-bold text-lg text-white">
              Nex<span className="text-brand-blue">Vault</span>
            </span>
          </Link>
          <Link href="/" className="text-white/40 text-xs hover:text-white transition-colors">
            ← Back to site
          </Link>
        </div>

        {/* Form content */}
        <div className="flex-1 flex items-start lg:items-center justify-center p-4 sm:p-6 lg:p-10 overflow-y-auto">
          <div className="w-full max-w-md py-4 lg:py-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}