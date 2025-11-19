"use server"

import { revalidatePath } from "next/cache"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// -----------------------------------------------------
// PROCESSA TRANSACOES RECORRENTES
// -----------------------------------------------------
export async function processRecurringTransactions() {
  const supabase = await getSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { error: "Not authenticated" }
  }

  const { error: processError } = await supabase.rpc(
    "process_recurring_transactions",
    { p_user_id: user.id }
  )

  if (processError) {
    console.error("Error processing recurring transactions:", processError)
    return { error: processError.message }
  }

  return { success: true }
}

// -----------------------------------------------------
// CRIA RECORRENTE
// -----------------------------------------------------
export async function createRecurringTransaction(formData: any) {
  const supabase = await getSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { error: "Not authenticated" }
  }

  // next_occurrence = start_date
  const body = {
    user_id: user.id,
    description: formData.description,
    amount: Number(formData.amount),
    type: formData.type,
    account_id: formData.account_id || null,
    category_id: formData.category_id || null,
    frequency: formData.frequency,
    start_date: formData.start_date,
    end_date: formData.end_date || null,
    next_occurrence: formData.start_date,   // 🔥 OBRIGATÓRIO
    auto_create: formData.auto_create ?? false,
  }

  const { error: insertError } = await supabase
    .from("recurring_transactions")
    .insert(body)

  if (insertError) {
    console.error(insertError)
    return { error: insertError.message }
  }

  await processRecurringTransactions()
  revalidatePath("/dashboard")

  return { success: true }
}

// -----------------------------------------------------
// UPDATE RECORRENTE
// -----------------------------------------------------
export async function updateRecurringTransaction(id: string, formData: any) {
  const supabase = await getSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { error: "Not authenticated" }
  }

  const body = {
    description: formData.description,
    amount: Number(formData.amount),
    type: formData.type,
    account_id: formData.account_id || null,
    category_id: formData.category_id || null,
    frequency: formData.frequency,
    start_date: formData.start_date,
    end_date: formData.end_date || null,
    // ❗ NO UPDATE NÃO ALTERAMOS next_occurrence
  }

  const { error: updateError } = await supabase
    .from("recurring_transactions")
    .update(body)
    .eq("id", id)
    .eq("user_id", user.id)

  if (updateError) {
    return { error: updateError.message }
  }

  await processRecurringTransactions()
  revalidatePath("/dashboard")

  return { success: true }
}

// -----------------------------------------------------
// DELETE RECORRENTE
// -----------------------------------------------------
export async function deleteRecurringTransaction(id: string) {
  const supabase = await getSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return { error: "Not authenticated" }
  }

  const { error: deleteError } = await supabase
    .from("recurring_transactions")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (deleteError) {
    return { error: deleteError.message }
  }

  await processRecurringTransactions()
  revalidatePath("/dashboard")

  return { success: true }
}
