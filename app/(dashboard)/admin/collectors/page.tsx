import React from 'react'
import { getCollectors } from '@/lib/actions/collectors.actions'
import CollectorManager from '@/components/collectors/CollectorManager'

export const revalidate = 0 // Dynamic route

export default async function AdminCollectorsPage() {
  const { data: collectors = [], error } = await getCollectors()

  if (error) {
    return (
      <div className="p-6 text-center text-destructive glass border border-destructive/20 rounded-3xl">
        <h2 className="text-xl font-bold">Failed to load collectors</h2>
        <p className="text-sm mt-1">{error}</p>
      </div>
    )
  }

  // Cast type to match CollectorWithUser
  const typedCollectors = collectors as any[]

  return (
    <div className="animate-fade-in">
      <CollectorManager initialCollectors={typedCollectors} />
    </div>
  )
}
