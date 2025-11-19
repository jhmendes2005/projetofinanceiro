'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

export function MonthlyTrends({ userId }: { userId: string }) {
  const [data, setData] = useState<any[]>([])
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    async function fetchData() {
      const last12Months = Array.from({ length: 12 }, (_, i) => {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        return date
      }).reverse()

      const chartData = await Promise.all(
        last12Months.map(async (date) => {
          const startDate = new Date(date.getFullYear(), date.getMonth(), 1)
          const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)

          const { data: transactions } = await supabase
            .from('transactions')
            .select('amount, type')
            .eq('user_id', userId)
            .gte('date', startDate.toISOString().split('T')[0])
            .lte('date', endDate.toISOString().split('T')[0])
            .eq('status', 'completed')

          const income = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) || 0
          const expenses = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) || 0

          return {
            month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            income,
            expenses,
            savings: income - expenses,
          }
        })
      )

      setData(chartData)
    }

    fetchData()
  }, [userId, supabase])

  return (
    <ChartContainer
      config={{
        income: {
          label: 'Income',
          color: 'hsl(var(--chart-1))',
        },
        expenses: {
          label: 'Expenses',
          color: 'hsl(var(--chart-2))',
        },
        savings: {
          label: 'Savings',
          color: 'hsl(var(--chart-3))',
        },
      }}
      className="h-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="month" className="text-xs" />
          <YAxis className="text-xs" />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />
          <Line type="monotone" dataKey="income" stroke="var(--color-income)" strokeWidth={2} />
          <Line type="monotone" dataKey="expenses" stroke="var(--color-expenses)" strokeWidth={2} />
          <Line type="monotone" dataKey="savings" stroke="var(--color-savings)" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
