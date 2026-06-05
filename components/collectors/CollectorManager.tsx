'use client'

import React, { useState, useTransition } from 'react'
import { useTranslation } from '@/lib/i18n'
import SearchFilter from '../shared/SearchFilter'
import { CollectorWithUser } from '@/types/database.types'
import { 
  createCollector, 
  updateCollector, 
  toggleCollectorStatus 
} from '@/lib/actions/collectors.actions'
import { 
  Plus, 
  Edit, 
  Power, 
  User, 
  Phone, 
  Mail, 
  Briefcase, 
  Lock,
  Loader2,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import { formatEthDate } from '@/lib/ethiopian-date'

interface CollectorManagerProps {
  initialCollectors: CollectorWithUser[]
}

export default function CollectorManager({ initialCollectors }: CollectorManagerProps) {
  const { t, lang } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingCollector, setEditingCollector] = useState<CollectorWithUser | null>(null)
  
  const [isPending, startTransition] = useTransition()

  // Form states
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [employeeCode, setEmployeeCode] = useState('')
  const [password, setPassword] = useState('')

  // Filter collectors
  const filteredCollectors = initialCollectors.filter((c) => {
    const name = c.users?.full_name?.toLowerCase() ?? ''
    const emailStr = c.users?.email?.toLowerCase() ?? ''
    const phoneStr = c.users?.phone ?? ''
    const code = c.employee_code?.toLowerCase() ?? ''
    const query = searchQuery.toLowerCase()

    return (
      name.includes(query) ||
      emailStr.includes(query) ||
      phoneStr.includes(query) ||
      code.includes(query)
    )
  })

  const handleOpenAdd = () => {
    setFullName('')
    setEmail('')
    setPhone('')
    setEmployeeCode('')
    setPassword('')
    setIsAddOpen(true)
  }

  const handleOpenEdit = (collector: CollectorWithUser) => {
    setEditingCollector(collector)
    setFullName(collector.users?.full_name ?? '')
    setEmail(collector.users?.email ?? '')
    setPhone(collector.users?.phone ?? '')
    setEmployeeCode(collector.employee_code ?? '')
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const formData = new FormData()
      formData.append('full_name', fullName)
      formData.append('email', email)
      formData.append('phone', phone)
      formData.append('employee_code', employeeCode)
      formData.append('password', password)

      const result = await createCollector(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Collector created successfully')
        setIsAddOpen(false)
      }
    })
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCollector) return

    startTransition(async () => {
      const formData = new FormData()
      formData.append('full_name', fullName)
      formData.append('phone', phone)
      formData.append('employee_code', employeeCode)

      const result = await updateCollector(editingCollector.id, formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Collector updated successfully')
        setEditingCollector(null)
      }
    })
  }

  const handleToggleStatus = (collector: CollectorWithUser) => {
    const isCurrentActive = collector.users?.is_active ?? true
    startTransition(async () => {
      const result = await toggleCollectorStatus(collector.id, isCurrentActive)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(
          isCurrentActive
            ? 'Collector deactivated successfully'
            : 'Collector activated successfully'
        )
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
            {t('collectors')}
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage collectors, assign routes, and monitor collection statuses.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/95 hover:to-emerald-600/95 text-white font-bold text-sm rounded-xl shadow-md shadow-primary/10 transition-all active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          <span>{t('addCollector')}</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder={t('searchByName')}
      />

      {/* Collectors Table */}
      <div className="glass rounded-3xl border border-white/20 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t('collectorName')}
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t('employeeCode')}
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t('collectorPhone')}
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t('createdAt')}
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {t('collectorStatus')}
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredCollectors.length > 0 ? (
                filteredCollectors.map((collector) => {
                  const isActive = collector.users?.is_active ?? true
                  const dateStr = formatEthDate(new Date(collector.created_at), lang, true)

                  return (
                    <tr key={collector.id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary/10 to-primary/5 text-primary flex items-center justify-center font-bold border border-primary/10">
                            {collector.users?.full_name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              {collector.users?.full_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {collector.users?.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4.5 text-sm font-semibold text-foreground">
                        {collector.employee_code ?? '—'}
                      </td>
                      <td className="px-6 py-4.5 text-sm font-medium text-muted-foreground">
                        {collector.users?.phone}
                      </td>
                      <td className="px-6 py-4.5 text-sm font-medium text-muted-foreground">
                        {dateStr}
                      </td>
                      <td className="px-6 py-4.5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          isActive
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-destructive/10 text-destructive'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-destructive'}`} />
                          {isActive ? t('enabled') : t('disabled')}
                        </span>
                      </td>
                      <td className="px-6 py-4.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(collector)}
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-colors"
                            title={t('edit')}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(collector)}
                            className={`p-2 rounded-xl transition-colors ${
                              isActive
                                ? 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                                : 'text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10'
                            }`}
                            title={isActive ? t('deactivateCollector') : t('activateCollector')}
                          >
                            <Power className="w-4 h-4" />
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

            <h3 className="text-xl font-bold text-foreground mb-1">{t('addCollector')}</h3>
            <p className="text-xs text-muted-foreground mb-6">Create a new collector account with system credentials.</p>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  {t('collectorName')}
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
                    placeholder="e.g. Almaz Kebede"
                    className="w-full pl-11 pr-4 py-2.5 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-medium transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {t('collectorEmail')}
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
                      placeholder="almaz@equb.com"
                      className="w-full pl-11 pr-4 py-2.5 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-medium transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {t('collectorPhone')}
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
                      placeholder="+251912345678"
                      className="w-full pl-11 pr-4 py-2.5 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-medium transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    {t('employeeCode')}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
                      <Briefcase className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={employeeCode}
                      onChange={(e) => setEmployeeCode(e.target.value)}
                      placeholder="COL-001"
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
      {editingCollector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingCollector(null)} />
          <div className="glass w-full max-w-lg rounded-3xl border border-white/20 dark:border-white/5 p-6 shadow-2xl relative z-10 animate-fade-in-up">
            <button
              onClick={() => setEditingCollector(null)}
              className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-foreground mb-1">{t('editCollector')}</h3>
            <p className="text-xs text-muted-foreground mb-6">Modify collector registry properties.</p>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  {t('collectorName')}
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
                    {t('collectorPhone')}
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
                    {t('employeeCode')}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground">
                      <Briefcase className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={employeeCode}
                      onChange={(e) => setEmployeeCode(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-medium transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setEditingCollector(null)}
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
