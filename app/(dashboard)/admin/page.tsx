import React from 'react'
import { getAdminStats, getWeeklyStats } from '@/lib/actions/contributions.actions'
import { createClient } from '@/lib/supabase/server'
import AdminDashboard from '@/components/dashboard/AdminDashboard'

export const revalidate = 0 // Dynamic rendering

export default async function AdminDashboardPage() {
  const stats = await getAdminStats()
  const weeklyStats = await getWeeklyStats()

  // Fetch recent contributions directly from the server
  const supabase = await createClient()
  const { data: recentContributions = [] } = await supabase
    .from('contribution_records')
    .select(`
      id,
      amount,
      contribution_date,
      created_at,
      contributors (
        id,
        users (
          full_name
        ),
        equb_groups (
          name
        )
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <AdminDashboard
      stats={stats}
      weeklyStats={weeklyStats}
      recentContributions={recentContributions || []}
    />
  )
}
