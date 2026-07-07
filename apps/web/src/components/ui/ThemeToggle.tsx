'use client'

import React, { useEffect, useState } from 'react'

interface ThemeToggleProps {
  theme?: string
  onToggle: () => void
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <button className="theme-toggle" aria-label="切换主题" disabled>◫</button>
  }

  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      aria-label="切换主题"
      title="切换主题"
      suppressHydrationWarning
    >
      {theme === 'dark' ? '☀' : '☾'}
    </button>
  )
}
