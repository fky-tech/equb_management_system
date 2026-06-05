import React from 'react'
import { getCurrentUser } from '@/lib/actions/auth.actions'
import { getCollectorDashboardStats, getTodayContributions } from '@/lib/actions/contributions.actions'
import { getContributors } from '@/lib/actions/contributors.actions'
import { createClient } from '@/lib/supabase/server'
import CollectorDashboard from '@/components/collector/CollectorDashboard'
import { redirect } from 'next/navigation'

export const revalidate = 0 // Dynamic route

export default async function CollectorDashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = await createClient()

  // Retrieve collector profile
  const { data: collector } = await supabase
    .from('collectors')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!collector) {
    return (
      <div className="p-6 text-center text-destructive glass border border-destructive/20 rounded-3xl">
        <h2 className="text-xl font-bold">Failed to load collector context</h2>
        <p className="text-sm mt-1">This user is not registered as a field collector.</p>
      </div>
    )
  }

  // Fetch stats and lists
  const [
    stats,
    { data: contributors = [] },
    { data: todayContributions = [] }
  ] = await Promise.all([
    getCollectorDashboardStats(collector.id),
    getContributors({ collector_id: collector.id }),
    getTodayContributions(collector.id)
  ])

  const todayPaidIds = todayContributions.map((rec: any) => rec.contributor_id)

  return (
    <div className="animate-fade-in">
      <CollectorDashboard
        collectorId={collector.id}
        initialStats={stats}
        contributors={contributors as any[]}
        todayPaidIds={todayPaidIds}
      />
    </div>
  )
}
