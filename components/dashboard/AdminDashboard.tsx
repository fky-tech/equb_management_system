'use client'

import React from 'react'
import { useTranslation } from '@/lib/i18n'
import StatCard from '@/components/dashboard/StatCard'
import ContributionChart from '@/components/dashboard/ContributionChart'
import { 
  ArrowRight,
  TrendingUp,
  Receipt,
} from 'lucide-react'
import Link from 'next/link'
import { formatEthDate } from '@/lib/ethiopian-date'

interface AdminDashboardProps {
  stats: {
    totalContributors: number
    totalCollectors: number
    activeGroups: number
    contributionsToday: number
    pendingToday: number
  }
  weeklyStats: Array<{ date: string; count: number }>
  recentContributions: any[]
}

export default function AdminDashboard({
  stats,
  weeklyStats,
  recentContributions,
}: AdminDashboardProps) {
  const { t, lang } = useTranslation()

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header and Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            {t('systemOverview')}
          </h1>
          <p className="text-muted-foreground text-sm font-medium mt-1">
            {t('systemOverviewSubtitle')}
          </p>
        </div>
        
        {/* Quick actions or info pill */}
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-primary rounded-2xl text-xs font-semibold">
          <TrendingUp className="w-4 h-4" />
          <span>{t('operationsNormal')}</span>
        </div>
      </div>

      {/* Stats Cards Grid — pass icon NAME strings, not component refs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title={t('totalContributors')}
          value={stats.totalContributors}
          iconName="Users"
          color="primary"
          description={t('registeredMembers')}
        />
        <StatCard
          title={t('totalCollectors')}
          value={stats.totalCollectors}
          iconName="UserCheck"
          color="info"
          description={t('fieldAgentsActive')}
        />
        <StatCard
          title={t('activeGroups')}
          value={stats.activeGroups}
          iconName="Layers"
          color="secondary"
          description={t('savingsCircles')}
        />
        <StatCard
          title={t('contributionsToday')}
          value={stats.contributionsToday}
          iconName="Receipt"
          color="primary"
          description={t('collectionsReceived')}
        />
        <StatCard
          title={t('pendingToday')}
          value={stats.pendingToday}
          iconName="CircleAlert"
          color="destructive"
          description={t('awaitingCollection')}
        />
      </div>

      {/* Main Grid: Chart and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Trend Chart (2/3 width on desktop) */}
        <div className="lg:col-span-2">
          <ContributionChart
            data={weeklyStats}
            title={t('weeklyTrend')}
          />
        </div>

        {/* Recent Contributions (1/3 width on desktop) */}
        <div className="glass p-6 rounded-3xl border border-white/20 dark:border-white/5 flex flex-col justify-between h-[350px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold tracking-tight text-foreground">
                {t('recentCollections')}
              </h3>
              <Link
                href="/admin/reports"
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                <span>{t('viewAll')}</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* List */}
            <div className="space-y-4 overflow-y-auto max-h-[220px] pr-1">
              {recentContributions && recentContributions.length > 0 ? (
                recentContributions.map((contribution: any) => {
                  const name = contribution.contributors?.users?.full_name ?? t('unknown')
                  const groupName = contribution.contributors?.equb_groups?.name ?? t('general')
                  
                  let dateStr = ''
                  try {
                    dateStr = formatEthDate(new Date(contribution.created_at), lang, false)
                  } catch {
                    dateStr = contribution.created_at
                  }
                  
                  return (
                    <div
                      key={contribution.id}
                      className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/40 hover:bg-muted/60 border border-border/40 transition-colors"
                    >
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-foreground truncate">{name}</p>
                        <p className="text-xs text-muted-foreground truncate">{groupName}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-extrabold text-primary">
                          +{contribution.amount} {t('birr')}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-medium">{dateStr}</p>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-sm">
                  <Receipt className="w-8 h-8 opacity-20 mb-2" />
                  <span>{t('noCollectionsToday')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
