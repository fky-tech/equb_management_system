'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { todayISO } from '@/lib/utils'
import { sendPaymentConfirmation } from '@/lib/sms/lomi'
import { formatEthDate } from '@/lib/ethiopian-date'

export async function getTodayContributions(collectorId?: string) {
  const supabase = await createClient()
  const today = todayISO()

  let query = supabase
    .from('contribution_records')
    .select(`
      *,
      contributors (
        *,
        users (*),
        equb_groups (*)
      )
    `)
    .eq('contribution_date', today)

  if (collectorId) query = query.eq('collector_id', collectorId)

  const { data, error } = await query.order('created_at', { ascending: false })
  if (error) return { error: error.message, data: [] }
  return { data: data ?? [], error: null }
}

export async function getContributionHistory(contributorId: string, limit = 30) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('contribution_records')
    .select('*')
    .eq('contributor_id', contributorId)
    .order('contribution_date', { ascending: false })
    .limit(limit)

  if (error) return { error: error.message, data: [] }
  return { data: data ?? [], error: null }
}

export async function getWeeklyStats() {
  const supabase = await createClient()
  const results = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const { count } = await supabase
      .from('contribution_records')
      .select('*', { count: 'exact', head: true })
      .eq('contribution_date', dateStr)
    results.push({ date: dateStr, count: count ?? 0 })
  }
  return results
}

export async function recordContribution(contributorId: string) {
  const supabase = await createClient()
  const today = todayISO()

  // Check if already paid today
  const { data: existing } = await supabase
    .from('contribution_records')
    .select('id')
    .eq('contributor_id', contributorId)
    .eq('contribution_date', today)
    .single()

  if (existing) {
    return { error: 'already_paid' }
  }

  // Get collector identity
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  const { data: collector } = await supabase
    .from('collectors')
    .select('id')
    .eq('user_id', userData?.id)
    .single()

  if (!collector) return { error: 'Collector profile not found' }

  // Get contributor + group details
  const { data: contributor } = await supabase
    .from('contributors')
    .select('*, users(*), equb_groups(*)')
    .eq('id', contributorId)
    .single()

  if (!contributor) return { error: 'Contributor not found' }

  const amount = contributor.equb_groups?.contribution_amount ?? 0
  const totalDays = contributor.equb_groups?.total_days ?? 0

  // Insert record
  const { error: insertError } = await supabase.from('contribution_records').insert({
    contributor_id: contributorId,
    collector_id: collector.id,
    contribution_date: today,
    amount,
  })

  if (insertError) {
    if (insertError.code === '23505') return { error: 'already_paid' }
    return { error: insertError.message }
  }

  // Count total paid days now
  const { count: paidCount } = await supabase
    .from('contribution_records')
    .select('*', { count: 'exact', head: true })
    .eq('contributor_id', contributorId)

  const paidDays = paidCount ?? 1
  const remainingDays = Math.max(0, totalDays - paidDays)

  // If payout_position is set and contributor has paid enough cycles, create payout_schedule entry
  // (only if not already scheduled)
  if (contributor.payout_position && totalDays > 0 && paidDays >= totalDays) {
    const adminClient = createAdminClient()
    const { data: existingPayout } = await adminClient
      .from('payout_schedule')
      .select('id')
      .eq('contributor_id', contributorId)
      .single()

    if (!existingPayout) {
      const group = contributor.equb_groups as any
      const startDate = new Date(group?.start_date || group?.created_at || today)
      const order = contributor.payout_position

      if (group?.frequency === 'weekly') {
        startDate.setDate(startDate.getDate() + order * 7)
      } else if (group?.frequency === 'monthly') {
        startDate.setMonth(startDate.getMonth() + order)
      } else {
        startDate.setDate(startDate.getDate() + order)
      }

      const payoutDate = startDate.toISOString().split('T')[0]

      await adminClient.from('payout_schedule').insert({
        contributor_id: contributorId,
        payout_order: contributor.payout_position,
        payout_date: payoutDate,
        is_paid: false,
      })
    }
  }

  // Send SMS confirmation (non-blocking)
  const phone = contributor.users?.phone
  const name = contributor.users?.full_name ?? ''
  if (phone) {
    sendPaymentConfirmation(phone, name, amount, paidDays, remainingDays, 'am').then(async (result) => {
      const adminClient = createAdminClient()
      await adminClient.from('sms_logs').insert({
        contributor_id: contributorId,
        phone,
        sms_type: 'confirmation',
        message: `Payment confirmed. Paid: ${paidDays} days, Remaining: ${remainingDays} days.`,
        status: result.success ? 'sent' : 'failed',
      })
    })
  }

  revalidatePath('/collector')
  revalidatePath('/collector/contributors')
  return { success: true, amount, paidDays, remainingDays }
}

export async function getAdminStats() {
  const supabase = await createClient()
  const today = todayISO()

  const [
    { count: totalContributors },
    { count: totalCollectors },
    { count: activeGroups },
    { count: contributionsToday },
    { count: totalActive },
  ] = await Promise.all([
    supabase.from('contributors').select('*', { count: 'exact', head: true }),
    supabase.from('collectors').select('*', { count: 'exact', head: true }),
    supabase.from('equb_groups').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('contribution_records').select('*', { count: 'exact', head: true }).eq('contribution_date', today),
    supabase.from('contributors').select('*', { count: 'exact', head: true }).eq('status', 'active'),
  ])

  const pendingToday = (totalActive ?? 0) - (contributionsToday ?? 0)

  return {
    totalContributors: totalContributors ?? 0,
    totalCollectors: totalCollectors ?? 0,
    activeGroups: activeGroups ?? 0,
    contributionsToday: contributionsToday ?? 0,
    pendingToday: Math.max(0, pendingToday),
  }
}

export async function getCollectorDashboardStats(collectorId: string) {
  const supabase = await createClient()
  const today = todayISO()

  const { count: totalAssigned } = await supabase
    .from('contributors')
    .select('*', { count: 'exact', head: true })
    .eq('collector_id', collectorId)
    .eq('status', 'active')

  const { count: paidToday } = await supabase
    .from('contribution_records')
    .select('*', { count: 'exact', head: true })
    .eq('collector_id', collectorId)
    .eq('contribution_date', today)

  return {
    totalAssigned: totalAssigned ?? 0,
    paidToday: paidToday ?? 0,
    notPaidToday: Math.max(0, (totalAssigned ?? 0) - (paidToday ?? 0)),
  }
}
