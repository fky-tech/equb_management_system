'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { en, TranslationKeys } from './en'
import { am } from './am'

type Language = 'en' | 'am'
type Translations = Record<TranslationKeys, string>

interface I18nContextType {
  lang: Language
  t: (key: TranslationKeys) => string
  setLang: (lang: Language) => void
  isAmharic: boolean
}

const translations: Record<Language, Translations> = { en, am }

const I18nContext = createContext<I18nContextType>({
  lang: 'en',
  t: (key) => en[key],
  setLang: () => {},
  isAmharic: false,
})

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en')

  useEffect(() => {
    const stored = localStorage.getItem('equb_lang') as Language | null
    if (stored && (stored === 'en' || stored === 'am')) {
      setLangState(stored)
    }
  }, [])

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang)
    localStorage.setItem('equb_lang', newLang)
  }, [])

  const t = useCallback(
    (key: TranslationKeys): string => {
      return translations[lang][key] ?? translations.en[key] ?? key
    },
    [lang]
  )

  return (
    <I18nContext.Provider value={{ lang, t, setLang, isAmharic: lang === 'am' }}>
      <div className={lang === 'am' ? 'font-amharic' : ''}>
        {children}
      </div>
    </I18nContext.Provider>
  )
}

export function useTranslation() {
  return useContext(I18nContext)
}

export type { Language, TranslationKeys }
