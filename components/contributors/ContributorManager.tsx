'use client'

import React, { useState, useTransition } from 'react'
import { useTranslation } from '@/lib/i18n'
import SearchFilter from '../shared/SearchFilter'
import { ContributorWithDetails, CollectorWithUser, EqubGroup } from '@/types/database.types'
import { 
  createContributor, 
  updateContributor 
} from '@/lib/actions/contributors.actions'
import { 
  Plus, 
  Edit, 
  User, 
  Phone, 
  Mail, 
  Briefcase, 
  Layers, 
  Award,
  Lock,
  Loader2,
  X,
  UserCheck
} from 'lucide-react'
import { toast } from 'sonner'
import { formatEthDate } from '@/lib/ethiopian-date'

interface ContributorManagerProps {
  initialContributors: ContributorWithDetails[]
  collectors: CollectorWithUser[]
  groups: EqubGroup[]
  currentRole: 'admin' | 'collector'
  currentCollectorId?: string
}

export default function ContributorManager({
  initialContributors,
  collectors,
  groups,
  currentRole,
  currentCollectorId,
}: ContributorManagerProps) {
  const { t, lang } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterGroup, setFilterGroup] = useState('')
  const [filterCollector, setFilterCollector] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingContributor, setEditingContributor] = useState<ContributorWithDetails | null>(null)
  
  const [isPending, startTransition] = useTransition()

  // Form states
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [collectorId, setCollectorId] = useState('')
  const [groupId, setGroupId] = useState('')
  const [payoutPosition, setPayoutPosition] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('active')

  // Filter contributors
  const filteredContributors = initialContributors.filter((c) => {
    const name = c.users?.full_name?.toLowerCase() ?? ''
    const emailStr = c.users?.email?.toLowerCase() ?? ''
    const phoneStr = c.users?.phone ?? ''
    const query = searchQuery.toLowerCase()

    const matchesSearch = name.includes(query) || emailStr.includes(query) || phoneStr.includes(query)
    const matchesGroup = filterGroup ? c.group_id === filterGroup : true
    const matchesCollector = filterCollector ? c.collector_id === filterCollector : true
    const matchesStatus = filterStatus ? c.status === filterStatus : true

    return matchesSearch && matchesGroup && matchesCollector && matchesStatus
  })

  const handleOpenAdd = () => {
    setFullName('')
    setEmail('')
    setPhone('')
    setCollectorId(currentCollectorId ?? '')
    setGroupId('')
    setPayoutPosition('')
    setPassword('')
    setIsAddOpen(true)
  }

  const handleOpenEdit = (contributor: ContributorWithDetails) => {
    setEditingContributor(contributor)
    setFullName(contributor.users?.full_name ?? '')
    setEmail(contributor.users?.email ?? '')
    setPhone(contributor.users?.phone ?? '')
    setCollectorId(contributor.collector_id)
    setGroupId(contributor.group_id)
    setPayoutPosition(contributor.payout_position?.toString() ?? '')
    setStatus(contributor.status)
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const formData = new FormData()
      formData.append('full_name', fullName)
      formData.append('email', email)
      formData.append('phone', phone)
      formData.append('collector_id', collectorId)
      formData.append('group_id', groupId)
      formData.append('payout_position', payoutPosition)
      formData.append('password', password)

      const result = await createContributor(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Contributor registered successfully')
        setIsAddOpen(false)
      }
    })
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingContributor) return

    startTransition(async () => {
      const formData = new FormData()
      formData.append('full_name', fullName)
      formData.append('phone', phone)
      formData.append('collector_id', collectorId)
      formData.append('group_id', groupId)
      formData.append('payout_position', payoutPosition)
      formData.append('status', status)

      const result = await updateContributor(editingContributor.id, formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Contributor details updated')
        setEditingContributor(null)
      }
    })
  }

  // Filter options for search toolbar
  const groupOptions = groups.map(g => ({ value: g.id, label: g.name }))
  const collectorOptions = collectors.map(c => ({ value: c.id, label: c.users?.full_name ?? '' }))
  const statusOptions = [
    { value: 'active', label: t('active') },
    { value: 'inactive', label: t('inactive') },
    { value: 'completed', label: t('completed') }
  ]

  const filters = [
    {
      name: 'group',
      value: filterGroup,
      options: groupOptions,
      placeholder: t('filterByGroup'),
      onChange: setFilterGroup,
    },
    {
      name: 'status',
      value: filterStatus,
      options: statusOptions,
      placeholder: t('filterByStatus'),
      onChange: setFilterStatus,
    }
  ]

  // Add collector filter for Admin only
  if (currentRole === 'admin') {
    filters.splice(1, 0, {
      name: 'collector',
      value: filterCollector,
      options: collectorOptions,
      placeholder: t('filterByCollector'),
      onChange: setFilterCollector,
    })
  }

  const handleClearFilters = () => {
    setFilterGroup('')
    setFilterCollector('')
    setFilterStatus('')
    setSearchQuery('')
  }

  const hasActiveFilters = filterGroup !== '' || filterCollector !== '' || filterStatus !== '' || searchQuery !== ''

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            {t('contributors')}
          </h1>
          <p className="text-muted-foreground text-sm">
            {currentRole === 'admin' 
              ? 'View all registered Equb contributors and assign cycles.' 
              : 'Register and manage contributors assigned to your collection route.'
            }
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/95 hover:to-emerald-600/95 text-white font-bold text-sm rounded-xl shadow-md shadow-primary/10 transition-all active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          <span>{t('addContributor')}</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder={t('searchByName')}
        filters={filters}
        showClear={hasActiveFilters}
        onClear={handleClearFilters}
      />

      {/* Contributors Table */}
      <div className="glass rounded-3xl border border-white/20 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t('contributor')}
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t('group')}
                </th>
                {currentRole === 'admin' && (
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {t('collector')}
                  </th>
                )}
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-center">
                  {t('payoutPosition')}
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t('joinDate')}
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t('status')}
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredContributors.length > 0 ? (
                filteredContributors.map((c) => {
                  const name = c.users?.full_name ?? 'Unknown'
                  const emailStr = c.users?.email ?? ''
                  const phoneStr = c.users?.phone ?? ''
                  const groupName = c.equb_groups?.name ?? '—'
                  const collectorName = c.collectors?.users?.full_name ?? '—'
                  const payoutPos = c.payout_position ?? '—'
                  const dateStr = formatEthDate(new Date(c.joined_at), lang, true)

                  return (
                    <tr key={c.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary/10 to-primary/5 text-primary flex items-center justify-center font-bold border border-primary/10">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{name}</p>
                            <p className="text-xs text-muted-foreground">{phoneStr} {emailStr ? `• ${emailStr}` : ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4.5 text-sm font-semibold text-foreground">
                        {groupName}
                      </td>
                      {currentRole === 'admin' && (
                        <td className="px-6 py-4.5 text-sm font-medium text-muted-foreground">
                          {collectorName}
                        </td>
                      )}
                      <td className="px-6 py-4.5 text-sm font-bold text-foreground text-center">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-secondary/10 text-secondary-foreground">
                          {payoutPos}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-sm font-medium text-muted-foreground">
                        {dateStr}
                      </td>
                      <td className="px-6 py-4.5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          c.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : c.status === 'completed'
                              ? 'bg-secondary/15 text-secondary-foreground'
                              : 'bg-muted text-muted-foreground'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            c.status === 'active' 
                              ? 'bg-emerald-500' 
                              : c.status === 'completed' 
                                ? 'bg-secondary' 
                                : 'bg-muted-foreground'
                          }`} />
                          {t(c.status as any)}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
                          title={t('edit')}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan={currentRole === 'admin' ? 7 : 6} className="px-6 py-12 text-center text-muted-foreground text-sm font-medium">
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

            <h3 className="text-xl font-bold text-foreground mb-1">{t('addContributor')}</h3>
            <p className="text-xs text-muted-foreground mb-6">Register a participant to a specific Equb savings group.</p>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  {t('contributorName')}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Kebede Balcha"
                    className="w-full pl-11 pr-4 py-2.5 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-medium transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {t('contributorEmail')}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="kebede@gmail.com"
                      className="w-full pl-11 pr-4 py-2.5 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-medium transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {t('contributorPhone')}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+251911223344"
                      className="w-full pl-11 pr-4 py-2.5 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-medium transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {t('equbGroup')}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
                      <Layers className="w-4 h-4" />
                    </span>
                    <select
                      required
                      value={groupId}
                      onChange={(e) => setGroupId(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-semibold transition-all cursor-pointer outline-none"
                    >
                      <option value="">Select Group</option>
                      {groups.filter(g => g.is_active).map(g => (
                        <option key={g.id} value={g.id}>{g.name} ({g.contribution_amount} ETB)</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  {currentRole === 'admin' ? (
                    <>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        {t('assignedCollector')}
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
                          <UserCheck className="w-4 h-4" />
                        </span>
                        <select
                          required
                          value={collectorId}
                          onChange={(e) => setCollectorId(e.target.value)}
                          className="w-full pl-11 pr-4 py-2.5 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-semibold transition-all cursor-pointer outline-none"
                        >
                          <option value="">Select Collector</option>
                          {collectors.filter(c => c.users?.is_active).map(c => (
                            <option key={c.id} value={c.id}>{c.users?.full_name}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  ) : (
                    // Readonly input representing the collector registering them
                    <>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                        {t('assignedCollector')}
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
                          <UserCheck className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          disabled
                          value={collectors.find(c => c.id === currentCollectorId)?.users?.full_name ?? ''}
                          className="w-full pl-11 pr-4 py-2.5 bg-muted/20 border border-border rounded-xl text-sm font-medium opacity-80"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {t('payoutPos')} (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
                      <Award className="w-4 h-4" />
                    </span>
                    <input
                      type="number"
                      min="1"
                      value={payoutPosition}
                      onChange={(e) => setPayoutPosition(e.target.value)}
                      placeholder="e.g. 5"
                      className="w-full pl-11 pr-4 py-2.5 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-medium transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {t('password')}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
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

      {/* Edit Modal */}
      {editingContributor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingContributor(null)} />
          <div className="glass w-full max-w-lg rounded-3xl border border-white/20 dark:border-white/5 p-6 shadow-2xl relative z-10 animate-fade-in-up">
            <button
              onClick={() => setEditingContributor(null)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-foreground mb-1">{t('editContributor')}</h3>
            <p className="text-xs text-muted-foreground mb-6">Modify contributor status and cycle properties.</p>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  {t('contributorName')}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-medium transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {t('contributorPhone')}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-medium transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {t('contributorStatus')}
                  </label>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-4 py-2.5 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-semibold transition-all cursor-pointer outline-none"
                    >
                      <option value="active">{t('active')}</option>
                      <option value="inactive">{t('inactive')}</option>
                      <option value="completed">{t('completed')}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {t('equbGroup')}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
                      <Layers className="w-4 h-4" />
                    </span>
                    <select
                      required
                      value={groupId}
                      onChange={(e) => setGroupId(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-semibold transition-all cursor-pointer outline-none"
                    >
                      {groups.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {t('assignedCollector')}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
                      <UserCheck className="w-4 h-4" />
                    </span>
                    <select
                      required
                      value={collectorId}
                      onChange={(e) => setCollectorId(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-semibold transition-all cursor-pointer outline-none"
                    >
                      {collectors.map(c => (
                        <option key={c.id} value={c.id}>{c.users?.full_name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  {t('payoutPos')}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
                    <Award className="w-4 h-4" />
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={payoutPosition}
                    onChange={(e) => setPayoutPosition(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-medium transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setEditingContributor(null)}
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
