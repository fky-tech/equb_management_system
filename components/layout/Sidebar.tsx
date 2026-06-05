'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/lib/actions/auth.actions'
import { useTranslation, TranslationKeys } from '@/lib/i18n'
import { 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  Layers, 
  BarChart3, 
  DollarSign, 
  Receipt, 
  History, 
  LogOut, 
  Sparkles,
  Calendar,
  ChevronLeft,
  Menu
} from 'lucide-react'
import EthiopianDateDisplay from '../calendar/EthiopianDateDisplay'

interface SidebarProps {
  role: 'admin' | 'collector' | 'contributor'
  userName: string
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

interface NavItem {
  label: TranslationKeys
  href: string
  icon: React.ComponentType<{ className?: string }>
}

export default function Sidebar({ role, userName, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname()
  const { t } = useTranslation()

  const adminItems: NavItem[] = [
    { label: 'dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'collectors', href: '/admin/collectors', icon: UserCheck },
    { label: 'groups', href: '/admin/groups', icon: Layers },
    { label: 'contributors', href: '/admin/contributors', icon: Users },
    { label: 'payouts', href: '/admin/payouts', icon: DollarSign },
    { label: 'reports', href: '/admin/reports', icon: BarChart3 },
  ]

  const collectorItems: NavItem[] = [
    { label: 'dashboard', href: '/collector', icon: LayoutDashboard },
    { label: 'myContributors', href: '/collector/contributors', icon: Users },
    { label: 'contributions', href: '/collector/contributions', icon: Receipt },
  ]

  const contributorItems: NavItem[] = [
    { label: 'dashboard', href: '/contributor', icon: LayoutDashboard },
    { label: 'history', href: '/contributor/history', icon: History },
  ]

  const menuItems = 
    role === 'admin' 
      ? adminItems 
      : role === 'collector' 
        ? collectorItems 
        : contributorItems

  return (
    <aside className={`h-screen bg-sidebar border-r border-sidebar-border text-sidebar-foreground flex flex-col fixed left-0 top-0 z-30 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Sidebar Header / Brand */}
      <div className={`p-6 border-b border-sidebar-border/50 flex items-center justify-between gap-2 ${isCollapsed ? 'justify-center px-4' : ''}`}>
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-primary to-primary/80 text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-emerald-400 to-secondary bg-clip-text text-transparent">
                {t('appName')}
              </h1>
              <span className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                {t('role')}: {t(role)}
              </span>
            </div>
          )}
        </Link>
        {!isCollapsed && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-colors hidden lg:block"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Toggle button when collapsed */}
      {isCollapsed && onToggleCollapse && (
        <div className="py-3 flex justify-center border-b border-sidebar-border/30">
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-xl hover:bg-sidebar-accent text-muted-foreground hover:text-foreground transition-colors"
            title="Expand Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Date & User Info */}
      {!isCollapsed ? (
        <div className="px-6 py-4 border-b border-sidebar-border/30 bg-sidebar-accent/30 flex flex-col gap-1.5">
          <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            {t('today')} ({t('ethiopianCalendar')})
          </div>
          <EthiopianDateDisplay 
            date={new Date()} 
            className="text-sm text-sidebar-foreground/90 font-semibold"
            showIcon={true}
          />
        </div>
      ) : (
        <div className="py-4 border-b border-sidebar-border/30 flex justify-center text-primary" title={t('ethiopianCalendar')}>
          <Calendar className="w-5 h-5" />
        </div>
      )}

      {/* Navigation Menu */}
      <nav className={`flex-1 px-4 py-6 space-y-1.5 overflow-y-auto ${isCollapsed ? 'px-2' : ''}`}>
        {menuItems.map((item) => {
          // Fix active state bug: base route should match exactly, nested routes startWith
          const isActive = item.href === '/admin' || item.href === '/collector' || item.href === '/contributor'
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`)
          
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative group/tooltip flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isCollapsed ? 'justify-center px-0' : ''
              } ${
                isActive
                  ? 'bg-gradient-to-r from-primary to-primary/80 text-white shadow-md shadow-primary/10'
                  : 'text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span>{t(item.label)}</span>}
              
              {/* Tooltip when collapsed */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-sidebar text-sidebar-foreground border border-sidebar-border rounded-lg shadow-lg text-xs font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover/tooltip:opacity-100 group-hover/tooltip:pointer-events-auto transition-all duration-150 z-50">
                  {t(item.label)}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer Profile & Logout */}
      <div className={`p-4 border-t border-sidebar-border/50 flex flex-col gap-3 ${isCollapsed ? 'p-2 items-center' : ''}`}>
        <div className={`flex items-center gap-3 px-2 ${isCollapsed ? 'px-0 justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary/30 to-secondary/30 flex items-center justify-center font-bold text-sm text-primary uppercase border border-primary/20 shrink-0">
            {userName ? userName.charAt(0) : 'U'}
          </div>
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate text-sidebar-foreground">{userName}</p>
              <p className="text-xs text-muted-foreground capitalize truncate">{role}</p>
            </div>
          )}
        </div>

        <button
          onClick={() => signOut()}
          className={`relative group/tooltip w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-all duration-200 outline-none ${
            isCollapsed ? 'justify-center px-0' : ''
          }`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>{t('logout')}</span>}

          {/* Tooltip when collapsed */}
          {isCollapsed && (
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-sidebar text-destructive border border-sidebar-border rounded-lg shadow-lg text-xs font-semibold whitespace-nowrap opacity-0 pointer-events-none group-hover/tooltip:opacity-100 group-hover/tooltip:pointer-events-auto transition-all duration-150 z-50">
              {t('logout')}
            </div>
          )}
        </button>
      </div>
    </aside>
  )
}

