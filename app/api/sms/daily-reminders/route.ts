import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendDailyReminder, sendPayoutDayReminder } from '@/lib/sms/lomi'
import { todayISO } from '@/lib/utils'

export const dynamic = 'force-dynamic'

function shouldSendToday(frequency: string, startDate: string): boolean {
  const today = new Date()
  const start = new Date(startDate)
  const diffDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

  if (frequency === 'daily') return true
  if (frequency === 'weekly') return diffDays % 7 === 0
  if (frequency === 'monthly') {
    return today.getDate() === start.getDate()
  }
  return true
}

export async function GET(request: Request) {
  // Verify Cron Secret to prevent public execution
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')
  
  if (key !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const adminClient = createAdminClient()
    const today = todayISO()
    const todayDate = new Date().toLocaleDateString('en-GB') // DD/MM/YYYY format

    // 1. Fetch active contributors with user, group, and group frequency/start_date
    const { data: activeContributors, error: contribError } = await adminClient
      .from('contributors')
      .select(`
        id,
        users (
          full_name,
          phone
        ),
        equb_groups (
          id,
          name,
          contribution_amount,
          frequency,
          start_date
        )
      `)
      .eq('status', 'active')

    if (contribError || !activeContributors) {
      throw new Error(`Failed to fetch active contributors: ${contribError?.message}`)
    }

    // 2. Fetch today's contributions
    const { data: todayContributions } = await adminClient
      .from('contribution_records')
      .select('contributor_id')
      .eq('contribution_date', today)

    const paidIds = new Set(todayContributions?.map((c: any) => c.contributor_id) ?? [])

    // 3. Fetch today's payout schedule entries (payout day alerts)
    const { data: todayPayouts } = await adminClient
      .from('payout_schedule')
      .select('contributor_id, contributors(users(full_name, phone), equb_groups(contribution_amount, total_days))')
      .eq('payout_date', today)
      .eq('is_paid', false)

    // 4. Send payout day reminders
    const payoutResults = []
    if (todayPayouts && todayPayouts.length > 0) {
      for (const payout of todayPayouts as any[]) {
        const phone = payout.contributors?.users?.phone
        const name = payout.contributors?.users?.full_name ?? 'Participant'
        const amount = (payout.contributors?.equb_groups?.contribution_amount ?? 0) *
          (payout.contributors?.equb_groups?.total_days ?? 1)

        if (!phone) continue

        const smsResult = await sendPayoutDayReminder(phone, name, amount, 'am')

        await adminClient.from('sms_logs').insert({
          contributor_id: payout.contributor_id,
          phone,
          sms_type: 'reminder',
          message: `Payout day: ETB ${amount.toLocaleString()}`,
          status: smsResult.success ? 'sent' : 'failed',
        })

        payoutResults.push({ name, success: smsResult.success })
      }
    }

    // 5. Filter unpaid contributors whose group frequency matches today
    const unpaidContributors = activeContributors.filter(
      (c: any) => {
        if (paidIds.has(c.id)) return false
        if (!c.users?.phone) return false
        const freq = c.equb_groups?.frequency ?? 'daily'
        const startDate = c.equb_groups?.start_date ?? today
        return shouldSendToday(freq, startDate)
      }
    )

    // 6. Send contribution reminders in bulk
    const results = []
    for (const contributor of unpaidContributors) {
      const phone = contributor.users?.phone!
      const name = contributor.users?.full_name ?? 'Participant'
      const amount = contributor.equb_groups?.contribution_amount ?? 0

      const smsResult = await sendDailyReminder(phone, name, amount, todayDate, 'am')

      await adminClient.from('sms_logs').insert({
        contributor_id: contributor.id,
        phone,
        sms_type: 'reminder',
        message: `Daily Equb reminder: ${amount} ETB due today.`,
        status: smsResult.success ? 'sent' : 'failed',
      })

      results.push({ contributor_id: contributor.id, name, success: smsResult.success })
    }

    return NextResponse.json({
      message: `Reminders dispatched: ${results.length} contribution, ${payoutResults.length} payout-day.`,
      contribution_reminders: results,
      payout_reminders: payoutResults,
    })
  } catch (error) {
    console.error('[CRON REMINDERS] Exception:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown server error' },
      { status: 500 }
    )
  }
}
