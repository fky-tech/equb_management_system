import React from 'react'
import { TableSkeleton } from '@/components/shared/Skeleton'

export default function AdminPayoutsLoading() {
  return <TableSkeleton rows={6} cols={5} />
}
