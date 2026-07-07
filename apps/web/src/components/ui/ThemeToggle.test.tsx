import { renderToString } from 'react-dom/server'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { ThemeToggle } from './ThemeToggle'

describe('ThemeToggle', () => {
  it('renders stable markup before the client theme is known', () => {
    const html = renderToString(<ThemeToggle theme={undefined} onToggle={vi.fn()} />)

    expect(html).toContain('aria-label="切换主题"')
  })
})
