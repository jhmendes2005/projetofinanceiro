import { getSupabaseServerClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { TransactionsList } from '@/components/transactions/transactions-list'
import { AddTransactionDialog } from '@/components/transactions/add-transaction-dialog'
import { TransactionsFilters } from '@/components/transactions/transactions-filters'

export default async function TransactionsPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">
            Track all your income and expenses
          </p>
        </div>
        <AddTransactionDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </AddTransactionDialog>
      </div>

      <TransactionsFilters />
      <TransactionsList userId={user.id} />
    </div>
  )
}
