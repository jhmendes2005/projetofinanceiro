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
    // Alteração 1: Padding responsivo (p-4 mobile, p-8 desktop)
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      {/* Alteração 2: Flex-col no mobile, Flex-row no desktop */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          {/* Alteração 3: Tamanho da fonte ajustado */}
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Transactions</h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Track all your income and expenses
          </p>
        </div>
        
        <AddTransactionDialog>
          {/* Alteração 4: Botão full width no mobile */}
          <Button className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </AddTransactionDialog>
      </div>

      <div className="space-y-4">
        <TransactionsFilters />
        <TransactionsList userId={user.id} />
      </div>
    </div>
  )
}