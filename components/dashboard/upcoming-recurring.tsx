'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { CalendarClock, ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface RecurringTransaction {
  id: string
  description: string
  amount: number
  type: string
  next_occurrence: string
  frequency: string
  category: {
    name: string
  } | null
}

export function UpcomingRecurring({ userId }: { userId: string }) {
  const [transactions, setTransactions] = useState<RecurringTransaction[]>([])
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    async function fetchTransactions() {
      const { data } = await supabase
        .from('recurring_transactions')
        .select('id, description, amount, type, next_occurrence, frequency, category:categories(name)')
        .eq('user_id', userId)
        .eq('is_active', true)
        .gte('next_occurrence', new Date().toISOString().split('T')[0])
        .order('next_occurrence', { ascending: true })
        .limit(5)

      if (data) {
        setTransactions(data as RecurringTransaction[])
      }
    }

    fetchTransactions()
  }, [userId, supabase])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No upcoming recurring transactions.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="rounded-full p-2 bg-blue-100 text-blue-600">
              <CalendarClock className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">{transaction.description}</p>
              <p className="text-sm text-muted-foreground">
                {transaction.category?.name || 'Uncategorized'} • Due {new Date(transaction.next_occurrence).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div
              className={`font-semibold ${
                transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {transaction.type === 'income' ? '+' : '-'}
              {formatCurrency(transaction.amount)}
            </div>
            <p className="text-xs text-muted-foreground capitalize">
              {transaction.frequency}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
