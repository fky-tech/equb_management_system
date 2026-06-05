'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const payoutSchema = z.object({
  contributor_id: z.string().uuid(),
  payout_order: z.coerce.number().int().positive(),
  payout_date: z.string().optional(),
})

export async function getPayoutSchedule(filters?: { contributor_id?: string; group_id?: string }) {
  const supabase = await createClient()

  let query = supabase
    .from('payout_schedule')
    .select(`
      *,
      contributors (
        *,
        users (*),
        equb_groups (*)
      )
    `)
    .order('payout_order', { ascending: true })

  if (filters?.contributor_id) query = query.eq('contributor_id', filters.contributor_id)

  const { data, error } = await query
  if (error) return { error: error.message, data: [] }
  return { data: data ?? [], error: null }
}

export async function addPayoutEntry(formData: FormData) {
  const raw = {
    contributor_id: formData.get('contributor_id') as string,
    payout_order: formData.get('payout_order'),
    payout_date: formData.get('payout_date') as string | undefined,
  }

  const parsed = payoutSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const supabase = await createClient()

  // Get contributor details to find start_date and frequency of the group
  const { data: contributor } = await supabase
    .from('contributors')
    .select('*, equb_groups(*)')
    .eq('id', parsed.data.contributor_id)
    .single()

  let finalPayoutDate = parsed.data.payout_date
  if (!finalPayoutDate && contributor?.equb_groups) {
    const group = contributor.equb_groups
    const startDate = new Date(group.start_date || group.created_at)
    const order = parsed.data.payout_order
    
    if (group.frequency === 'weekly') {
      startDate.setDate(startDate.getDate() + order * 7)
    } else if (group.frequency === 'monthly') {
      startDate.setMonth(startDate.getMonth() + order)
    } else {
      // daily
      startDate.setDate(startDate.getDate() + order)
    }
    finalPayoutDate = startDate.toISOString().split('T')[0]
  }

  const { error } = await supabase.from('payout_schedule').insert({
    contributor_id: parsed.data.contributor_id,
    payout_order: parsed.data.payout_order,
    payout_date: finalPayoutDate ?? null,
    is_paid: false,
  })

  if (error) return { error: error.message }
  revalidatePath('/admin/payouts')
  return { success: true }
}

export async function updatePayoutEntry(id: string, formData: FormData) {
  const payout_order = Number(formData.get('payout_order'))
  const payout_date = formData.get('payout_date') as string | null

  const supabase = await createClient()
  const { error } = await supabase
    .from('payout_schedule')
    .update({ payout_order, payout_date: payout_date || null })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/admin/payouts')
  return { success: true }
}

export async function markPayoutPaid(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('payout_schedule')
    .update({ 
      is_paid: true,
      paid_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/admin/payouts')
  return { success: true }
}

export async function deletePayoutEntry(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('payout_schedule').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/payouts')
  return { success: true }
}
