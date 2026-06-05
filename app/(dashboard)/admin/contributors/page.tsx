import React from 'react'
import { getContributors } from '@/lib/actions/contributors.actions'
import { getCollectors } from '@/lib/actions/collectors.actions'
import { getGroups } from '@/lib/actions/groups.actions'
import ContributorManager from '@/components/contributors/ContributorManager'

export const revalidate = 0 // Dynamic route

export default async function AdminContributorsPage() {
  const [
    { data: contributors = [], error: contribError },
    { data: collectors = [], error: collectorError },
    { data: groups = [], error: groupError }
  ] = await Promise.all([
    getContributors(),
    getCollectors(),
    getGroups()
  ])

  const error = contribError || collectorError || groupError
  if (error) {
    return (
      <div className="p-6 text-center text-destructive glass border border-destructive/20 rounded-3xl">
        <h2 className="text-xl font-bold">Failed to load contributors context</h2>
        <p className="text-sm mt-1">{error}</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      <ContributorManager
        initialContributors={contributors as any[]}
        collectors={collectors as any[]}
        groups={groups as any[]}
        currentRole="admin"
      />
    </div>
  )
}
