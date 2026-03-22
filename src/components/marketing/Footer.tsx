import Link from "next/link"
import { Hexagon, Twitter, Linkedin, Github, Instagram } from "lucide-react"
import { APP_NAME } from "@/lib/constants"

const footerLinks = {
  Product: [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Security", href: "/security" },
  ],
  Company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "FAQ", href: "/faq" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
}

const socials = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Instagram, href: "#", label: "Instagram" },
]

export default function Footer() {
  return (
    <footer className="border-t border-navy-border bg-navy-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">

        {/* Top section */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 mb-10 lg:mb-16">

          {/* Brand — full width on mobile */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-blue to-blue-600 rounded-lg flex items-center justify-center">
                <Hexagon className="w-5 h-5 text-white fill-white/20" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                Nex<span className="text-brand-blue">Vault</span>
              </span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs mb-5">
              Modern digital banking and investment platform for the next
              generation of wealth builders.
            </p>
            {/* Socials */}
            <div className="flex gap-2.5">
              {socials.map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} aria-label={label}
                  className="w-9 h-9 rounded-lg border border-navy-border bg-navy-card flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <p className="font-display font-semibold text-white text-sm mb-3 sm:mb-4">{group}</p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href}
                      className="text-white/40 hover:text-white text-sm transition-colors block py-0.5">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 sm:pt-8 border-t border-navy-border">
          <p className="text-white/30 text-xs sm:text-sm text-center sm:text-left">
            © {new Date().getFullYear()} {APP_NAME}, Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-white/30 text-xs sm:text-sm">
            <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  )
}