import React from 'react'
import { TableSkeleton } from '@/components/shared/Skeleton'

export default function CollectorContributionsLoading() {
  return <TableSkeleton rows={7} cols={5} />
}
