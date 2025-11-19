import { getSupabaseServerClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { AccountsList } from '@/components/accounts/accounts-list'
import { AddAccountDialog } from '@/components/accounts/add-account-dialog'

export default async function AccountsPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: accounts } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const totalBalance = accounts?.reduce((sum, acc) => sum + Number(acc.balance), 0) || 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
          <p className="text-muted-foreground">
            Manage your bank accounts and track balances
          </p>
        </div>
        <AddAccountDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        </AddAccountDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{formatCurrency(totalBalance)}</div>
          <p className="text-sm text-muted-foreground mt-2">
            Across {accounts?.length || 0} accounts
          </p>
        </CardContent>
      </Card>

      <AccountsList accounts={accounts || []} />
    </div>
  )
}
