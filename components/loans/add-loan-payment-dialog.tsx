'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function AddLoanPaymentDialog({ 
  children, 
  loanId,
  currentBalance 
}: { 
  children: React.ReactNode
  loanId: string
  currentBalance: number
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accounts, setAccounts] = useState<any[]>([])
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const [formData, setFormData] = useState({
    amount: '',
    principal_amount: '',
    interest_amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    account_id: '',
    notes: '',
  })

  useEffect(() => {
    async function fetchAccounts() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('accounts')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('is_active', true)

      if (data) setAccounts(data)
    }

    if (open) {
      fetchAccounts()
    }
  }, [open, supabase])

  // Auto-calculate principal when total amount changes
  const handleAmountChange = (value: string) => {
    const amount = parseFloat(value) || 0
    const interest = parseFloat(formData.interest_amount) || 0
    
    setFormData({
      ...formData,
      amount: value,
      principal_amount: (amount - interest).toFixed(2)
    })
  }

  // Auto-calculate principal when interest changes
  const handleInterestChange = (value: string) => {
    const interest = parseFloat(value) || 0
    const amount = parseFloat(formData.amount) || 0
    
    setFormData({
      ...formData,
      interest_amount: value,
      principal_amount: (amount - interest).toFixed(2)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const amount = parseFloat(formData.amount)
      const principal = parseFloat(formData.principal_amount)
      const interest = parseFloat(formData.interest_amount)

      if (principal + interest !== amount) {
        throw new Error('Principal + Interest must equal Total Amount')
      }

      // 1. Record the payment
      const { error: paymentError } = await supabase
        .from('loan_payments')
        .insert({
          user_id: user.id,
          loan_id: loanId,
          account_id: formData.account_id || null,
          amount,
          principal_amount: principal,
          interest_amount: interest,
          payment_date: formData.payment_date,
          notes: formData.notes || null,
        })

      if (paymentError) throw paymentError

      // 2. Update loan balance
      const { error: updateError } = await supabase
        .from('loans')
        .update({
          current_balance: currentBalance - principal,
          updated_at: new Date().toISOString(),
        })
        .eq('id', loanId)

      if (updateError) throw updateError

      // 3. If account selected, create transaction
      if (formData.account_id) {
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            account_id: formData.account_id,
            type: 'expense',
            amount: amount,
            description: 'Loan Payment',
            date: formData.payment_date,
            status: 'completed',
            notes: `Payment for loan. Principal: ${principal}, Interest: ${interest}`,
          })

        if (transactionError) throw transactionError
      }

      setOpen(false)
      setFormData({
        amount: '',
        principal_amount: '',
        interest_amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        account_id: '',
        notes: '',
      })
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Loan Payment</DialogTitle>
          <DialogDescription>
            Add a payment to update your loan balance
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="amount">Total Payment Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="interest">Interest Portion</Label>
                <Input
                  id="interest"
                  type="number"
                  step="0.01"
                  value={formData.interest_amount}
                  onChange={(e) => handleInterestChange(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="principal">Principal Portion</Label>
                <Input
                  id="principal"
                  type="number"
                  value={formData.principal_amount}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Payment Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.payment_date}
                onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account">Paid From Account (Optional)</Label>
              <Select
                value={formData.account_id}
                onValueChange={(value) => setFormData({ ...formData, account_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Selecting an account will create a corresponding expense transaction
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Recording...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
