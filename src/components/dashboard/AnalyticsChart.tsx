"use client"

import { useState } from "react"
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils"

const generateData = (months = 7) => {
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const now = new Date().getMonth()
  return Array.from({ length: months }, (_, i) => ({
    month: labels[(now - months + 1 + i + 12) % 12],
    balance: Math.floor(80000 + Math.random() * 60000),
    income: Math.floor(8000 + Math.random() * 6000),
    expenses: Math.floor(3000 + Math.random() * 4000),
  }))
}

const PERIODS = ["7D", "1M", "3M", "6M", "1Y"]

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; name: string; color: string }>
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-navy-card border border-navy-border rounded-xl p-3 shadow-xl shadow-black/40">
      <p className="text-white/50 text-xs mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-white text-sm font-semibold">
          {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  )
}

export default function AnalyticsChart() {
  const [period, setPeriod] = useState("6M")
  const [metric, setMetric] = useState<"balance" | "income" | "expenses">("balance")
  const data = generateData(period === "7D" ? 7 : period === "1M" ? 4 : period === "3M" ? 3 : period === "6M" ? 6 : 12)

  const colors = {
    balance: { stroke: "#2563EB", fill: "#2563EB" },
    income: { stroke: "#10B981", fill: "#10B981" },
    expenses: { stroke: "#F59E0B", fill: "#F59E0B" },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-navy-card border border-navy-border rounded-2xl p-5"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="font-display font-semibold text-white">Portfolio Overview</h3>
          <p className="text-white/40 text-xs mt-0.5">
            Balance trend across your accounts
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Metric selector */}
          <div className="flex bg-navy/60 rounded-lg border border-navy-border p-0.5">
            {(["balance", "income", "expenses"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize",
                  metric === m ? "bg-navy-card text-white shadow-sm" : "text-white/40 hover:text-white"
                )}
              >
                {m}
              </button>
            ))}
          </div>
          {/* Period selector */}
          <div className="flex bg-navy/60 rounded-lg border border-navy-border p-0.5">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={cn(
                  "px-2.5 py-1.5 rounded-md text-xs font-medium transition-all",
                  period === p ? "bg-navy-card text-white shadow-sm" : "text-white/40 hover:text-white"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors[metric].fill} stopOpacity={0.15} />
              <stop offset="95%" stopColor={colors[metric].fill} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="month"
            tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.08)" }} />
          <Area
            type="monotone"
            dataKey={metric}
            stroke={colors[metric].stroke}
            strokeWidth={2}
            fill="url(#chartGrad)"
            dot={false}
            activeDot={{ r: 4, fill: colors[metric].stroke, stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}