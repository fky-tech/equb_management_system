'use client'

import React from 'react'
import { useTranslation } from '@/lib/i18n'
import { formatEthDate } from '@/lib/ethiopian-date'
import {
  TrendingUp,
  MailCheck,
  AlertTriangle,
} from 'lucide-react'

interface ReportsViewProps {
  totalSavings: number
  smsSent: number
  smsFailed: number
  smsLogs: any[]
}

export default function ReportsView({ totalSavings, smsSent, smsFailed, smsLogs }: ReportsViewProps) {
  const { t, lang } = useTranslation()

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
          {t('reports')}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t('reportsSubtitle')}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Collected */}
        <div className="glass p-5 rounded-3xl border border-white/20 dark:border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-muted-foreground">{t('totalCollected')}</span>
            <h3 className="text-3xl font-extrabold text-primary tracking-tight mt-1">
              {totalSavings.toLocaleString()} <span className="text-lg font-bold">{t('birr')}</span>
            </h3>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-primary border border-emerald-500/20">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* SMS Delivered */}
        <div className="glass p-5 rounded-3xl border border-white/20 dark:border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-muted-foreground">{t('smsSent')}</span>
            <h3 className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400 tracking-tight mt-1">
              {smsSent}
            </h3>
          </div>
          <div className="p-3.5 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <MailCheck className="w-6 h-6" />
          </div>
        </div>

        {/* SMS Failures */}
        <div className="glass p-5 rounded-3xl border border-white/20 dark:border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-muted-foreground">{t('smsFailed')}</span>
            <h3 className="text-3xl font-extrabold text-destructive tracking-tight mt-1">
              {smsFailed}
            </h3>
          </div>
          <div className="p-3.5 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* SMS Logs Audit Trail */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground tracking-tight">
          {t('smsHistory')}
        </h3>

        <div className="glass rounded-3xl border border-white/20 dark:border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t('name')}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t('phone')}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t('smsType')}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Message
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t('status')}
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">
                    {t('date')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {smsLogs && smsLogs.length > 0 ? (
                  smsLogs.map((log: any) => {
                    const recipientName = log.contributors?.users?.full_name ?? 'System'
                    let dateStr = ''
                    try {
                      dateStr = formatEthDate(new Date(log.sent_at), lang, true)
                    } catch {
                      dateStr = log.sent_at
                    }

                    return (
                      <tr key={log.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-foreground">
                          {recipientName}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-muted-foreground">
                          {log.phone ?? '—'}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-muted text-muted-foreground capitalize">
                            {log.sms_type === 'reminder' ? t('reminder') : t('confirmation')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-foreground max-w-xs truncate" title={log.message}>
                          {log.message}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            log.status === 'sent'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-destructive/10 text-destructive'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${log.status === 'sent' ? 'bg-emerald-500' : 'bg-destructive'}`} />
                            {log.status === 'sent' ? t('smsSent') : t('smsFailed')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-muted-foreground text-right">
                          {dateStr}
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground text-sm font-medium">
                      {t('noData')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
