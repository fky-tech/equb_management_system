import React from 'react'
import { getGroups } from '@/lib/actions/groups.actions'
import GroupManager from '@/components/groups/GroupManager'

export const revalidate = 0 // Dynamic route

export default async function AdminGroupsPage() {
  const { data: groups = [], error } = await getGroups()

  if (error) {
    return (
      <div className="p-6 text-center text-destructive glass border border-destructive/20 rounded-3xl">
        <h2 className="text-xl font-bold">Failed to load Equb groups</h2>
        <p className="text-sm mt-1">{error}</p>
      </div>
    )
  }

  // Cast type to match EqubGroup
  const typedGroups = groups as any[]

  return (
    <div className="animate-fade-in">
      <GroupManager initialGroups={typedGroups} />
    </div>
  )
}
