// @vitest-environment jsdom
import { renderToString } from 'react-dom/server'
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ThemeToggle } from './ThemeToggle'

describe('ThemeToggle', () => {
  it('renders stable markup before the client theme is known', () => {
    const html = renderToString(<ThemeToggle theme={undefined} onToggle={vi.fn()} />)

    expect(html).toContain('aria-label="切换主题"')
  })

  it('keeps the accessible name stable after the theme is known', () => {
    render(<ThemeToggle theme="dark" onToggle={vi.fn()} />)

    return waitFor(() => {
      expect(screen.getByRole('button', { name: '切换主题' }).textContent).toBe('☀')
      expect(document.body.innerHTML).not.toContain('切换到亮色模式')
    })
  })
})
