import React from 'react'
import { getMyContributorProfile } from '@/lib/actions/contributors.actions'
import { getContributionHistory } from '@/lib/actions/contributions.actions'
import { redirect } from 'next/navigation'
import HistoryView from '@/components/contributor/HistoryView'

export const revalidate = 0

export default async function ContributorHistoryPage() {
  const { data: profile } = await getMyContributorProfile()
  if (!profile) redirect('/login')

  const { data: history = [] } = await getContributionHistory(profile.id, 100)

  return <HistoryView history={history} />
}
