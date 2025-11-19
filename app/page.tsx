import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const supabase = await getSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-muted/50 to-background p-4">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight text-balance">
            Take Control of Your{' '}
            <span className="text-primary">Financial Future</span>
          </h1>
          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            Track expenses, manage budgets, monitor credit cards, and achieve your financial goals all in one place.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 pt-12">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary">📊</div>
            <h3 className="font-semibold">Track Everything</h3>
            <p className="text-sm text-muted-foreground">
              Monitor accounts, credit cards, loans, and investments in real-time
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary">💰</div>
            <h3 className="font-semibold">Smart Budgeting</h3>
            <p className="text-sm text-muted-foreground">
              Set budgets, track spending, and get alerts when you're over budget
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-primary">📈</div>
            <h3 className="font-semibold">Insightful Reports</h3>
            <p className="text-sm text-muted-foreground">
              Visualize your finances with detailed reports and analytics
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
