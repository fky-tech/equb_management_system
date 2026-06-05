'use client'

import React from 'react'
import {
  Users,
  UserCheck,
  Layers,
  Receipt,
  CircleAlert,
  LayoutDashboard,
  DollarSign,
  BarChart3,
  History,
  CheckCircle,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react'

// Map of icon name strings to actual components — avoids passing
// React component references across the Server → Client boundary.
const iconMap: Record<string, LucideIcon> = {
  Users,
  UserCheck,
  Layers,
  Receipt,
  CircleAlert,
  LayoutDashboard,
  DollarSign,
  BarChart3,
  History,
  CheckCircle,
  AlertCircle,
}

interface StatCardProps {
  title: string
  value: string | number
  iconName: string          // icon name string, NOT a component reference
  description?: string
  trend?: {
    value: string | number
    label: string
    isPositive?: boolean
  }
  color?: 'primary' | 'secondary' | 'info' | 'destructive'
}

export default function StatCard({
  title,
  value,
  iconName,
  description,
  trend,
  color = 'primary',
}: StatCardProps) {
  const Icon = iconMap[iconName] ?? LayoutDashboard

  const colorMap = {
    primary: 'from-primary/10 to-primary/5 border-primary/20 text-primary',
    secondary: 'from-secondary/15 to-secondary/5 border-secondary/20 text-secondary-foreground',
    info: 'from-cyan-500/10 to-cyan-500/5 border-cyan-500/20 text-cyan-600 dark:text-cyan-400',
    destructive: 'from-destructive/10 to-destructive/5 border-destructive/20 text-destructive',
  }

  const bgIconMap = {
    primary: 'bg-primary/20 text-primary',
    secondary: 'bg-secondary/20 text-secondary-foreground',
    info: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400',
    destructive: 'bg-destructive/20 text-destructive',
  }

  return (
    <div className={`glass p-6 rounded-3xl border border-white/20 dark:border-white/5 relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/5 flex flex-col justify-between`}>
      {/* Background radial accent */}
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br ${colorMap[color]} opacity-20 blur-xl pointer-events-none`} />

      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <h3 className="text-3xl font-extrabold tracking-tight text-foreground">
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-2xl ${bgIconMap[color]} shadow-inner`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {(description || trend) && (
        <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-xs font-medium text-muted-foreground">
          {description && <span>{description}</span>}
          {trend && (
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${
              trend.isPositive 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
            }`}>
              {trend.isPositive ? '+' : ''}{trend.value} {trend.label}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
