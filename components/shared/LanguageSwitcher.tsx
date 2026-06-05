'use client'

import { useTranslation } from '@/lib/i18n'
import { Globe } from 'lucide-react'

export default function LanguageSwitcher() {
  const { lang, setLang } = useTranslation()

  return (
    <button
      onClick={() => setLang(lang === 'en' ? 'am' : 'en')}
      className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full bg-secondary/10 text-secondary hover:bg-secondary/20 transition-all duration-200 border border-secondary/20 shadow-sm"
      aria-label="Switch Language / ቋንቋ ይቀይሩ"
    >
      <Globe className="w-4 h-4 animate-pulse-subtle" />
      <span>{lang === 'en' ? 'አማርኛ' : 'English'}</span>
    </button>
  )
}
