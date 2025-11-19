'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

export function IncomeVsExpenses({ userId }: { userId: string }) {
  const [data, setData] = useState<any[]>([])
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    async function fetchData() {
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        return date
      }).reverse()

      const chartData = await Promise.all(
        last6Months.map(async (date) => {
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
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            income,
            expenses,
            net: income - expenses,
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
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="month" className="text-xs" />
          <YAxis className="text-xs" />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />
          <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
