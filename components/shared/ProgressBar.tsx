'use client'

import React from 'react'

interface ProgressBarProps {
  value: number
  max: number
  label?: string
  color?: 'primary' | 'secondary' | 'info'
}

export default function ProgressBar({
  value,
  max,
  label,
  color = 'primary',
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0

  const barColorMap = {
    primary: 'from-primary to-emerald-500 shadow-primary/20',
    secondary: 'from-secondary to-yellow-500 shadow-secondary/20',
    info: 'from-cyan-500 to-blue-500 shadow-cyan-500/20',
  }

  const textColorMap = {
    primary: 'text-primary',
    secondary: 'text-secondary-foreground',
    info: 'text-cyan-600 dark:text-cyan-400',
  }

  return (
    <div className="w-full space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span>{label}</span>
        <span className={textColorMap[color]}>{percentage}%</span>
      </div>
      
      {/* Outer track */}
      <div className="h-3.5 w-full bg-muted/60 dark:bg-muted/30 rounded-full overflow-hidden border border-border/30 p-0.5">
        {/* Inner track fill with smooth transition and shimmer */}
        <div
          className={`h-full bg-gradient-to-r ${barColorMap[color]} rounded-full shadow-md transition-all duration-500 ease-out relative overflow-hidden`}
          style={{ width: `${percentage}%` }}
        >
          {/* Shimmer overlay effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        </div>
      </div>
      
      {/* Add keyframe style for shimmer in this component */}
      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}
