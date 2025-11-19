'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

interface ChartData {
  month: string
  income: number
  expenses: number
}

export function OverviewChart({ userId }: { userId: string }) {
  const [data, setData] = useState<ChartData[]>([])
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

          const income =
            transactions?.filter(t => t.type === 'income')
              .reduce((sum, t) => sum + Number(t.amount), 0) || 0

          const expenses =
            transactions?.filter(t => t.type === 'expense')
              .reduce((sum, t) => sum + Number(t.amount), 0) || 0

          return {
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            income,
            expenses,
          }
        })
      )

      setData(chartData)
    }

    fetchData()
  }, [userId, supabase])

  const chartConfig = {
    income: {
      label: 'Income',
      color: 'hsl(var(--chart-1))',
    },
    expenses: {
      label: 'Expenses',
      color: 'hsl(var(--chart-2))',
    },
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="w-full h-[220px] sm:h-[300px] md:h-[380px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ left: -20, right: 10, top: 10, bottom: 10 }}
        >
          <CartesianGrid
            vertical={false}
            strokeDasharray="3 3"
            className="stroke-muted"
          />

          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            tickFormatter={(value) => value.slice(0, 3)}
            className="text-[10px] sm:text-xs"
          />

          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            tickFormatter={(value) => `$${value}`}
            className="text-[10px] sm:text-xs"
          />

          <ChartTooltip
            cursor={{ fill: 'transparent' }}
            content={<ChartTooltipContent indicator="dashed" />}
          />

          <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
