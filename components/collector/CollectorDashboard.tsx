'use client'

import React, { useState, useTransition } from 'react'
import { useTranslation } from '@/lib/i18n'
import StatCard from '../dashboard/StatCard'
import SearchFilter from '../shared/SearchFilter'
import { 
  ContributorWithDetails, 
  CollectorStats 
} from '@/types/database.types'
import { recordContribution } from '@/lib/actions/contributions.actions'
import { 
  Users, 
  CheckCircle, 
  AlertCircle, 
  Coins, 
  Loader2, 
  Search
} from 'lucide-react'
import { toast } from 'sonner'
import { formatEthDate } from '@/lib/ethiopian-date'

interface CollectorDashboardProps {
  collectorId: string
  initialStats: CollectorStats
  contributors: ContributorWithDetails[]
  todayPaidIds: string[] // IDs of contributors who have already paid today
}

export default function CollectorDashboard({
  collectorId,
  initialStats,
  contributors,
  todayPaidIds,
}: CollectorDashboardProps) {
  const { t, lang } = { ...useTranslation() }
  const [stats, setStats] = useState<CollectorStats>(initialStats)
  const [paidIds, setPaidIds] = useState<string[]>(todayPaidIds)
  const [searchQuery, setSearchQuery] = useState('')
  const [isPending, startTransition] = useTransition()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  // Filter collectors' active contributors
  const activeContributors = contributors.filter(c => c.status === 'active')
  
  const filteredContributors = activeContributors.filter(c => {
    const name = c.users?.full_name?.toLowerCase() ?? ''
    const phone = c.users?.phone ?? ''
    const group = c.equb_groups?.name?.toLowerCase() ?? ''
    const query = searchQuery.toLowerCase()

    return name.includes(query) || phone.includes(query) || group.includes(query)
  })

  const handleMarkPaid = async (contributorId: string, name: string) => {
    setLoadingId(contributorId)
    startTransition(async () => {
      const result = await recordContribution(contributorId)
      setLoadingId(null)

      if (result.error) {
        if (result.error === 'already_paid') {
          toast.info(`${name} has already made a contribution today.`)
          if (!paidIds.includes(contributorId)) {
            setPaidIds(prev => [...prev, contributorId])
          }
        } else {
          toast.error(result.error)
        }
      } else {
        toast.success(`Recorded ${result.amount} ETB contribution for ${name}. SMS sent!`)
        setPaidIds(prev => [...prev, contributorId])
        
        // Update local stats dashboard dynamically
        setStats(prev => {
          const newPaid = prev.paidToday + 1
          const newNotPaid = Math.max(0, prev.totalAssigned - newPaid)
          return {
            ...prev,
            paidToday: newPaid,
            notPaidToday: newNotPaid
          }
        })
      }
    })
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Greeting and title */}
      <div>
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
          Collector Dashboard
        </h1>
        <p className="text-muted-foreground text-sm">
          Collect daily savings from assigned participants and dispatch SMS confirmations.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title={t('assignedContributors')}
          value={stats.totalAssigned}
          iconName="Users"
          color="info"
        />
        <StatCard
          title={t('paidToday')}
          value={stats.paidToday}
          iconName="CheckCircle"
          color="primary"
        />
        <StatCard
          title={t('notPaidToday')}
          value={stats.notPaidToday}
          iconName="AlertCircle"
          color="destructive"
        />
      </div>

      {/* Quick Record Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
          <Coins className="w-5 h-5 text-primary" />
          <span>{t('quickRecord')}</span>
        </h3>

        {/* Toolbar */}
        <SearchFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder="Search contributor by name or phone..."
        />

        {/* List of contributors for recording */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContributors.length > 0 ? (
            filteredContributors.map((c) => {
              const hasPaid = paidIds.includes(c.id)
              const name = c.users?.full_name ?? 'Unknown'
              const groupName = c.equb_groups?.name ?? '—'
              const amount = c.equb_groups?.contribution_amount ?? 0
              const isCardLoading = loadingId === c.id

              return (
                <div
                  key={c.id}
                  className={`glass p-5 rounded-3xl border transition-all duration-200 relative overflow-hidden flex flex-col justify-between h-[180px] ${
                    hasPaid 
                      ? 'border-emerald-500/10 bg-emerald-500/5' 
                      : 'border-white/20 dark:border-white/5 hover:scale-[1.01]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="overflow-hidden pr-2">
                        <h4 className="text-base font-extrabold text-foreground truncate">{name}</h4>
                        <p className="text-xs text-muted-foreground">{c.users?.phone}</p>
                      </div>
                      <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-lg shrink-0">
                        {amount} ETB
                      </span>
                    </div>

                    <p className="text-xs font-medium text-muted-foreground truncate">
                      {groupName}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">
                      Payout pos: <span className="text-foreground">{c.payout_position ?? '—'}</span>
                    </span>

                    {hasPaid ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Paid</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleMarkPaid(c.id, name)}
                        disabled={isPending || isCardLoading}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/95 hover:to-emerald-600/95 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-80"
                      >
                        {isCardLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Coins className="w-3.5 h-3.5" />
                        )}
                        <span>{t('markPaid')}</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="col-span-full py-12 text-center text-muted-foreground text-sm font-medium glass border border-border/30 rounded-3xl">
              No contributors match criteria
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
