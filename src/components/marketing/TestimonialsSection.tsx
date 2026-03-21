"use client"

import { motion } from "framer-motion"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Mitchell",
    role: "Freelance Designer",
    avatar: "SM",
    avatarBg: "from-purple-500 to-pink-500",
    rating: 5,
    text: "NexVault completely changed how I manage my income. The investment plans are incredible — I've earned more in 3 months here than a year with my old bank.",
  },
  {
    name: "David Okafor",
    role: "Software Engineer",
    avatar: "DO",
    avatarBg: "from-blue-500 to-cyan-500",
    rating: 5,
    text: "As someone who values security above everything, NexVault ticks every box. The 2FA setup took 30 seconds and I love the real-time transaction alerts.",
  },
  {
    name: "Priya Sharma",
    role: "E-commerce Founder",
    avatar: "PS",
    avatarBg: "from-emerald-500 to-teal-500",
    rating: 5,
    text: "Running a business means I need fast international transfers. NexVault delivers every time. The multi-currency feature alone saves me hundreds monthly.",
  },
  {
    name: "Marcus Johnson",
    role: "Investment Analyst",
    avatar: "MJ",
    avatarBg: "from-orange-500 to-yellow-500",
    rating: 5,
    text: "The analytics dashboard is genuinely impressive. I can see exactly where my money is and where it's going. It's like having a financial advisor built in.",
  },
  {
    name: "Aisha Benali",
    role: "Medical Professional",
    avatar: "AB",
    avatarBg: "from-red-500 to-rose-500",
    rating: 5,
    text: "I was nervous switching from my traditional bank, but the onboarding was seamless. Support is responsive, the app is beautiful, and my savings are growing.",
  },
  {
    name: "Tom Bergkamp",
    role: "Real Estate Agent",
    avatar: "TB",
    avatarBg: "from-indigo-500 to-purple-500",
    rating: 5,
    text: "Handling large transactions daily means I need absolute reliability. NexVault has never let me down — every wire transfer, on time, every time.",
  },
]

export default function TestimonialsSection() {
  return (
    <section className="py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-block px-4 py-1.5 rounded-full border border-brand-gold/30 bg-brand-gold/10 text-brand-gold text-sm font-medium mb-4">
            Loved by users
          </span>
          <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mb-4">
            Real people.
            <span className="text-white/40"> Real results.</span>
          </h2>
        </motion.div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="p-6 rounded-2xl bg-navy-card border border-navy-border hover:border-white/10 transition-colors"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-brand-gold fill-brand-gold" />
                ))}
              </div>

              <p className="text-white/70 text-sm leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>

              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.avatarBg} flex items-center justify-center text-white text-sm font-bold font-display`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-white/40 text-xs">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}