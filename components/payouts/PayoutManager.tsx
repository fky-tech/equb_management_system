'use client'

import React, { useState, useTransition } from 'react'
import { useTranslation } from '@/lib/i18n'
import SearchFilter from '../shared/SearchFilter'
import { PayoutWithContributor, ContributorWithDetails, EqubGroup } from '@/types/database.types'
import { 
  addPayoutEntry, 
  markPayoutPaid, 
  deletePayoutEntry 
} from '@/lib/actions/payouts.actions'
import { 
  Plus, 
  CheckCircle2, 
  Trash2, 
  Calendar, 
  Layers, 
  User, 
  Award,
  Loader2,
  X,
  DollarSign
} from 'lucide-react'
import { toast } from 'sonner'
import { formatEthDate } from '@/lib/ethiopian-date'

interface PayoutManagerProps {
  initialPayouts: PayoutWithContributor[]
  activeContributors: ContributorWithDetails[]
  groups: EqubGroup[]
}

export default function PayoutManager({
  initialPayouts,
  activeContributors,
  groups,
}: PayoutManagerProps) {
  const { t, lang } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterGroup, setFilterGroup] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  
  const [isPending, startTransition] = useTransition()

  // Form states
  const [contributorId, setContributorId] = useState('')
  const [payoutOrder, setPayoutOrder] = useState('')
  const [payoutDate, setPayoutDate] = useState('')

  // Filter payouts
  const filteredPayouts = initialPayouts.filter((p) => {
    const name = p.contributors?.users?.full_name?.toLowerCase() ?? ''
    const group = p.contributors?.equb_groups?.name?.toLowerCase() ?? ''
    const query = searchQuery.toLowerCase()

    const matchesSearch = name.includes(query) || group.includes(query)
    const matchesGroup = filterGroup ? p.contributors?.group_id === filterGroup : true

    return matchesSearch && matchesGroup
  })

  const handleOpenAdd = () => {
    setContributorId('')
    setPayoutOrder('')
    setPayoutDate('')
    setIsAddOpen(true)
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const formData = new FormData()
      formData.append('contributor_id', contributorId)
      formData.append('payout_order', payoutOrder)
      formData.append('payout_date', payoutDate)

      const result = await addPayoutEntry(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Payout entry scheduled successfully')
        setIsAddOpen(false)
      }
    })
  }

  const handleMarkPaid = (payoutId: string) => {
    startTransition(async () => {
      const result = await markPayoutPaid(payoutId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Payout marked as paid')
      }
    })
  }

  const handleDeleteEntry = (payoutId: string) => {
    if (!confirm('Are you sure you want to delete this payout entry?')) return
    startTransition(async () => {
      const result = await deletePayoutEntry(payoutId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Payout entry deleted')
      }
    })
  }

  // Calculate totals
  const totalPaid = initialPayouts.filter(p => p.is_paid).length
  const totalPending = initialPayouts.filter(p => !p.is_paid).length

  // Filter options
  const groupOptions = groups.map(g => ({ value: g.id, label: g.name }))
  const hasActiveFilters = filterGroup !== '' || searchQuery !== ''

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            {t('payouts')}
          </h1>
          <p className="text-muted-foreground text-sm">
            Schedule Equb rotations, assign payment order, and mark cash outs.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/95 hover:to-emerald-600/95 text-white font-bold text-sm rounded-xl shadow-md shadow-primary/10 transition-all active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          <span>{t('addPayoutEntry')}</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="glass p-5 rounded-3xl border border-white/20 dark:border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-muted-foreground">{t('payoutStatus')}: {t('payoutPaid')}</span>
            <h3 className="text-3xl font-extrabold text-primary tracking-tight mt-1">{totalPaid}</h3>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-primary border border-emerald-500/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="glass p-5 rounded-3xl border border-white/20 dark:border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-muted-foreground">{t('payoutStatus')}: {t('payoutPending')}</span>
            <h3 className="text-3xl font-extrabold text-secondary-foreground tracking-tight mt-1">{totalPending}</h3>
          </div>
          <div className="p-3.5 rounded-2xl bg-secondary/10 text-secondary-foreground border border-secondary/20">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search payouts by contributor..."
        filters={[
          {
            name: 'group',
            value: filterGroup,
            options: groupOptions,
            placeholder: t('filterByGroup'),
            onChange: setFilterGroup,
          }
        ]}
        showClear={hasActiveFilters}
        onClear={() => {
          setFilterGroup('')
          setSearchQuery('')
        }}
      />

      {/* Payout Schedule Table */}
      <div className="glass rounded-3xl border border-white/20 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">
                  {t('payoutOrder')}
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t('contributor')}
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t('group')}
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t('payoutDate')}
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t('payoutStatus')}
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredPayouts.length > 0 ? (
                filteredPayouts.map((p) => {
                  const name = p.contributors?.users?.full_name ?? 'Unknown'
                  const groupName = p.contributors?.equb_groups?.name ?? '—'
                  const payoutVal = (p.contributors?.equb_groups?.contribution_amount ?? 0) * (p.contributors?.equb_groups?.total_days ?? 0)
                  const dateStr = p.payout_date 
                    ? formatEthDate(new Date(p.payout_date), lang, true) 
                    : 'Not Scheduled'

                  return (
                    <tr key={p.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4.5 text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-primary font-bold">
                          {p.payout_order}
                        </span>
                      </td>
                      <td className="px-6 py-4.5">
                        <p className="text-sm font-bold text-foreground">{name}</p>
                        <p className="text-xs text-muted-foreground">{p.contributors?.users?.phone}</p>
                      </td>
                      <td className="px-6 py-4.5">
                        <p className="text-sm font-semibold text-foreground">{groupName}</p>
                        <p className="text-xs text-primary font-bold">{payoutVal.toLocaleString()} {t('birr')}</p>
                      </td>
                      <td className="px-6 py-4.5 text-sm font-medium text-muted-foreground">
                        {dateStr}
                      </td>
                      <td className="px-6 py-4.5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          p.is_paid
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${p.is_paid ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {p.is_paid ? t('payoutPaid') : t('payoutPending')}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!p.is_paid && (
                            <button
                              onClick={() => handleMarkPaid(p.id)}
                              disabled={isPending}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/20 rounded-xl transition-all"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Paid</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteEntry(p.id)}
                            disabled={isPending}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsAddOpen(false)} />
          <div className="glass w-full max-w-lg rounded-3xl border border-white/20 dark:border-white/5 p-6 shadow-2xl relative z-10 animate-fade-in-up">
            <button
              onClick={() => setIsAddOpen(false)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-foreground mb-1">{t('addPayoutEntry')}</h3>
            <p className="text-xs text-muted-foreground mb-6">Schedule a contributor cash-out slot.</p>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  {t('contributor')}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
                    <User className="w-4 h-4" />
                  </span>
                  <select
                    required
                    value={contributorId}
                    onChange={(e) => setContributorId(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-semibold transition-all cursor-pointer outline-none"
                  >
                    <option value="">Select Contributor</option>
                    {activeContributors.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.users?.full_name} ({c.equb_groups?.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {t('payoutOrder')}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
                      <Award className="w-4 h-4" />
                    </span>
                    <input
                      type="number"
                      required
                      min="1"
                      value={payoutOrder}
                      onChange={(e) => setPayoutOrder(e.target.value)}
                      placeholder="e.g. 1"
                      className="w-full pl-11 pr-4 py-2.5 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-medium transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {t('payoutDate')}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                    </span>
                    <input
                      type="date"
                      value={payoutDate}
                      onChange={(e) => setPayoutDate(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-medium transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-border text-sm font-bold text-muted-foreground hover:bg-muted transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2.5 bg-gradient-to-r from-primary to-emerald-600 text-white font-bold text-sm rounded-xl shadow-md flex items-center gap-2 disabled:opacity-80"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{t('save')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
