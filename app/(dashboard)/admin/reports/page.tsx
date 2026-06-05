import React from 'react'
import { createClient } from '@/lib/supabase/server'
import ReportsView from '@/components/reports/ReportsView'

export const revalidate = 0

export default async function AdminReportsPage() {
  const supabase = await createClient()

  const { data: sumData } = await supabase
    .from('contribution_records')
    .select('amount')

  const totalSavings = sumData?.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0) ?? 0

  const [
    { count: smsSent },
    { count: smsFailed }
  ] = await Promise.all([
    supabase.from('sms_logs').select('*', { count: 'exact', head: true }).eq('status', 'sent'),
    supabase.from('sms_logs').select('*', { count: 'exact', head: true }).eq('status', 'failed')
  ])

  const { data: smsLogs = [] } = await supabase
    .from('sms_logs')
    .select(`
      *,
      contributors (
        users (
          full_name
        )
      )
    `)
    .order('sent_at', { ascending: false })
    .limit(30)

  return (
    <ReportsView
      totalSavings={totalSavings}
      smsSent={smsSent ?? 0}
      smsFailed={smsFailed ?? 0}
      smsLogs={smsLogs || []}
    />
  )
}
