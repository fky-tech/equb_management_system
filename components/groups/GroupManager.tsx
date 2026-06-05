'use client'

import React, { useState, useTransition } from 'react'
import { useTranslation } from '@/lib/i18n'
import SearchFilter from '../shared/SearchFilter'
import { EqubGroup } from '@/types/database.types'
import { 
  createGroup, 
  updateGroup, 
  toggleGroupStatus 
} from '@/lib/actions/groups.actions'
import { 
  Plus, 
  Edit, 
  Power, 
  Layers, 
  DollarSign, 
  Calendar, 
  FileText,
  Loader2,
  X,
  Sparkles,
  Percent
} from 'lucide-react'
import { toast } from 'sonner'
import { formatEthDate } from '@/lib/ethiopian-date'

interface GroupManagerProps {
  initialGroups: EqubGroup[]
}

export default function GroupManager({ initialGroups }: GroupManagerProps) {
  const { t, lang } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<EqubGroup | null>(null)
  
  const [isPending, startTransition] = useTransition()

  // Form states
  const [name, setName] = useState('')
  const [contributionAmount, setContributionAmount] = useState('')
  const [totalDays, setTotalDays] = useState('')
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [startDate, setStartDate] = useState('')
  const [description, setDescription] = useState('')

  // Filter groups
  const filteredGroups = initialGroups.filter((g) => {
    const groupName = g.name.toLowerCase()
    const desc = g.description?.toLowerCase() ?? ''
    const query = searchQuery.toLowerCase()

    return groupName.includes(query) || desc.includes(query)
  })

  const handleOpenAdd = () => {
    setName('')
    setContributionAmount('')
    setTotalDays('')
    setFrequency('daily')
    setStartDate(new Date().toISOString().split('T')[0])
    setDescription('')
    setIsAddOpen(true)
  }

  const handleOpenEdit = (group: EqubGroup) => {
    setEditingGroup(group)
    setName(group.name)
    setContributionAmount(group.contribution_amount.toString())
    setTotalDays(group.total_days.toString())
    setFrequency(group.frequency || 'daily')
    setStartDate(group.start_date ? group.start_date.split('T')[0] : '')
    setDescription(group.description ?? '')
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('contribution_amount', contributionAmount)
      formData.append('total_days', totalDays)
      formData.append('frequency', frequency)
      formData.append('start_date', startDate)
      formData.append('description', description)

      const result = await createGroup(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Equb group created successfully')
        setIsAddOpen(false)
      }
    })
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingGroup) return

    startTransition(async () => {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('contribution_amount', contributionAmount)
      formData.append('total_days', totalDays)
      formData.append('frequency', frequency)
      formData.append('start_date', startDate)
      formData.append('description', description)

      const result = await updateGroup(editingGroup.id, formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Equb group updated successfully')
        setEditingGroup(null)
      }
    })
  }

  const handleToggleStatus = (group: EqubGroup) => {
    startTransition(async () => {
      const result = await toggleGroupStatus(group.id, group.is_active)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(
          group.is_active
            ? 'Group deactivated successfully'
            : 'Group activated successfully'
        )
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            {t('groups')}
          </h1>
          <p className="text-muted-foreground text-sm">
            Configure Equb pools, daily contribution rates, and cycles.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/95 hover:to-emerald-600/95 text-white font-bold text-sm rounded-xl shadow-md shadow-primary/10 transition-all active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          <span>{t('addGroup')}</span>
        </button>
      </div>

      {/* Filters */}
      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search groups by name..."
      />

      {/* Grid of Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.length > 0 ? (
          filteredGroups.map((group) => {
            const totalPool = group.contribution_amount * group.total_days
            
            return (
              <div
                key={group.id}
                className="glass p-6 rounded-3xl border border-white/20 dark:border-white/5 relative overflow-hidden flex flex-col justify-between hover:scale-[1.01] hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
              >
                {/* Gold/Green top banner gradient */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                  group.is_active 
                    ? 'bg-gradient-to-r from-primary via-emerald-500 to-secondary' 
                    : 'bg-muted'
                }`} />

                <div className="space-y-4">
                  {/* Title and Badge */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-extrabold tracking-tight text-foreground truncate max-w-[180px]">
                        {group.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {group.description ?? 'No description'}
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      group.is_active
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-destructive/10 text-destructive'
                    }`}>
                      {group.is_active ? t('activeGroup') : t('inactiveGroup')}
                    </span>
                  </div>

                  {/* Financial Stats */}
                  <div className="grid grid-cols-2 gap-4 p-3 rounded-2xl bg-muted/30 border border-border/40">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">
                        {t('contributionAmount')}
                      </span>
                      <p className="text-base font-extrabold text-foreground">
                        {group.contribution_amount.toLocaleString()} <span className="text-xs font-semibold">{t('birr')}</span>
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">
                        {t('totalDays')}
                      </span>
                      <p className="text-base font-extrabold text-foreground">
                        {group.total_days} <span className="text-xs font-semibold">{t('days')}</span>
                      </p>
                    </div>
                  </div>

                  {/* Frequency & Start Date */}
                  <div className="grid grid-cols-2 gap-4 py-1 text-xs border-t border-border/20">
                    <div>
                      <span className="text-muted-foreground font-medium">{t('frequency')}:</span>{' '}
                      <span className="font-bold text-foreground capitalize">{t(group.frequency || 'daily')}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground font-medium">{t('startDate')}:</span>{' '}
                      <span className="font-bold text-foreground">
                        {group.start_date ? formatEthDate(new Date(group.start_date), lang, false) : '—'}
                      </span>
                    </div>
                  </div>

                  {/* Pool value */}
                  <div className="flex items-center justify-between py-2 border-t border-border/40 text-xs">
                    <span className="text-muted-foreground font-medium">Payout Value:</span>
                    <span className="font-extrabold text-primary text-sm">
                      {totalPool.toLocaleString()} {t('birr')}
                    </span>
                  </div>
                </div>

                {/* Card footer actions */}
                <div className="flex items-center justify-end gap-2 mt-6 pt-4 border-t border-border/40">
                  <button
                    onClick={() => handleOpenEdit(group)}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all border border-border"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>{t('edit')}</span>
                  </button>
                  <button
                    onClick={() => handleToggleStatus(group)}
                    className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all border ${
                      group.is_active
                        ? 'text-destructive border-destructive/20 hover:bg-destructive/10'
                        : 'text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/10'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{group.is_active ? t('deactivateCollector') : t('activateCollector')}</span>
                  </button>
                </div>
              </div>
            )
          })
        ) : (
          <div className="col-span-full py-16 text-center text-muted-foreground text-sm font-medium glass border border-border/30 rounded-3xl">
            <Layers className="w-12 h-12 opacity-20 mx-auto mb-3" />
            <span>No groups match search criteria</span>
          </div>
        )}
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

            <h3 className="text-xl font-bold text-foreground mb-1">{t('addGroup')}</h3>
            <p className="text-xs text-muted-foreground mb-6">Create a new Equb savings pool structure.</p>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  {t('groupName')}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
                    <Layers className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Merkato Trader Daily"
                    className="w-full pl-11 pr-4 py-2.5 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-medium transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {t('contributionAmount')}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
                      <DollarSign className="w-4 h-4" />
                    </span>
                    <input
                      type="number"
                      required
                      min="1"
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full pl-11 pr-4 py-2.5 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-medium transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {t('totalDays')}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                    </span>
                    <input
                      type="number"
                      required
                      min="1"
                      value={totalDays}
                      onChange={(e) => setTotalDays(e.target.value)}
                      placeholder="e.g. 100"
                      className="w-full pl-11 pr-4 py-2.5 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-medium transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Frequency and Start Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {t('frequency')}
                  </label>
                  <select
                    required
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly' | 'monthly')}
                    className="w-full px-4 py-2.5 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-semibold transition-all cursor-pointer outline-none"
                  >
                    <option value="daily">{t('daily')}</option>
                    <option value="weekly">{t('weekly')}</option>
                    <option value="monthly">{t('monthly')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {t('startDate')}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                    </span>
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-medium transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  {t('description')}
                </label>
                <div className="relative">
                  <span className="absolute top-3 left-3.5 text-muted-foreground">
                    <FileText className="w-4 h-4" />
                  </span>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of group criteria..."
                    rows={3}
                    className="w-full pl-11 pr-4 py-2.5 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-medium transition-all outline-none resize-none"
                  />
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

      {/* Edit Modal */}
      {editingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingGroup(null)} />
          <div className="glass w-full max-w-lg rounded-3xl border border-white/20 dark:border-white/5 p-6 shadow-2xl relative z-10 animate-fade-in-up">
            <button
              onClick={() => setEditingGroup(null)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-foreground mb-1">{t('editGroup')}</h3>
            <p className="text-xs text-muted-foreground mb-6">Modify Equb pool configurations.</p>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  {t('groupName')}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
                    <Layers className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-medium transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {t('contributionAmount')}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
                      <DollarSign className="w-4 h-4" />
                    </span>
                    <input
                      type="number"
                      required
                      min="1"
                      value={contributionAmount}
                      onChange={(e) => setContributionAmount(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-medium transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {t('totalDays')}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                    </span>
                    <input
                      type="number"
                      required
                      min="1"
                      value={totalDays}
                      onChange={(e) => setTotalDays(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-medium transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  {t('description')}
                </label>
                <div className="relative">
                  <span className="absolute top-3 left-3.5 text-muted-foreground">
                    <FileText className="w-4 h-4" />
                  </span>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full pl-11 pr-4 py-2.5 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-medium transition-all outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setEditingGroup(null)}
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
