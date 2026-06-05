'use client'

import React, { useEffect } from 'react'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'
import Link from 'next/link'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error('Unhandled app router error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-6">
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-destructive/20 opacity-30 blur-2xl w-24 h-24 -translate-x-4 -translate-y-4" />
        <div className="relative p-5 rounded-3xl bg-destructive/15 border border-destructive/20 text-destructive">
          <AlertTriangle className="w-12 h-12" />
        </div>
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
        Something went wrong!
      </h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-md">
        An error occurred while loading this page. Please try again or return to home.
      </p>
      
      <p className="mt-1 text-xs text-muted-foreground/75 italic font-medium max-w-md">
        ያልተጠበቀ ችግር አጋጥሟል! እባክዎ እንደገና ይሞክሩ ወይም ወደ መነሻ ይመለሱ።
      </p>

      {error.digest && (
        <div className="mt-4 px-3 py-1.5 bg-muted/65 rounded-xl text-[10px] font-mono text-muted-foreground border border-border/30">
          Digest ID: {error.digest}
        </div>
      )}

      <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-primary/80 text-white font-semibold shadow-md shadow-primary/10 hover:opacity-95 transition-all active:scale-98"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Try Again / እንደገና ሞክር</span>
        </button>

        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-secondary/10 text-secondary hover:bg-secondary/20 font-semibold border border-secondary/25 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Home / መነሻ</span>
        </Link>
      </div>
    </div>
  )
}
