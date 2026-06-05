'use client'

import React from 'react'
import { useTranslation } from '@/lib/i18n'
import { Search, X } from 'lucide-react'

interface FilterOption {
  value: string
  label: string
}

interface SearchFilterProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  placeholder?: string
  
  // Optional select filters
  filters?: {
    name: string
    value: string
    options: FilterOption[]
    placeholder: string
    onChange: (value: string) => void
  }[]
  
  onClear?: () => void
  showClear?: boolean
}

export default function SearchFilter({
  searchQuery,
  onSearchChange,
  placeholder,
  filters = [],
  onClear,
  showClear = false,
}: SearchFilterProps) {
  const { t } = useTranslation()

  return (
    <div className="glass p-4 rounded-3xl border border-white/20 dark:border-white/5 flex flex-col md:flex-row gap-4 items-center">
      {/* Search Input */}
      <div className="relative w-full md:flex-1">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-muted-foreground pointer-events-none">
          <Search className="w-5 h-5" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder ?? t('search')}
          className="w-full pl-11 pr-4 py-2.5 bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary rounded-xl text-sm font-medium transition-all duration-200 outline-none"
        />
      </div>

      {/* Select Filters */}
      {filters.length > 0 && (
        <div className="flex flex-wrap gap-3 w-full md:w-auto items-center justify-end">
          {filters.map((filter) => (
            <select
              key={filter.name}
              value={filter.value}
              onChange={(e) => filter.onChange(e.target.value)}
              className="bg-muted/40 hover:bg-muted/60 focus:bg-background border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 outline-none cursor-pointer"
            >
              <option value="">{filter.placeholder}</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ))}

          {/* Clear Filters Button */}
          {showClear && onClear && (
            <button
              onClick={onClear}
              className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-bold text-destructive hover:bg-destructive/10 rounded-xl transition-all duration-200"
            >
              <X className="w-4 h-4" />
              <span>{t('clearFilters')}</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
