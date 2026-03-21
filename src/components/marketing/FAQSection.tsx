"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus } from "lucide-react"

const faqs = [
  {
    q: "Is NexVault safe for large amounts of money?",
    a: "Absolutely. NexVault uses 256-bit AES encryption, is SOC 2 Type II certified, and all USD deposits are FDIC insured up to $250,000. We also employ real-time AI fraud detection on every transaction.",
  },
  {
    q: "How quickly can I withdraw my funds?",
    a: "Standard withdrawals process within 1-2 business days. Premium account holders enjoy same-day processing. Crypto withdrawals settle within 30-60 minutes depending on network congestion.",
  },
  {
    q: "What documents do I need to get verified (KYC)?",
    a: "You'll need a government-issued photo ID (passport, driver's license, or national ID) and a proof of address document dated within 90 days (utility bill or bank statement). Most verifications complete within 24 hours.",
  },
  {
    q: "Are there fees for transfers or deposits?",
    a: "Deposits are always free. Internal transfers between NexVault users are instant and free. External bank transfers carry a small 1.5% fee with a $2 minimum. International wires are $15 flat.",
  },
  {
    q: "Can I use NexVault for my business?",
    a: "Yes! NexVault offers both personal and business accounts. Business accounts include multi-user access, invoice management, bulk payment tools, and dedicated account management.",
  },
  {
    q: "What investment returns can I realistically expect?",
    a: "Our Starter Growth plan offers 3.5% over 30 days. Our Premium Reserve plan for larger investors offers up to 18.5% annually. All plans carry risk disclosures and past performance is not a guarantee of future returns.",
  },
]

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="py-28 bg-navy-card/20 border-y border-navy-border">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full border border-brand-blue/30 bg-brand-blue/10 text-brand-blue text-sm font-medium mb-4">
            FAQ
          </span>
          <h2 className="font-display text-4xl font-bold text-white">
            Common questions,
            <br />
            <span className="text-white/40">clear answers.</span>
          </h2>
        </motion.div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className={`rounded-2xl border transition-colors ${
                open === i ? "border-brand-blue/30 bg-brand-blue/5" : "border-navy-border bg-navy-card"
              }`}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <span className="font-display font-semibold text-white text-sm pr-4">{faq.q}</span>
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                  open === i ? "bg-brand-blue text-white" : "bg-navy-border text-white/40"
                }`}>
                  {open === i ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                </div>
              </button>

              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-6 text-white/60 text-sm leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}