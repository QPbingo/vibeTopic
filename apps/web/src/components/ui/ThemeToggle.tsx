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
      aria-label={theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
      title={theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'}
    >
      {theme === 'dark' ? '☀' : '☾'}
    </button>
  )
}
