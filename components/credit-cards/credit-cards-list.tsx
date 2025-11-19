'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Edit, Trash, CreditCard } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

interface CreditCardType {
  id: string
  name: string
  last_four: string
  issuer: string | null
  credit_limit: number
  current_balance: number
  available_credit: number
  apr: number | null
  payment_due_date: number | null
  color: string
  is_active: boolean
}

export function CreditCardsList({ cards }: { cards: CreditCardType[] }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  if (cards.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">No credit cards yet</p>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Add your first credit card to track spending and monitor utilization
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {cards.map((card) => {
        const utilization = (card.current_balance / card.credit_limit) * 100
        const isHighUtilization = utilization > 30

        return (
          <Card key={card.id} className="relative overflow-hidden">
            <div
              className="absolute top-0 left-0 right-0 h-2"
              style={{ backgroundColor: card.color }}
            />
            <CardHeader className="flex flex-row items-start justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  {card.name}
                  {!card.is_active && (
                    <Badge variant="outline" className="text-xs">
                      Inactive
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {card.issuer ? `${card.issuer} ` : ''}••••{' '}{card.last_four}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Balance</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(card.current_balance)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(card.available_credit)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Utilization</span>
                  <span className={isHighUtilization ? 'text-red-600 font-semibold' : ''}>
                    {utilization.toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={Math.min(utilization, 100)}
                  className="h-2"
                  indicatorClassName={isHighUtilization ? 'bg-red-600' : 'bg-green-600'}
                />
                <p className="text-xs text-muted-foreground">
                  Limit: {formatCurrency(card.credit_limit)}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t text-sm">
                {card.apr && (
                  <div>
                    <span className="text-muted-foreground">APR: </span>
                    <span className="font-medium">{card.apr.toFixed(2)}%</span>
                  </div>
                )}
                {card.payment_due_date && (
                  <div>
                    <span className="text-muted-foreground">Due: </span>
                    <span className="font-medium">Day {card.payment_due_date}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
