import React from 'react'
import { getCurrentUser } from '@/lib/actions/auth.actions'
import { createClient } from '@/lib/supabase/server'
import { formatEthDate } from '@/lib/ethiopian-date'
import { Receipt, Coins, CalendarDays } from 'lucide-react'
import { redirect } from 'next/navigation'

export const revalidate = 0 // Dynamic route

export default async function CollectorContributionsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const supabase = await createClient()

  // Fetch collector profile
  const { data: collector } = await supabase
    .from('collectors')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!collector) {
    return (
      <div className="p-6 text-center text-destructive glass border border-destructive/20 rounded-3xl">
        <h2 className="text-xl font-bold">Failed to load collector context</h2>
        <p className="text-sm mt-1">This user is not registered as a field collector.</p>
      </div>
    )
  }

  // Fetch all contributions made by this collector (last 100 entries)
  const { data } = await supabase
    .from('contribution_records')
    .select(`
      *,
      contributors (
        *,
        users (*),
        equb_groups (*)
      )
    `)
    .eq('collector_id', collector.id)
    .order('created_at', { ascending: false })
    .limit(100)

  const collections = data || []

  // Calculate sum of contributions recorded by this collector
  const totalVolume = (collections || []).reduce((acc: number, curr: any) => acc + Number(curr.amount), 0)

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
          Collection Ledger
        </h1>
        <p className="text-muted-foreground text-sm">
          A history of savings contributions recorded and verified on your route.
        </p>
      </div>

      {/* Summary card */}
      <div className="max-w-md glass p-5 rounded-3xl border border-white/20 dark:border-white/5 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase font-bold text-muted-foreground">My Total Collections</span>
          <h3 className="text-3xl font-extrabold text-primary tracking-tight mt-1">
            {totalVolume.toLocaleString()} <span className="text-lg font-bold">ETB</span>
          </h3>
        </div>
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-primary border border-emerald-500/20">
          <Coins className="w-6 h-6" />
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
          <Receipt className="w-5 h-5 text-primary" />
          <span>Verified Transactions Ledger</span>
        </h3>

        <div className="glass rounded-3xl border border-white/20 dark:border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Contributor
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Equb Group
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Gregorian Date
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Ethiopian Date (E.C.)
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">
                    Amount Deposited
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {collections.length > 0 ? (
                  collections.map((rec: any) => {
                    const name = rec.contributors?.users?.full_name ?? 'Unknown'
                    const phone = rec.contributors?.users?.phone ?? ''
                    const groupName = rec.contributors?.equb_groups?.name ?? '—'
                    const ethDateStr = formatEthDate(new Date(rec.contribution_date), 'en', true)

                    return (
                      <tr key={rec.id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-6 py-4.5">
                          <p className="text-sm font-bold text-foreground">{name}</p>
                          <p className="text-xs text-muted-foreground">{phone}</p>
                        </td>
                        <td className="px-6 py-4.5 text-sm font-semibold text-foreground">
                          {groupName}
                        </td>
                        <td className="px-6 py-4.5 text-sm font-medium text-muted-foreground">
                          {rec.contribution_date}
                        </td>
                        <td className="px-6 py-4.5 text-sm font-bold text-foreground">
                          {ethDateStr}
                        </td>
                        <td className="px-6 py-4.5 text-sm font-extrabold text-primary text-right">
                          +{Number(rec.amount).toLocaleString()} ETB
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground text-sm font-medium">
                      No contributions have been recorded by you yet.
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
