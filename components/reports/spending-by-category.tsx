'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#14B8A6']

export function SpendingByCategory({ userId, detailed = false }: { userId: string; detailed?: boolean }) {
  const [data, setData] = useState<any[]>([])
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    async function fetchData() {
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 1)

      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, category:categories(name)')
        .eq('user_id', userId)
        .eq('type', 'expense')
        .gte('date', startDate.toISOString().split('T')[0])
        .eq('status', 'completed')

      if (transactions) {
        const categoryTotals = transactions.reduce((acc: any, t: any) => {
          const category = t.category?.name || 'Uncategorized'
          acc[category] = (acc[category] || 0) + Number(t.amount)
          return acc
        }, {})

        const chartData = Object.entries(categoryTotals)
          .map(([name, value]) => ({ name, value }))
          .sort((a: any, b: any) => b.value - a.value)
          .slice(0, 8)

        setData(chartData)
      }
    }

    fetchData()
  }, [userId, supabase])

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No spending data available for the last month
      </div>
    )
  }

  return (
    <ChartContainer
      config={data.reduce((acc, item, index) => ({
        ...acc,
        [item.name]: {
          label: item.name,
          color: COLORS[index % COLORS.length],
        },
      }), {})}
      className={detailed ? 'h-full' : 'h-[300px]'}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={detailed ? 150 : 80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <ChartTooltip content={<ChartTooltipContent />} />
          {detailed && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
