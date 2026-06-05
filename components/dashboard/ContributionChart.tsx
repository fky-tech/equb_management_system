'use client'

import React from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { useTranslation } from '@/lib/i18n'
import { formatEthDate } from '@/lib/ethiopian-date'

interface ChartDataPoint {
  date: string
  count: number
}

interface ContributionChartProps {
  data: ChartDataPoint[]
  title: string
}

export default function ContributionChart({ data, title }: ContributionChartProps) {
  const { lang, t } = useTranslation()

  // Format dates to Ethiopian for the chart labels
  const formattedData = data.map((d) => {
    try {
      const ethDateStr = formatEthDate(new Date(d.date), lang, false)
      return {
        ...d,
        displayDate: ethDateStr,
      }
    } catch {
      return {
        ...d,
        displayDate: d.date,
      }
    }
  })

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass p-4 rounded-xl border border-border/80 shadow-lg text-sm">
          <p className="font-semibold text-muted-foreground mb-1">{payload[0].payload.displayDate}</p>
          <p className="font-bold text-primary">
            {payload[0].value} {t('contributions')}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="glass p-6 rounded-3xl border border-white/20 dark:border-white/5 relative overflow-hidden flex flex-col gap-4 h-[350px]">
      <h3 className="text-lg font-bold tracking-tight text-foreground">
        {title}
      </h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={formattedData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis
              dataKey="displayDate"
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 500 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 500 }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke="hsl(var(--primary))"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorCount)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
