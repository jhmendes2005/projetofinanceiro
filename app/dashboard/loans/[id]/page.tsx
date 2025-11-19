import { getSupabaseServerClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { LoanDetails } from '@/components/loans/loan-details'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function LoanPage({ params }: { params: { id: string } }) {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: loan } = await supabase
    .from('loans')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!loan) {
    notFound()
  }

  const { data: payments } = await supabase
    .from('loan_payments')
    .select('*')
    .eq('loan_id', loan.id)
    .order('payment_date', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/loans">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{loan.name}</h1>
          <p className="text-muted-foreground">
            Loan Details & Payment History
          </p>
        </div>
      </div>

      <LoanDetails loan={loan} payments={payments || []} />
    </div>
  )
}
