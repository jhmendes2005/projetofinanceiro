import { getSupabaseServerClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { CreditCardsList } from '@/components/credit-cards/credit-cards-list'
import { AddCreditCardDialog } from '@/components/credit-cards/add-credit-card-dialog'

export default async function CreditCardsPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: creditCards } = await supabase
    .from('credit_cards')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const totalUsed = creditCards?.reduce((sum, card) => sum + Number(card.current_balance), 0) || 0
  const totalLimit = creditCards?.reduce((sum, card) => sum + Number(card.credit_limit), 0) || 0
  const utilizationRate = totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0

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
          <h1 className="text-3xl font-bold tracking-tight">Credit Cards</h1>
          <p className="text-muted-foreground">
            Monitor your credit cards and track utilization
          </p>
        </div>
        <AddCreditCardDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Card
          </Button>
        </AddCreditCardDialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalUsed)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Limit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalLimit)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${utilizationRate > 30 ? 'text-red-600' : 'text-green-600'}`}>
              {utilizationRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {utilizationRate > 30 ? 'Consider paying down' : 'Good utilization'}
            </p>
          </CardContent>
        </Card>
      </div>

      <CreditCardsList cards={creditCards || []} />
    </div>
  )
}
