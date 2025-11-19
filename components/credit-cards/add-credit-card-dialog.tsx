'use client'

import { useState } from 'react'
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
import { getSupabaseBrowserClient } from '@/lib/supabase/client'
import { Alert, AlertDescription } from '@/components/ui/alert'

const colors = [
  '#EC4899', '#8B5CF6', '#3B82F6', '#10B981',
  '#F59E0B', '#EF4444', '#06B6D4', '#14B8A6',
]

export function AddCreditCardDialog({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const [formData, setFormData] = useState({
    name: '',
    last_four: '',
    issuer: '',
    credit_limit: '',
    current_balance: '',
    apr: '',
    payment_due_date: '',
    statement_closing_date: '',
    color: colors[0],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error: insertError } = await supabase.from('credit_cards').insert({
        user_id: user.id,
        name: formData.name,
        last_four: formData.last_four,
        issuer: formData.issuer || null,
        credit_limit: parseFloat(formData.credit_limit),
        current_balance: parseFloat(formData.current_balance) || 0,
        apr: formData.apr ? parseFloat(formData.apr) : null,
        payment_due_date: formData.payment_due_date ? parseInt(formData.payment_due_date) : null,
        statement_closing_date: formData.statement_closing_date ? parseInt(formData.statement_closing_date) : null,
        color: formData.color,
      })

      if (insertError) throw insertError

      setOpen(false)
      setFormData({
        name: '',
        last_four: '',
        issuer: '',
        credit_limit: '',
        current_balance: '',
        apr: '',
        payment_due_date: '',
        statement_closing_date: '',
        color: colors[0],
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Credit Card</DialogTitle>
          <DialogDescription>
            Add a new credit card to track spending and utilization
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Card Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Chase Sapphire"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_four">Last 4 Digits *</Label>
                <Input
                  id="last_four"
                  value={formData.last_four}
                  onChange={(e) => setFormData({ ...formData, last_four: e.target.value })}
                  placeholder="1234"
                  maxLength={4}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="issuer">Card Issuer</Label>
              <Input
                id="issuer"
                value={formData.issuer}
                onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                placeholder="e.g., Chase, Amex, Visa"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="credit_limit">Credit Limit *</Label>
                <Input
                  id="credit_limit"
                  type="number"
                  step="0.01"
                  value={formData.credit_limit}
                  onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
                  placeholder="10000.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="current_balance">Current Balance</Label>
                <Input
                  id="current_balance"
                  type="number"
                  step="0.01"
                  value={formData.current_balance}
                  onChange={(e) => setFormData({ ...formData, current_balance: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="apr">APR (%)</Label>
                <Input
                  id="apr"
                  type="number"
                  step="0.01"
                  value={formData.apr}
                  onChange={(e) => setFormData({ ...formData, apr: e.target.value })}
                  placeholder="18.99"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_due_date">Payment Due (Day)</Label>
                <Input
                  id="payment_due_date"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.payment_due_date}
                  onChange={(e) => setFormData({ ...formData, payment_due_date: e.target.value })}
                  placeholder="15"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="statement_closing_date">Closing (Day)</Label>
                <Input
                  id="statement_closing_date"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.statement_closing_date}
                  onChange={(e) => setFormData({ ...formData, statement_closing_date: e.target.value })}
                  placeholder="10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Card Color</Label>
              <div className="flex gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`h-8 w-8 rounded-full border-2 ${
                      formData.color === color ? 'border-foreground' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Card'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
