'use client'

import React from 'react'
import LanguageSwitcher from '../shared/LanguageSwitcher'
import { useTranslation } from '@/lib/i18n'
import { Menu, User, CalendarDays } from 'lucide-react'
import EthiopianDateDisplay from '../calendar/EthiopianDateDisplay'

interface HeaderProps {
  userName: string
  role: string
  onMenuClick: () => void
}

export default function Header({ userName, role, onMenuClick }: HeaderProps) {
  const { t } = useTranslation()

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  // Amharic greetings
  const getGreetingAm = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'እንደምን አደሩ'
    if (hour < 18) return 'እንደምን ዋሉ'
    return 'እንደምን አመሹ'
  }

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-6">
      {/* Left side: Hamburger (Mobile) + Title / Greeting */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-lg hover:bg-muted text-muted-foreground lg:hidden transition-colors"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <h2 className="text-sm font-medium text-muted-foreground capitalize">
            {role === 'admin' ? t('admin') : role === 'collector' ? t('collector') : t('contributor')}
          </h2>
          <p className="text-base font-bold text-foreground">
            {t('loginTitle')}, {userName}!
          </p>
        </div>
      </div>

      {/* Right side: Ethiopian Date + Language Switcher + User Profile Avatar */}
      <div className="flex items-center gap-4">
        {/* Ethiopian Date Display (header-specific styling) */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/5 text-primary border border-primary/10 text-xs font-semibold">
          <CalendarDays className="w-4 h-4" />
          <EthiopianDateDisplay date={new Date()} includeYear={false} showIcon={false} />
        </div>

        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* User Info / Avatar */}
        <div className="flex items-center gap-2 border-l border-border pl-4">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-emerald-600 flex items-center justify-center text-white font-bold text-xs shadow-sm shadow-primary/10 uppercase">
            {userName ? userName.charAt(0) : 'U'}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-foreground leading-none">{userName}</p>
            <span className="text-[10px] font-medium text-muted-foreground capitalize">{role}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
