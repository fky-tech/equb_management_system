import React from 'react'
import { getPayoutSchedule } from '@/lib/actions/payouts.actions'
import { getContributors } from '@/lib/actions/contributors.actions'
import { getGroups } from '@/lib/actions/groups.actions'
import PayoutManager from '@/components/payouts/PayoutManager'

export const revalidate = 0 // Dynamic route

export default async function AdminPayoutsPage() {
  const [
    { data: payouts = [], error: payoutError },
    { data: activeContributors = [], error: contribError },
    { data: groups = [], error: groupError }
  ] = await Promise.all([
    getPayoutSchedule(),
    getContributors({ status: 'active' }),
    getGroups()
  ])

  const error = payoutError || contribError || groupError
  if (error) {
    return (
      <div className="p-6 text-center text-destructive glass border border-destructive/20 rounded-3xl">
        <h2 className="text-xl font-bold">Failed to load payouts schedule</h2>
        <p className="text-sm mt-1">{error}</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <PayoutManager
        initialPayouts={payouts as any[]}
        activeContributors={activeContributors as any[]}
        groups={groups as any[]}
      />
    </div>
  )
}
