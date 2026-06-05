import React from 'react'
import { getMyContributorProfile, getContributorStats } from '@/lib/actions/contributors.actions'
import { getContributionHistory } from '@/lib/actions/contributions.actions'
import ProgressBar from '@/components/shared/ProgressBar'
import EthiopianDateDisplay from '@/components/calendar/EthiopianDateDisplay'
import { 
  PiggyBank, 
  Award, 
  CalendarDays, 
  Receipt,
  History,
  TrendingUp,
  CircleAlert
} from 'lucide-react'
import Link from 'next/link'
import { formatEthDate } from '@/lib/ethiopian-date'

export const revalidate = 0 // Dynamic route

export default async function ContributorDashboardPage() {
  const { data: profile } = await getMyContributorProfile()

  if (!profile) {
    return (
      <div className="p-6 text-center text-destructive glass border border-destructive/20 rounded-3xl">
        <h2 className="text-xl font-bold">Failed to load profile</h2>
        <p className="text-sm mt-1">Make sure you are logged in as a registered contributor.</p>
      </div>
    )
  }

  const [
    statsResult,
    historyResult
  ] = await Promise.all([
    getContributorStats(profile.id),
    getContributionHistory(profile.id, 5)
  ])

  const stats = statsResult.data
  const history = historyResult.data ?? []

  const nextPayoutStr = stats?.nextPayoutDate
    ? formatEthDate(new Date(stats.nextPayoutDate), 'en', true)
    : 'Not scheduled yet'

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            My Savings Dashboard
          </h1>
          <p className="text-muted-foreground text-sm font-medium mt-1">
            Track your Equb progress, payout slot rotation, and historical receipts.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/10 text-primary rounded-2xl text-xs font-semibold">
          <PiggyBank className="w-4 h-4" />
          <span>Active Group: {profile.equb_groups?.name}</span>
        </div>
      </div>

      {/* Stats and progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Progress Card */}
        <div className="lg:col-span-2 glass p-6 rounded-3xl border border-white/20 dark:border-white/5 flex flex-col justify-between h-[230px]">
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Equb Cycle Progress</span>
            <h3 className="text-2xl font-extrabold text-foreground mt-1 mb-4">
              Saving Cycle Completion
            </h3>
            {stats && (
              <ProgressBar
                value={stats.paidDays}
                max={stats.totalDays}
                label={`${stats.paidDays} of ${stats.totalDays} days collected`}
              />
            )}
          </div>
          
          <div className="flex justify-between items-center text-xs text-muted-foreground border-t border-border/40 pt-3 mt-4">
            <span>Remaining days: <strong className="text-foreground">{stats?.remainingDays}</strong></span>
            <span>Monthly rate: <strong className="text-primary">{profile.equb_groups?.contribution_amount} ETB/day</strong></span>
          </div>
        </div>

        {/* Payout Information */}
        <div className="glass p-6 rounded-3xl border border-white/20 dark:border-white/5 flex flex-col justify-between h-[230px]">
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Payout Details</span>
            <div className="flex items-center gap-3 mt-3">
              <div className="p-3.5 rounded-2xl bg-secondary/15 text-secondary-foreground border border-secondary/20">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Payout Position</p>
                <p className="text-2xl font-extrabold text-foreground">{stats?.payoutPosition ?? 'Unassigned'}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-border/40 pt-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="w-4 h-4 text-primary" />
              <span>Next Payout (E.C.):</span>
            </div>
            <span className="text-xs font-bold text-foreground text-right">{nextPayoutStr}</span>
          </div>
        </div>
      </div>

      {/* Recent Activity / Receipts */}
      <div className="glass p-6 rounded-3xl border border-white/20 dark:border-white/5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            <span>Recent Contributions</span>
          </h3>
          <Link
            href="/contributor/history"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>View full history</span>
            <History className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Gregorian Date
                </th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Ethiopian Date
                </th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">
                  Contribution Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {history.length > 0 ? (
                history.map((record: any) => {
                  const ethDateStr = formatEthDate(new Date(record.contribution_date), 'en', true)

                  return (
                    <tr key={record.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-4 py-3.5 text-sm font-medium text-muted-foreground">
                        {record.contribution_date}
                      </td>
                      <td className="px-4 py-3.5 text-sm font-bold text-foreground">
                        {ethDateStr}
                      </td>
                      <td className="px-4 py-3.5 text-sm font-extrabold text-primary text-right">
                        +{Number(record.amount).toLocaleString()} ETB
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center text-muted-foreground text-sm font-medium">
                    No contributions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
