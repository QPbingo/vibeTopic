'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { useAuth } from '@/lib/auth'
import { PixelLogo } from '@/components/ui/PixelLogo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { api } from '@/lib/api'
import { useSSE } from '@/hooks/useSSE'

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const onNotification = useCallback(() => setUnreadCount(count => count + 1), [])
  useSSE({ enabled: isAuthenticated, onNotification })

  useEffect(() => {
    if (!isAuthenticated) { setUnreadCount(0); return }
    api.get<{ count: number }>('/users/me/notifications/unread-count')
      .then(response => setUnreadCount(response.data?.count ?? 0))
      .catch(() => setUnreadCount(0))
  }, [isAuthenticated])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <nav className="pixel-nav">
      {/* Left: Logo + Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <PixelLogo />
          <span className="nav-brand" style={{ fontSize: 18, fontWeight: 700, color: '#F5F0EB' }}>
            bingbingbingo
          </span>
        </Link>
      </div>

      {/* Center: Search */}
      <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          className="search-input"
          placeholder="搜索帖子..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </form>

      {/* Right: Nav Links + Theme + Auth */}
      <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <Link href="/tags/vibe-coding" className="nav-link" style={{ fontSize: 13, color: 'var(--muted-text)', textDecoration: 'none' }}>
          发现
        </Link>

        {isAuthenticated ? (
          <>
            <Link href="/posts/new" className="pixel-btn pixel-btn-accent" style={{ padding: '6px 16px', fontSize: 12 }}>
              发布
            </Link>
            <Link href="/notifications" className="nav-link" style={{ fontSize: 13, color: 'var(--muted-text)', textDecoration: 'none', position: 'relative' }}>
              通知
              {unreadCount > 0 && <span aria-label={`${unreadCount} 条未读通知`} style={{ position: 'absolute', top: -8, right: -12, minWidth: 16, padding: '1px 4px', background: 'var(--pink)', color: '#fff', fontSize: 10, textAlign: 'center' }}>{Math.min(unreadCount, 99)}</span>}
            </Link>
            <Link href={`/u/${user?.username}`} className="nav-link" style={{ fontSize: 13, color: 'var(--cyan)', textDecoration: 'none' }}>
              {user?.username}
            </Link>
            <button
              onClick={logout}
              className="nav-link"
              style={{ fontSize: 13, color: 'var(--muted-text)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              退出
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="nav-link" style={{ fontSize: 13, color: 'var(--muted-text)', textDecoration: 'none' }}>
              登录
            </Link>
            <Link href="/register" className="pixel-btn pixel-btn-accent" style={{ padding: '6px 16px', fontSize: 12 }}>
              注册
            </Link>
          </>
        )}

        <ThemeToggle theme={theme} onToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
      </div>
    </nav>
  )
}
