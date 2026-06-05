'use client'

import React from 'react'
import { useTranslation } from '@/lib/i18n'
import { formatEthDate } from '@/lib/ethiopian-date'
import { Receipt } from 'lucide-react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface HistoryViewProps {
  history: any[]
}

export default function HistoryView({ history }: HistoryViewProps) {
  const { t, lang } = useTranslation()

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back navigation */}
      <Link
        href="/contributor"
        className="inline-flex items-center gap-1 text-sm font-bold text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{t('back')}</span>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
          {t('contributionHistory')}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t('historySubtitle')}
        </p>
      </div>

      {/* Ledger Table */}
      <div className="glass rounded-3xl border border-white/20 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t('date')}
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t('ethiopianCalendar')}
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">
                  {t('amount')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {history.length > 0 ? (
                history.map((record: any) => {
                  let ethDateStr = ''
                  try {
                    ethDateStr = formatEthDate(new Date(record.contribution_date), lang, true)
                  } catch {
                    ethDateStr = record.contribution_date
                  }

                  return (
                    <tr key={record.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-muted-foreground">
                        {record.contribution_date}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-foreground">
                        {ethDateStr}
                      </td>
                      <td className="px-6 py-4 text-sm font-extrabold text-primary text-right">
                        +{Number(record.amount).toLocaleString()} {t('birr')}
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground text-sm font-medium">
                    <Receipt className="w-10 h-10 opacity-20 mx-auto mb-3" />
                    <span>{t('noContributions')}</span>
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
