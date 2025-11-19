'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Edit, Trash, TrendingDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface Loan {
  id: string
  name: string
  type: string
  original_amount: number
  current_balance: number
  interest_rate: number
  payment_amount: number
  payment_frequency: string
  next_payment_date: string | null
  lender: string | null
  status: string
  color: string
}

export function LoansList({ loans }: { loans: Loan[] }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getLoanTypeLabel = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'paid_off': return 'secondary'
      case 'defaulted': return 'destructive'
      default: return 'default'
    }
  }

  if (loans.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <TrendingDown className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">No loans yet</p>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Add a loan to track payments and monitor your debt payoff progress
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {loans.map((loan) => {
        const paidOff = loan.original_amount - loan.current_balance
        const progressPercentage = (paidOff / loan.original_amount) * 100

        return (
          <Link href={`/dashboard/loans/${loan.id}`} key={loan.id}>
            <Card className="relative overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
              <div
                className="absolute top-0 left-0 right-0 h-2"
                style={{ backgroundColor: loan.color }}
              />
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    {loan.name}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {getLoanTypeLabel(loan.type)}
                    </Badge>
                    <Badge variant={getStatusColor(loan.status)}>
                      {loan.status.replace('_', ' ')}
                    </Badge>
                  </div>
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
                    <p className="text-sm text-muted-foreground">Remaining</p>
                    <p className="text-xl font-bold text-red-600">
                      {formatCurrency(loan.current_balance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Paid Off</p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(paidOff)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      {progressPercentage.toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={progressPercentage}
                    className="h-2"
                    indicatorClassName="bg-green-600"
                  />
                  <p className="text-xs text-muted-foreground">
                    Original amount: {formatCurrency(loan.original_amount)}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t text-sm">
                  <div>
                    <p className="text-muted-foreground">Payment</p>
                    <p className="font-medium">{formatCurrency(loan.payment_amount)}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {loan.payment_frequency}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Interest Rate</p>
                    <p className="font-medium">{loan.interest_rate.toFixed(2)}%</p>
                    {loan.lender && (
                      <p className="text-xs text-muted-foreground">{loan.lender}</p>
                    )}
                  </div>
                </div>

                {loan.next_payment_date && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">
                      Next payment: {new Date(loan.next_payment_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
