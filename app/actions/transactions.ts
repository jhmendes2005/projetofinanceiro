'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function updateTransaction(transactionId: string, data: {
  description: string
  amount: number
  type: string
  account_id: string
  category_id?: string | null
  date: string
  payee?: string | null
  notes?: string | null
  status: string
}) {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('transactions')
      .update({
        description: data.description,
        amount: data.amount,
        type: data.type,
        account_id: data.account_id,
        category_id: data.category_id || null,
        date: data.date,
        payee: data.payee || null,
        notes: data.notes || null,
        status: data.status,
      })
      .eq('id', transactionId)
      .eq('user_id', user.id)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/dashboard/transactions')
    return { success: true }
  } catch (error) {
    return { error: 'Failed to update transaction' }
  }
}

export async function deleteTransaction(transactionId: string) {
  try {
    const supabase = await getSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId)
      .eq('user_id', user.id)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/dashboard/transactions')
    return { success: true }
  } catch (error) {
    return { error: 'Failed to delete transaction' }
  }
}
