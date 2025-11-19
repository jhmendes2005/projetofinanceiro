'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus } from 'lucide-react'
import { AddLoanPaymentDialog } from './add-loan-payment-dialog'

interface Loan {
  id: string
  name: string
  type: string
  original_amount: number
  current_balance: number
  interest_rate: number
  payment_amount: number
  payment_frequency: string
  start_date: string
  end_date: string | null
  next_payment_date: string | null
  lender: string | null
  status: string
  color: string
}

interface Payment {
  id: string
  amount: number
  principal_amount: number
  interest_amount: number
  payment_date: string
  notes: string | null
}

export function LoanDetails({ loan, payments }: { loan: Loan; payments: Payment[] }) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const paidOff = loan.original_amount - loan.current_balance
  const progressPercentage = (paidOff / loan.original_amount) * 100

  // Calculate projected remaining payments
  const remainingPayments = Math.ceil(loan.current_balance / loan.payment_amount)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(loan.current_balance)}
            </div>
            <Progress
              value={progressPercentage}
              className="h-2 mt-4"
              indicatorClassName="bg-green-600"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {progressPercentage.toFixed(1)}% paid off
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Loan Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Interest Rate</span>
              <span className="font-medium">{loan.interest_rate}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Monthly Payment</span>
              <span className="font-medium">{formatCurrency(loan.payment_amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Est. Remaining</span>
              <span className="font-medium">{remainingPayments} payments</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Next Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loan.next_payment_date
                ? new Date(loan.next_payment_date).toLocaleDateString()
                : 'N/A'}
            </div>
            <div className="mt-4">
              <AddLoanPaymentDialog loanId={loan.id} currentBalance={loan.current_balance}>
                <Button className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Record Payment
                </Button>
              </AddLoanPaymentDialog>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No payments recorded yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Principal</TableHead>
                  <TableHead>Interest</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                    <TableCell className="text-green-600">
                      {formatCurrency(payment.principal_amount)}
                    </TableCell>
                    <TableCell className="text-orange-600">
                      {formatCurrency(payment.interest_amount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {payment.notes || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
