"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useEffect, useState } from "react"

const stats = [
  { value: 50000, suffix: "+", label: "Active Users", prefix: "" },
  { value: 2.4, suffix: "B+", label: "Assets Managed", prefix: "$" },
  { value: 99.9, suffix: "%", label: "Uptime SLA", prefix: "" },
  { value: 140, suffix: "+", label: "Countries Supported", prefix: "" },
]

function CountUp({ target, prefix, suffix }: { target: number; prefix: string; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const duration = 2000
    const step = target / (duration / 16)
    let current = 0
    const timer = setInterval(() => {
      current += step
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(current)
      }
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target])

  return (
    <span ref={ref}>
      {prefix}
      {target % 1 === 0 ? Math.floor(count).toLocaleString() : count.toFixed(1)}
      {suffix}
    </span>
  )
}

export default function StatsSection() {
  return (
    <section className="py-20 border-y border-navy-border bg-navy-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center"
            >
              <div className="font-display text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent mb-2">
                <CountUp target={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              </div>
              <p className="text-white/40 text-sm font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}