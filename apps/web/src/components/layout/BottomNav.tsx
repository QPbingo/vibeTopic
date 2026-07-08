'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth'

export function BottomNav() {
  const { isAuthenticated, user } = useAuth()

  return (
    <nav className="bottom-nav" style={{
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '8px 0',
      fontFamily: 'Zpix, Space Grotesk, monospace',
      fontSize: 11,
      color: 'var(--muted-text)',
    }}>
      <Link href="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: 'var(--muted-text)', textDecoration: 'none' }}>
        <span style={{ fontSize: 18 }}>■</span>
        <span>首页</span>
      </Link>
      <Link href="/tags/vibe-coding" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: 'var(--muted-text)', textDecoration: 'none' }}>
        <span style={{ fontSize: 18 }}>◆</span>
        <span>发现</span>
      </Link>
      {isAuthenticated ? (
        <>
          <Link href="/notifications" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: 'var(--muted-text)', textDecoration: 'none' }}>
            <span style={{ fontSize: 18 }}>◈</span>
            <span>通知</span>
          </Link>
          <Link href={`/u/${user?.username}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: 'var(--muted-text)', textDecoration: 'none' }}>
            <span style={{ fontSize: 18 }}>⬡</span>
            <span>我的</span>
          </Link>
        </>
      ) : (
        <Link href="/login" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: 'var(--muted-text)', textDecoration: 'none' }}>
          <span style={{ fontSize: 18 }}>⬡</span>
          <span>登录</span>
        </Link>
      )}
    </nav>
  )
}
