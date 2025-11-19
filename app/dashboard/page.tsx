import { getSupabaseServerClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Wallet, CreditCard, TrendingDown, TrendingUp, CalendarClock } from 'lucide-react'
import { OverviewChart } from '@/components/dashboard/overview-chart'
import { RecentTransactions } from '@/components/dashboard/recent-transactions'
import { UpcomingRecurring } from '@/components/dashboard/upcoming-recurring'
import { BudgetProgress } from '@/components/dashboard/budget-progress'

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch financial summary data
  const { data: accounts } = await supabase
    .from('accounts')
    .select('balance')
    .eq('user_id', user.id)
    .eq('is_active', true)

  const { data: creditCards } = await supabase
    .from('credit_cards')
    .select('current_balance, credit_limit')
    .eq('user_id', user.id)
    .eq('is_active', true)

  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount, type')
    .eq('user_id', user.id)
    .gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
    .eq('status', 'completed')

  const { data: recurring } = await supabase
    .from('recurring_transactions')
    .select('amount, type, frequency')
    .eq('user_id', user.id)
    .eq('is_active', true)

  // Calculate totals
  const totalBalance = accounts?.reduce((sum, acc) => sum + Number(acc.balance), 0) || 0
  const totalCreditUsed = creditCards?.reduce((sum, card) => sum + Number(card.current_balance), 0) || 0
  const totalCreditLimit = creditCards?.reduce((sum, card) => sum + Number(card.credit_limit), 0) || 0
  
  const monthlyIncome = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) || 0
  const monthlyExpenses = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) || 0

  let projectedRecurringIncome = 0
  let projectedRecurringExpenses = 0

  recurring?.forEach(t => {
    let monthlyAmount = Number(t.amount)
    switch (t.frequency) {
      case 'daily':
        monthlyAmount *= 30
        break
      case 'weekly':
        monthlyAmount *= 4
        break
      case 'biweekly':
        monthlyAmount *= 2
        break
      case 'quarterly':
        monthlyAmount /= 3
        break
      case 'yearly':
        monthlyAmount /= 12
        break
    }

    if (t.type === 'income') {
      projectedRecurringIncome += monthlyAmount
    } else {
      projectedRecurringExpenses += monthlyAmount
    }
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    // Alteração 1: Padding responsivo (p-4 no mobile, p-8 no desktop)
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Welcome back! Here's your financial overview.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      {/* Alteração 2: Grid responsivo. 1 col (mobile), 2 cols (tablet/sm), 4 cols (desktop/lg) */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
            <p className="text-xs text-muted-foreground">
              Across {accounts?.length || 0} accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Used</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCreditUsed)}</div>
            <p className="text-xs text-muted-foreground">
              {totalCreditLimit > 0 ? `${((totalCreditUsed / totalCreditLimit) * 100).toFixed(1)}% of ${formatCurrency(totalCreditLimit)}` : 'No credit cards'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(monthlyIncome)}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(monthlyExpenses)}</div>
            <p className="text-xs text-muted-foreground">
              Net: {formatCurrency(monthlyIncome - monthlyExpenses)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected Recurring Income</CardTitle>
            <CalendarClock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(projectedRecurringIncome)}</div>
            <p className="text-xs text-muted-foreground">
              Estimated monthly from active recurring items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projected Recurring Expenses</CardTitle>
            <CalendarClock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(projectedRecurringExpenses)}</div>
            <p className="text-xs text-muted-foreground">
              Estimated monthly from active recurring items
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Details */}
      {/* Alteração 3: Mantivemos grid-cols-1 para mobile/tablet e ativamos grid-cols-7 apenas em LG (desktop) */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Spending Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart userId={user.id} />
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Budget Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <BudgetProgress userId={user.id} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions & Upcoming Recurring */}
      {/* Alteração 4: Breakpoint LG para dividir a tela, abaixo disso empilha */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentTransactions userId={user.id} />
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Upcoming Recurring</CardTitle>
          </CardHeader>
          <CardContent>
            <UpcomingRecurring userId={user.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}