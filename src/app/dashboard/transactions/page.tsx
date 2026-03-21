"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import TransactionTable from "@/components/dashboard/TransactionTable"
import { Skeleton } from "@/components/shared/LoadingSkeleton"
import type { Transaction } from "@/types/database"

export default function TransactionsPage() {
  const supabase = createClient()
  const [transactions, setTransactions] = useState<Partial<Transaction>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
      if (data) setTransactions(data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="space-y-3">
      {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
    </div>
  )

  return (
    <div className="max-w-5xl space-y-6">
      <TransactionTable
        transactions={transactions.length > 0 ? transactions : undefined}
        showFilters={true}
      />
    </div>
  )
}