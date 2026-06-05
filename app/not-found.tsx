import React from 'react'
import Link from 'next/link'
import { Home, SearchX } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-primary/20 opacity-30 blur-2xl w-24 h-24 -translate-x-4 -translate-y-4" />
        <div className="relative p-5 rounded-3xl bg-primary/10 border border-primary/20 text-primary">
          <SearchX className="w-12 h-12" />
        </div>
      </div>

      <h1 className="text-5xl font-extrabold tracking-tight text-foreground">
        404
      </h1>
      <p className="mt-2 text-lg font-semibold text-muted-foreground">
        Page not found
      </p>
      <p className="mt-1 text-sm text-muted-foreground/75 italic max-w-md">
        ይህ ገጽ አልተገኘም! እባክዎ ወደ መነሻ ይመለሱ።
      </p>

      <Link
        href="/"
        className="mt-8 flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-white font-semibold shadow-md shadow-primary/10 hover:opacity-95 transition-all active:scale-95"
      >
        <Home className="w-4 h-4" />
        <span>Back to Home / ወደ መነሻ</span>
      </Link>
    </div>
  )
}
