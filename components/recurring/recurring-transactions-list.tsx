'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Edit, Trash, ArrowUpRight, ArrowDownRight, Calendar, Repeat } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { EditRecurringTransactionDialog } from './edit-recurring-transaction-dialog'
import { DeleteRecurringTransactionDialog } from './delete-recurring-transaction-dialog'

interface RecurringTransaction {
  id: string
  description: string
  amount: number
  type: string
  frequency: string
  start_date: string
  end_date: string | null
  next_occurrence: string
  is_active: boolean
  auto_create: boolean
  category_id: string
  account_id: string
  category: {
    name: string
  } | null
  account: {
    name: string
  } | null
}

export function RecurringTransactionsList({ userId }: { userId: string }) {
  const [transactions, setTransactions] = useState<RecurringTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTransaction, setEditingTransaction] = useState<RecurringTransaction | null>(null)
  const [deletingTransaction, setDeletingTransaction] = useState<RecurringTransaction | null>(null)
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    async function fetchRecurringTransactions() {
      const { data } = await supabase
        .from('recurring_transactions')
        .select('id, description, amount, type, frequency, start_date, end_date, next_occurrence, is_active, auto_create, category_id, account_id, category:categories(name), account:accounts(name)')
        .eq('user_id', userId)
        .order('next_occurrence', { ascending: true })

      if (data) {
        setTransactions(data as RecurringTransaction[])
      }
      setLoading(false)
    }

    fetchRecurringTransactions()
    
    // Subscribe to changes
    const channel = supabase
      .channel('recurring_transactions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'recurring_transactions',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchRecurringTransactions()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, supabase])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getFrequencyLabel = (frequency: string) => {
    return frequency.charAt(0).toUpperCase() + frequency.slice(1)
  }

  if (loading) {
    return <Card className="p-8 text-center text-muted-foreground">Loading recurring transactions...</Card>
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Repeat className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">No recurring transactions yet</p>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Set up recurring transactions to automatically track regular income and expenses
          </p>
        </CardContent>
      </Card>
    )
  }

  const activeTransactions = transactions.filter(t => t.is_active)
  const inactiveTransactions = transactions.filter(t => !t.is_active)

  return (
    <div className="space-y-6">
      {activeTransactions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Active</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {activeTransactions.map((transaction) => (
              <Card key={transaction.id}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="flex items-start gap-3">
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
                      <CardTitle className="text-base">{transaction.description}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {transaction.account?.name || 'No account'}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingTransaction(transaction)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => setDeletingTransaction(transaction)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-2xl font-bold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </span>
                    <Badge variant="outline">
                      {transaction.category?.name || 'Uncategorized'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Repeat className="h-4 w-4" />
                    <span>{getFrequencyLabel(transaction.frequency)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Next: {new Date(transaction.next_occurrence).toLocaleDateString()}</span>
                  </div>

                  {transaction.end_date && (
                    <div className="text-sm text-muted-foreground">
                      Ends: {new Date(transaction.end_date).toLocaleDateString()}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Switch
                      id={`auto-${transaction.id}`}
                      checked={transaction.auto_create}
                      disabled
                    />
                    <Label htmlFor={`auto-${transaction.id}`} className="text-sm">
                      Auto-create transactions
                    </Label>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {inactiveTransactions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Inactive</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {inactiveTransactions.map((transaction) => (
              <Card key={transaction.id} className="opacity-60">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div className="flex items-start gap-3">
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
                      <CardTitle className="text-base">{transaction.description}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {transaction.account?.name || 'No account'}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingTransaction(transaction)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => setDeletingTransaction(transaction)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-2xl font-bold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </span>
                    <Badge variant="outline">
                      {transaction.category?.name || 'Uncategorized'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Repeat className="h-4 w-4" />
                    <span>{getFrequencyLabel(transaction.frequency)}</span>
                  </div>

                  <Badge variant="secondary">Inactive</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <EditRecurringTransactionDialog
        transaction={editingTransaction}
        open={!!editingTransaction}
        onOpenChange={(open) => !open && setEditingTransaction(null)}
      />

      <DeleteRecurringTransactionDialog
        transaction={deletingTransaction}
        open={!!deletingTransaction}
        onOpenChange={(open) => !open && setDeletingTransaction(null)}
      />
    </div>
  )
}
