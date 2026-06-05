'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const groupSchema = z.object({
  name: z.string().min(2),
  contribution_amount: z.coerce.number().positive(),
  total_days: z.coerce.number().int().positive(),
  frequency: z.enum(['daily', 'weekly', 'monthly']).default('daily'),
  start_date: z.string().optional(),
  description: z.string().optional(),
})

export async function getGroups() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('equb_groups')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return { error: error.message, data: [] }
  return { data: data ?? [], error: null }
}

export async function getGroupById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('equb_groups')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return { error: error.message, data: null }
  return { data, error: null }
}

export async function createGroup(formData: FormData) {
  const raw = {
    name: formData.get('name') as string,
    contribution_amount: formData.get('contribution_amount'),
    total_days: formData.get('total_days'),
    frequency: formData.get('frequency') || 'daily',
    start_date: formData.get('start_date') || new Date().toISOString().split('T')[0],
    description: formData.get('description') as string,
  }

  const parsed = groupSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const supabase = await createClient()
  const { error } = await supabase.from('equb_groups').insert({
    name: parsed.data.name,
    contribution_amount: parsed.data.contribution_amount,
    total_days: parsed.data.total_days,
    frequency: parsed.data.frequency,
    start_date: parsed.data.start_date ?? new Date().toISOString().split('T')[0],
    description: parsed.data.description ?? null,
    is_active: true,
  })

  if (error) return { error: error.message }

  revalidatePath('/admin/groups')
  return { success: true }
}

export async function updateGroup(id: string, formData: FormData) {
  const raw = {
    name: formData.get('name') as string,
    contribution_amount: formData.get('contribution_amount'),
    total_days: formData.get('total_days'),
    frequency: formData.get('frequency') || 'daily',
    start_date: formData.get('start_date') || new Date().toISOString().split('T')[0],
    description: formData.get('description') as string,
  }

  const parsed = groupSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const supabase = await createClient()
  const { error } = await supabase
    .from('equb_groups')
    .update({
      name: parsed.data.name,
      contribution_amount: parsed.data.contribution_amount,
      total_days: parsed.data.total_days,
      frequency: parsed.data.frequency,
      start_date: parsed.data.start_date ?? new Date().toISOString().split('T')[0],
      description: parsed.data.description ?? null,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/groups')
  revalidatePath(`/admin/groups/${id}`)
  return { success: true }
}

export async function toggleGroupStatus(id: string, currentStatus: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('equb_groups')
    .update({ is_active: !currentStatus })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/groups')
  return { success: true }
}
