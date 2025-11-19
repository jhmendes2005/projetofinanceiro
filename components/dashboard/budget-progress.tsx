'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { Progress } from '@/components/ui/progress'

interface Budget {
  id: string
  name: string
  amount: number
  spent: number
  alert_percentage: number
}

export function BudgetProgress({ userId }: { userId: string }) {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    async function fetchBudgets() {
      const { data } = await supabase
        .from('budgets')
        .select('id, name, amount, spent, alert_percentage')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('spent', { ascending: false })
        .limit(5)

      if (data) {
        setBudgets(data)
      }
    }

    fetchBudgets()
  }, [userId, supabase])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  if (budgets.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No budgets set yet. Create a budget to track your spending!
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {budgets.map((budget) => {
        const percentage = (budget.spent / budget.amount) * 100
        const isOverBudget = percentage >= 100
        const isNearLimit = percentage >= budget.alert_percentage

        return (
          <div key={budget.id} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{budget.name}</span>
              <span className={isOverBudget ? 'text-red-600 font-semibold' : ''}>
                {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
              </span>
            </div>
            <Progress
              value={Math.min(percentage, 100)}
              className="h-2"
              indicatorClassName={
                isOverBudget
                  ? 'bg-red-600'
                  : isNearLimit
                  ? 'bg-yellow-600'
                  : 'bg-green-600'
              }
            />
            <p className="text-xs text-muted-foreground">
              {percentage.toFixed(1)}% used
              {isOverBudget && ' - Over budget!'}
              {isNearLimit && !isOverBudget && ' - Approaching limit'}
            </p>
          </div>
        )
      })}
    </div>
  )
}
