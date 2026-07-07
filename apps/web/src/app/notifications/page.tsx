'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import type { Notification, PaginatedResponse } from '@bingo/shared'
import { getTimeAgo } from '@/lib/utils'

export default function NotificationsPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const fetchNotifications = useCallback(async (nextCursor?: string) => {
    const params = new URLSearchParams({ limit: '30' })
    if (nextCursor) params.set('cursor', nextCursor)
    const res = await api.get<PaginatedResponse<Notification>>(`/users/me/notifications?${params.toString()}`)
    return res.data
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return
    fetchNotifications().then(data => {
      if (data) {
        setNotifications(data.items)
        setCursor(data.cursor)
        setHasMore(data.hasMore)
      } else {
        setLoadError('加载通知失败')
      }
      setIsLoading(false)
    }).catch(() => {
      setLoadError('加载通知失败')
      setIsLoading(false)
    })

    // Mark as read
    api.post('/users/me/notifications/read').catch(() => { /* mark-read is non-critical */ })
  }, [isAuthenticated, fetchNotifications])

  const loadMore = async () => {
    if (!cursor || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      const data = await fetchNotifications(cursor)
      if (data) {
        setNotifications(prev => [...prev, ...data.items])
        setCursor(data.cursor)
        setHasMore(data.hasMore)
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingMore(false)
    }
  }

  if (isAuthLoading) {
    return <div className="skeleton" style={{ maxWidth: 600, height: 200, margin: '24px auto' }} />
  }

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: 600, margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔔</div>
        <div style={{ color: 'var(--muted-text)', marginBottom: 16 }}>请先登录后查看通知</div>
        <Link href="/login" className="pixel-btn" style={{ textDecoration: 'none' }}>去登录</Link>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div style={{ maxWidth: 600, margin: '24px auto', padding: '0 20px' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="skeleton" style={{ height: 60, marginBottom: 8 }} />
        ))}
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 600, margin: '24px auto', padding: '0 20px' }}>
      <h1 style={{
        fontFamily: 'Zpix, monospace', fontSize: 16, fontWeight: 600,
        color: 'var(--cyan)', marginBottom: 20,
      }}>
        ▸ 消息中心
      </h1>

      {loadError && (
        <div style={{ padding: 20, textAlign: 'center', color: 'var(--pink)', fontSize: 13, marginBottom: 16 }}>
          {loadError}
        </div>
      )}
      {notifications.length === 0 && !loadError ? (
        <div className="pixel-card" style={{ textAlign: 'center', padding: 40, color: 'var(--muted-text)', fontSize: 13 }}>
          暂无消息
        </div>
      ) : notifications.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifications.map(n => (
            <div
              key={n.id}
              className="pixel-card"
              style={{
                padding: 16,
                opacity: n.isRead ? 0.7 : 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 20 }}>
                  {n.type === 'like' ? '♥' :
                   n.type === 'comment' || n.type === 'reply' ? '◆' :
                   n.type === 'follow' ? '👤' :
                   n.type === 'bookmark' ? '★' : '📢'}
                </span>
                <div style={{ flex: 1 }}>
                  {n.actor && (
                    <Link href={`/u/${n.actor.username}`} style={{ fontWeight: 600, color: 'var(--cyan)', textDecoration: 'none', fontSize: 13 }}>
                      {n.actor.username}
                    </Link>
                  )}
                  <span style={{ fontSize: 13, color: 'var(--muted-text)', marginLeft: 4 }}>
                    {n.content || '有新消息'}
                  </span>
                  <div style={{ fontSize: 11, color: 'var(--muted-text)', marginTop: 2 }}>
                    {getTimeAgo(n.createdAt)}
                  </div>
                </div>
                {n.targetType === 'post' && n.targetId && (
                  <Link
                    href={`/posts/${n.targetId}`}
                    style={{ fontSize: 12, color: 'var(--cyan)', textDecoration: 'none' }}
                  >
                    查看
                  </Link>
                )}
              </div>
            </div>
          ))}

          {hasMore && (
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="pixel-btn pixel-btn-subtle"
              style={{ alignSelf: 'center', marginTop: 16 }}
            >
              {isLoadingMore ? '加载中...' : '加载更多'}
            </button>
          )}
        </div>
      ) : null}
    </div>
  )
}

