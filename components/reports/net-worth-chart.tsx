'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

export function NetWorthChart({ userId }: { userId: string }) {
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
          const { data: accounts } = await supabase
            .from('accounts')
            .select('balance')
            .eq('user_id', userId)
            .eq('is_active', true)

          const { data: creditCards } = await supabase
            .from('credit_cards')
            .select('current_balance')
            .eq('user_id', userId)
            .eq('is_active', true)

          const { data: loans } = await supabase
            .from('loans')
            .select('current_balance')
            .eq('user_id', userId)
            .eq('status', 'active')

          const assets = accounts?.reduce((sum, acc) => sum + Number(acc.balance), 0) || 0
          const creditDebt = creditCards?.reduce((sum, card) => sum + Number(card.current_balance), 0) || 0
          const loanDebt = loans?.reduce((sum, loan) => sum + Number(loan.current_balance), 0) || 0
          const liabilities = creditDebt + loanDebt

          return {
            month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            assets,
            liabilities,
            netWorth: assets - liabilities,
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
        netWorth: {
          label: 'Net Worth',
          color: 'hsl(var(--chart-1))',
        },
        assets: {
          label: 'Assets',
          color: 'hsl(var(--chart-3))',
        },
        liabilities: {
          label: 'Liabilities',
          color: 'hsl(var(--chart-2))',
        },
      }}
      className="h-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis dataKey="month" className="text-xs" />
          <YAxis className="text-xs" />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="netWorth"
            stroke="var(--color-netWorth)"
            fill="var(--color-netWorth)"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
