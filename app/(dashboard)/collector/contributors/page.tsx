import React from 'react'
import { getCurrentUser } from '@/lib/actions/auth.actions'
import { getContributors } from '@/lib/actions/contributors.actions'
import { getGroups } from '@/lib/actions/groups.actions'
import { createClient } from '@/lib/supabase/server'
import ContributorManager from '@/components/contributors/ContributorManager'
import { redirect } from 'next/navigation'

export const revalidate = 0 // Dynamic route

export default async function CollectorContributorsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = await createClient()

  // Retrieve collector details with user fields joined
  const { data: collector } = await supabase
    .from('collectors')
    .select(`
      *,
      users (*)
    `)
    .eq('user_id', user.id)
    .single()

  if (!collector) {
    return (
      <div className="p-6 text-center text-destructive glass border border-destructive/20 rounded-3xl">
        <h2 className="text-xl font-bold">Failed to load collectors context</h2>
        <p className="text-sm mt-1">This user is not registered as a field collector.</p>
      </div>
    )
  }

  const [
    { data: contributors = [] },
    { data: groups = [] }
  ] = await Promise.all([
    getContributors({ collector_id: collector.id }),
    getGroups()
  ])

  return (
    <div className="animate-fade-in">
      <ContributorManager
        initialContributors={contributors as any[]}
        collectors={[collector] as any[]}
        groups={groups as any[]}
        currentRole="collector"
        currentCollectorId={collector.id}
      />
    </div>
  )
}
