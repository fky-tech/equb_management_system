'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  fullPage?: boolean
}

export default function LoadingSpinner({
  className = '',
  size = 'md',
  fullPage = false,
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  }

  const spinner = (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Outer gradient glow */}
      <div className={`absolute rounded-full bg-gradient-to-tr from-primary to-secondary opacity-35 blur-lg ${sizeMap[size]}`} />
      
      {/* Actual spinning icon */}
      <Loader2 className={`animate-spin text-primary relative z-10 ${sizeMap[size]}`} />
    </div>
  )

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
        <div className="flex flex-col items-center gap-4">
          {spinner}
          <p className="text-sm font-semibold tracking-wider text-muted-foreground animate-pulse">
            Loading / በመጫን ላይ...
          </p>
        </div>
      </div>
    )
  }

  return spinner
}
