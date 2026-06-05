'use client'

import { formatEthDate } from '@/lib/ethiopian-date'
import { useTranslation } from '@/lib/i18n'
import { Calendar } from 'lucide-react'

interface EthiopianDateDisplayProps {
  date: Date | string
  includeYear?: boolean
  showIcon?: boolean
  className?: string
}

export default function EthiopianDateDisplay({
  date,
  includeYear = true,
  showIcon = true,
  className = '',
}: EthiopianDateDisplayProps) {
  const { lang } = useTranslation()
  
  if (!date) return null

  const formatted = formatEthDate(date, lang, includeYear)

  return (
    <div className={`inline-flex items-center gap-1.5 font-medium ${className}`}>
      {showIcon && <Calendar className="w-4 h-4 text-primary" />}
      <span>{formatted}</span>
    </div>
  )
}
