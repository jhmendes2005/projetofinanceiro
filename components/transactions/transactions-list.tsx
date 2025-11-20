'use client'

import { useEffect, useState } from 'react'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Edit, Trash, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { EditTransactionDialog } from './edit-transaction-dialog'
import { DeleteTransactionDialog } from './delete-transaction-dialog'

interface Transaction {
  id: string
  description: string
  amount: number
  type: string
  date: string
  status: string
  payee: string | null
  account_id: string
  category_id: string | null
  notes: string | null
  category: {
    name: string
  } | null
  account: {
    name: string
  }
}

export function TransactionsList({ userId }: { userId: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null)
  const [deleteTransactionId, setDeleteTransactionId] = useState<string | null>(null)
  const [deleteTransactionDesc, setDeleteTransactionDesc] = useState<string>('')
  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    async function fetchTransactions() {
      const { data } = await supabase
        .from('transactions')
        .select('id, description, amount, type, date, status, payee, account_id, category_id, notes, category:categories(name), account:accounts(name)')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(50)

      if (data) {
        setTransactions(data as Transaction[])
      }
      setLoading(false)
    }

    fetchTransactions()
  }, [userId, supabase])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  if (loading) {
    return <Card className="p-8 text-center text-muted-foreground">Loading transactions...</Card>
  }

  if (transactions.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="text-muted-foreground mb-2">No transactions yet</p>
        <p className="text-sm text-muted-foreground">
          Add your first transaction to start tracking your finances
        </p>
      </Card>
    )
  }

  return (
    <>
      <Card className="overflow-hidden"> {/* overflow-hidden no Card */}
        {/* Wrapper para scroll horizontal em telas muito pequenas se necessário */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Type</TableHead>
                <TableHead>Description</TableHead>
                {/* Oculta em telas menores que MD (tablets verticais) */}
                <TableHead className="hidden md:table-cell">Category</TableHead>
                {/* Oculta em telas menores que LG (laptops) */}
                <TableHead className="hidden lg:table-cell">Account</TableHead>
                {/* Oculta Data em MD, pois vamos mostrá-la junto da descrição no mobile */}
                <TableHead className="hidden md:table-cell">Date</TableHead>
                {/* Oculta Status em SM (mobile) */}
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div
                      className={`rounded-full p-2 w-fit ${
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
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium truncate max-w-[150px] sm:max-w-none">
                        {transaction.description}
                      </span>
                      
                      {/* Mobile Only: Mostra a data e Payee aqui embaixo em telas pequenas */}
                      <div className="flex flex-col gap-0.5 md:hidden">
                        <span className="text-xs text-muted-foreground">
                           {new Date(transaction.date).toLocaleDateString()}
                        </span>
                        {transaction.payee && (
                            <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                                {transaction.payee}
                            </span>
                        )}
                      </div>

                      {/* Desktop Only: Payee aparece normal */}
                      {transaction.payee && (
                        <span className="text-sm text-muted-foreground hidden md:block">
                          {transaction.payee}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  
                  {/* Category: some no mobile */}
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline">
                      {transaction.category?.name || 'Uncategorized'}
                    </Badge>
                  </TableCell>

                  {/* Account: some no mobile/tablet */}
                  <TableCell className="hidden lg:table-cell">
                    {transaction.account.name}
                  </TableCell>

                  {/* Date: Coluna some no mobile (aparece na descrição) */}
                  <TableCell className="hidden md:table-cell">
                    {new Date(transaction.date).toLocaleDateString()}
                  </TableCell>

                  {/* Status: some no mobile */}
                  <TableCell className="hidden sm:table-cell">
                    <Badge
                      variant={
                        transaction.status === 'completed'
                          ? 'default'
                          : transaction.status === 'pending'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {transaction.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <span
                      className={`font-semibold whitespace-nowrap ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </TableCell>
                  
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditTransaction(transaction)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => {
                            setDeleteTransactionId(transaction.id)
                            setDeleteTransactionDesc(transaction.description)
                          }}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {editTransaction && (
        <EditTransactionDialog
          transaction={editTransaction}
          open={!!editTransaction}
          onOpenChange={(open) => !open && setEditTransaction(null)}
        />
      )}

      {deleteTransactionId && (
        <DeleteTransactionDialog
          transactionId={deleteTransactionId}
          transactionDescription={deleteTransactionDesc}
          open={!!deleteTransactionId}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteTransactionId(null)
              setDeleteTransactionDesc('')
            }
          }}
        />
      )}
    </>
  )
}