'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'
import { useAuth } from '@/lib/auth'
import { PixelLogo } from '@/components/ui/PixelLogo'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { PixelAvatar } from '@/components/ui/PixelAvatar'
import { api } from '@/lib/api'
import { useSSE } from '@/hooks/useSSE'

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const onNotification = useCallback(() => setUnreadCount(count => count + 1), [])
  useSSE({ enabled: isAuthenticated, onNotification })

  useEffect(() => {
    if (!isAuthenticated) { setUnreadCount(0); return }
    api.get<{ count: number }>('/users/me/notifications/unread-count')
      .then(response => setUnreadCount(response.data?.count ?? 0))
      .catch(() => setUnreadCount(0))
  }, [isAuthenticated])

  // Close on outside click / Escape
  useEffect(() => {
    if (!menuOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        menuButtonRef.current?.focus()
      }
    }
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  // Close on item click
  const closeMenu = useCallback(() => {
    setMenuOpen(false)
  }, [])

  const handleLogout = async () => {
    closeMenu()
    await logout()
    router.push('/')
  }

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

            {/* User dropdown */}
            <div ref={menuRef} style={{ position: 'relative' }}>
              <button
                ref={menuButtonRef}
                type="button"
                className="nav-link"
                onClick={() => setMenuOpen(prev => !prev)}
                aria-haspopup="true"
                aria-expanded={menuOpen}
                aria-label="用户菜单"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: 13, color: 'var(--cyan)', background: 'none',
                  border: 'none', cursor: 'pointer', padding: 0,
                }}
              >
                <PixelAvatar username={user?.username || ''} avatarUrl={user?.avatarUrl} size={28} />
                <span>{user?.username}</span>
                <span style={{ fontSize: 10, color: 'var(--muted-text)' }}>{menuOpen ? '▲' : '▼'}</span>
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="user-menu-dropdown"
                  style={{
                    position: 'absolute', top: '100%', right: 0, marginTop: 8,
                    minWidth: 160, background: 'var(--card-bg)', zIndex: 200,
                    boxShadow: '4px 4px 0 0 rgba(6, 182, 212, 0.5), 8px 8px 0 0 rgba(244, 63, 94, 0.3), 0 0 0 1px var(--border-subtle)',
                  }}
                >
                  <Link
                    href={`/u/${user?.username}`}
                    role="menuitem"
                    className="user-menu-item"
                    onClick={closeMenu}
                    style={{
                      display: 'block', padding: '10px 16px', fontSize: 13,
                      color: 'var(--color)', textDecoration: 'none',
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                  >
                    个人主页
                  </Link>
                  <Link
                    href="/settings/profile"
                    role="menuitem"
                    className="user-menu-item"
                    onClick={closeMenu}
                    style={{
                      display: 'block', padding: '10px 16px', fontSize: 13,
                      color: 'var(--color)', textDecoration: 'none',
                      borderBottom: '1px solid var(--border-subtle)',
                    }}
                  >
                    编辑资料
                  </Link>
                  <Link
                    href="/notifications"
                    role="menuitem"
                    className="user-menu-item"
                    onClick={closeMenu}
                    style={{
                      display: 'block', padding: '10px 16px', fontSize: 13,
                      color: 'var(--color)', textDecoration: 'none',
                      borderBottom: '1px solid var(--border-subtle)',
                      position: 'relative',
                    }}
                  >
                    通知
                    {unreadCount > 0 && (
                      <span aria-label={`${unreadCount} 条未读通知`} style={{
                        position: 'absolute', top: 8, right: 12,
                        minWidth: 16, padding: '1px 4px',
                        background: 'var(--pink)', color: '#fff', fontSize: 10, textAlign: 'center',
                      }}>
                        {Math.min(unreadCount, 99)}
                      </span>
                    )}
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    className="user-menu-item"
                    onClick={handleLogout}
                    style={{
                      display: 'block', width: '100%', padding: '10px 16px', fontSize: 13,
                      color: 'var(--muted-text)', background: 'none', border: 'none',
                      cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    退出
                  </button>
                </div>
              )}
            </div>
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
