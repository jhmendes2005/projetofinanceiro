'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

interface Transaction {
  id: string
  description: string
  amount: number
  type: string
  date: string
  category: {
    name: string
  } | null
}

export function RecentTransactions({ userId }: { userId: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    async function fetchTransactions() {
      const { data } = await supabase
        .from('transactions')
        .select('id, description, amount, type, date, category:categories(name)')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(5)

      if (data) {
        setTransactions(data as Transaction[])
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
        No transactions yet. Add your first transaction to get started!
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className={`rounded-full p-2 ${
                transaction.type === 'income'
                  ? 'bg-green-100 text-green-600'
                  : 'bg-red-100 text-red-600'
              }`}
            >
              {transaction.type === 'income' ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
            </div>
            <div>
              <p className="font-medium">{transaction.description}</p>
              <p className="text-sm text-muted-foreground">
                {transaction.category?.name || 'Uncategorized'} •{' '}
                {new Date(transaction.date).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div
            className={`font-semibold ${
              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {transaction.type === 'income' ? '+' : '-'}
            {formatCurrency(transaction.amount)}
          </div>
        </div>
      ))}
    </div>
  )
}
