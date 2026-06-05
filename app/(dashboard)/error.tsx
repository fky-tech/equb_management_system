'use client'

import React, { useEffect } from 'react'
import { AlertTriangle, RotateCcw } from 'lucide-react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Dashboard error caught:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[50vh] glass rounded-3xl border border-destructive/20 bg-destructive/5">
      <div className="p-4 rounded-full bg-destructive/15 text-destructive mb-4">
        <AlertTriangle className="w-10 h-10" />
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-foreground">
        Failed to load content
      </h2>
      <p className="mt-1.5 text-sm text-muted-foreground max-w-md">
        An error occurred while loading this section of the dashboard.
      </p>
      
      <p className="mt-1 text-xs text-muted-foreground/75 italic font-medium max-w-md">
        ይህንን የዳሽቦርድ ክፍል ለመጫን ሲሞከር ስህተት አጋጥሟል።
      </p>

      {error.digest && (
        <span className="mt-3 px-2 py-1 bg-muted/60 rounded-lg text-[10px] font-mono text-muted-foreground">
          Code: {error.digest}
        </span>
      )}

      <button
        onClick={() => reset()}
        className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-destructive text-white hover:bg-destructive/90 transition-all font-semibold shadow-md active:scale-98"
      >
        <RotateCcw className="w-4 h-4" />
        <span>Try Again / እንደገና ሞክር</span>
      </button>
    </div>
  )
}
