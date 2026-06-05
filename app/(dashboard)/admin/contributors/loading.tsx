import React from 'react'
import { TableSkeleton } from '@/components/shared/Skeleton'

export default function AdminContributorsLoading() {
  return <TableSkeleton rows={8} cols={6} />
}
