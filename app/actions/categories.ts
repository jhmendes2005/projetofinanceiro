'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseServerClient } from '@/lib/supabase/server'

export async function createCategory(formData: {
  name: string
  type: string
  color: string
}) {
  try {
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    const { error } = await supabase.from('categories').insert({
      user_id: user.id,
      name: formData.name,
      type: formData.type,
      color: formData.color,
      is_system: false,
    })

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/dashboard/categories')
    return { success: true }
  } catch (error) {
    return { error: 'An error occurred while creating the category' }
  }
}

export async function updateCategory(
  id: string,
  formData: {
    name: string
    type: string
    color: string
  }
) {
  try {
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('categories')
      .update({
        name: formData.name,
        type: formData.type,
        color: formData.color,
      })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/dashboard/categories')
    return { success: true }
  } catch (error) {
    return { error: 'An error occurred while updating the category' }
  }
}

export async function deleteCategory(id: string) {
  try {
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
      .eq('is_system', false)

    if (error) {
      return { error: error.message }
    }

    revalidatePath('/dashboard/categories')
    return { success: true }
  } catch (error) {
    return { error: 'An error occurred while deleting the category' }
  }
}
