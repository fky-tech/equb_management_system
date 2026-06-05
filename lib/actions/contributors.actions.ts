'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createAuthUser } from './auth.actions'
import { todayISO } from '@/lib/utils'
import { z } from 'zod'

const contributorSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(9),
  collector_id: z.string().uuid(),
  group_id: z.string().uuid(),
  payout_position: z.coerce.number().int().positive().optional(),
  password: z.string().min(8).optional(),
})

export async function getContributors(filters?: {
  collector_id?: string
  group_id?: string
  status?: string
}) {
  const supabase = await createClient()
  let query = supabase
    .from('contributors')
    .select(`
      *,
      users (*),
      collectors (*, users (*)),
      equb_groups (*)
    `)
    .order('created_at', { ascending: false })

  if (filters?.collector_id) query = query.eq('collector_id', filters.collector_id)
  if (filters?.group_id) query = query.eq('group_id', filters.group_id)
  if (filters?.status) query = query.eq('status', filters.status)

  const { data, error } = await query
  if (error) return { error: error.message, data: [] }
  return { data: data ?? [], error: null }
}

export async function getContributorById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('contributors')
    .select(`
      *,
      users (*),
      collectors (*, users (*)),
      equb_groups (*)
    `)
    .eq('id', id)
    .single()

  if (error) return { error: error.message, data: null }
  return { data, error: null }
}

export async function getMyContributorProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated', data: null }

  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!userData) return { error: 'User not found', data: null }

  const { data, error } = await supabase
    .from('contributors')
    .select(`
      *,
      users (*),
      collectors (*, users (*)),
      equb_groups (*)
    `)
    .eq('user_id', userData.id)
    .single()

  if (error) return { error: error.message, data: null }
  return { data, error: null }
}

export async function createContributor(formData: FormData) {
  const raw = {
    full_name: formData.get('full_name') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    collector_id: formData.get('collector_id') as string,
    group_id: formData.get('group_id') as string,
    payout_position: formData.get('payout_position') || undefined,
    password: formData.get('password') as string,
  }

  const parsed = contributorSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const authResult = await createAuthUser({
    email: parsed.data.email,
    password: parsed.data.password ?? 'Equb@2024!',
    full_name: parsed.data.full_name,
    phone: parsed.data.phone,
    role: 'contributor',
  })

  if (authResult.error) return { error: authResult.error }

  const adminClient = createAdminClient()
  const { data: userData } = await adminClient
    .from('users')
    .select('id')
    .eq('phone', parsed.data.phone)
    .single()

  if (!userData) return { error: 'Failed to find created user' }

  const { error } = await adminClient.from('contributors').insert({
    user_id: userData.id,
    collector_id: parsed.data.collector_id,
    group_id: parsed.data.group_id,
    payout_position: parsed.data.payout_position ?? null,
    joined_at: todayISO(),
    status: 'active',
  })

  if (error) return { error: error.message }

  revalidatePath('/admin/contributors')
  revalidatePath('/collector/contributors')
  return { success: true }
}

export async function updateContributor(id: string, formData: FormData) {
  const adminClient = createAdminClient()

  const full_name = formData.get('full_name') as string
  const phone = formData.get('phone') as string
  const collector_id = formData.get('collector_id') as string
  const group_id = formData.get('group_id') as string
  const payout_position = formData.get('payout_position')
    ? Number(formData.get('payout_position'))
    : null
  const status = formData.get('status') as 'active' | 'inactive' | 'completed'

  // Get user_id
  const { data: contributor } = await adminClient
    .from('contributors')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!contributor) return { error: 'Contributor not found' }

  if (contributor.user_id) {
    const { error: userError } = await adminClient
      .from('users')
      .update({ full_name, phone })
      .eq('id', contributor.user_id)

    if (userError) return { error: userError.message }
  }

  const { error } = await adminClient
    .from('contributors')
    .update({ collector_id, group_id, payout_position, status })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/admin/contributors')
  revalidatePath('/collector/contributors')
  revalidatePath(`/collector/contributors/${id}`)
  return { success: true }
}

export async function assignPayoutPosition(contributorId: string, position: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('contributors')
    .update({ payout_position: position })
    .eq('id', contributorId)

  if (error) return { error: error.message }
  revalidatePath('/admin/contributors')
  return { success: true }
}

export async function getContributorStats(contributorId: string) {
  const supabase = await createClient()

  // Get contributor + group info
  const { data: contributor } = await supabase
    .from('contributors')
    .select('*, equb_groups (*)')
    .eq('id', contributorId)
    .single()

  if (!contributor) return { error: 'Not found', data: null }

  // Count paid days
  const { count: paidDays } = await supabase
    .from('contribution_records')
    .select('*', { count: 'exact', head: true })
    .eq('contributor_id', contributorId)

  const totalDays = contributor.equb_groups?.total_days ?? 0
  const paid = paidDays ?? 0
  const remaining = Math.max(0, totalDays - paid)

  // Get next payout
  const { data: nextPayout } = await supabase
    .from('payout_schedule')
    .select('*')
    .eq('contributor_id', contributorId)
    .eq('is_paid', false)
    .order('payout_order', { ascending: true })
    .limit(1)
    .single()

  return {
    data: {
      paidDays: paid,
      totalDays,
      remainingDays: remaining,
      progressPercent: totalDays > 0 ? Math.round((paid / totalDays) * 100) : 0,
      payoutPosition: contributor.payout_position,
      nextPayoutDate: nextPayout?.payout_date ?? null,
    },
    error: null,
  }
}
