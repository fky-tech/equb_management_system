'use client'

import React from 'react'
import Sidebar from './Sidebar'
import { X } from 'lucide-react'

interface MobileSidebarProps {
  role: 'admin' | 'collector' | 'contributor'
  userName: string
  isOpen: boolean
  onClose: () => void
}

export default function MobileSidebar({ role, userName, isOpen, onClose }: MobileSidebarProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      {/* Overlay backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" 
      />

      {/* Drawer content */}
      <div className="fixed inset-y-0 left-0 w-64 max-w-xs bg-sidebar flex flex-col shadow-2xl animate-slide-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-sidebar-accent/50 text-sidebar-foreground/85 hover:bg-sidebar-accent transition-colors z-50 border border-sidebar-border"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Sidebar instance */}
        <div className="flex-1" onClick={onClose}>
          <Sidebar role={role} userName={userName} />
        </div>
      </div>
    </div>
  )
}
