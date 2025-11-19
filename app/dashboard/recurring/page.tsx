import { getSupabaseServerClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { RecurringTransactionsList } from '@/components/recurring/recurring-transactions-list'
import { AddRecurringTransactionDialog } from '@/components/recurring/add-recurring-transaction-dialog'

export default async function RecurringTransactionsPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recurring Transactions</h1>
          <p className="text-muted-foreground">
            Manage your recurring income and expenses
          </p>
        </div>
        <AddRecurringTransactionDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Recurring Transaction
          </Button>
        </AddRecurringTransactionDialog>
      </div>

      <RecurringTransactionsList userId={user.id} />
    </div>
  )
}
