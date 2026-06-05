'use client'

import React, { useState, useTransition } from 'react'
import { signIn } from '@/lib/actions/auth.actions'
import { useTranslation } from '@/lib/i18n'
import LanguageSwitcher from '@/components/shared/LanguageSwitcher'
import { Lock, Mail, ShieldAlert, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const { t, lang } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError(t('required'))
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append('email', email)
      formData.append('password', password)

      const result = await signIn(formData)
      if (result && result.error) {
        setError(result.error)
        toast.error(result.error)
      } else {
        toast.success(t('loginSuccess'))
      }
    })
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background px-4">
      {/* Decorative backdrop blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40rem] h-[40rem] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[35rem] h-[35rem] rounded-full bg-secondary/5 blur-[100px] pointer-events-none" />

      {/* Language Switcher in Header */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageSwitcher />
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md z-10 animate-fade-in-up">
        {/* Branding header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-primary to-primary/80 text-white shadow-xl shadow-primary/20 mb-4 transform hover:rotate-6 transition-all duration-300">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-emerald-600 to-secondary bg-clip-text text-transparent">
            {t('appName')}
          </h1>
          <p className="text-muted-foreground text-sm font-medium mt-1 uppercase tracking-wider">
            {t('appTagline')}
          </p>
        </div>

        {/* Form panel */}
        <div className="glass p-8 rounded-3xl shadow-2xl shadow-primary/5 border border-white/20 dark:border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-secondary to-primary" />
          
          <div className="mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {t('loginTitle')}
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              {t('loginSubtitle')}
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium mb-6 animate-pulse-subtle">
              <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                {t('email')}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground pointer-events-none">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@equb.com"
                  className="w-full pl-11 pr-4 py-3 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-medium transition-all duration-200 outline-none"
                  disabled={isPending}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                {t('password')}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground pointer-events-none">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-medium transition-all duration-200 outline-none"
                  disabled={isPending}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/95 hover:to-emerald-600/95 text-white text-sm font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 mt-4 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>{t('signingIn')}</span>
                </>
              ) : (
                <span>{t('signIn')}</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
