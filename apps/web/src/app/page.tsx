'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { useSSE } from '@/hooks/useSSE'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import { PostCard } from '@/components/feed/PostCard'
import { Sidebar } from '@/components/layout/Sidebar'
import { getTimeAgo } from '@/lib/utils'
import type { PostCard as PostCardType, PaginatedResponse, Notification } from '@bingo/shared'

type SortMode = 'latest' | 'hot' | 'featured'

export default function HomePage() {
  const [sort, setSort] = useState<SortMode>('latest')
  const { isAuthenticated } = useAuth()

  // Notification prompt state
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([])

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) { setRecentNotifications([]); return }
    try {
      const res = await api.get<PaginatedResponse<Notification>>('/users/me/notifications?limit=3')
      if (res.data) {
        const unread = res.data.items.filter(n => !n.isRead)
        setRecentNotifications(unread)
      }
    } catch {
      // ignore
    }
  }, [isAuthenticated])

  // Fetch on mount / auth change
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // SSE refetch on new notification
  const onNotification = useCallback(() => {
    fetchNotifications()
  }, [fetchNotifications])

  useSSE({ enabled: isAuthenticated, onNotification })

  const fetchPosts = useCallback(async (cursor?: string) => {
    const params = new URLSearchParams()
    if (cursor) params.set('cursor', cursor)
    params.set('sort', sort)
    params.set('limit', '20')

    const res = await api.get<PaginatedResponse<PostCardType>>(`/posts?${params.toString()}`)
    return res.data ?? { items: [], cursor: null, hasMore: false }
  }, [sort])

  const { items, isLoading, hasMore, error, loaderRef } = useInfiniteScroll<PostCardType>({
    fetchFn: fetchPosts,
    enabled: true,
  })

  return (
    <div className="page-layout" style={{ marginTop: 24 }}>
      <div className="feed-col">
        {/* Notification prompt */}
        {isAuthenticated && recentNotifications.length > 0 && (
          <div className="pixel-card" style={{ padding: '12px 18px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13 }}>
              <span style={{ color: 'var(--pink)', fontFamily: 'Zpix, monospace', fontSize: 11 }}>🔔</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                {recentNotifications.slice(0, 2).map(n => (
                  <div key={n.id} style={{ display: 'flex', gap: 6, marginBottom: 1, lineHeight: 1.6 }}>
                    <span style={{ color: 'var(--color)' }}>
                      <strong style={{ color: 'var(--cyan)' }}>{n.actor?.username || '系统'}</strong>
                      {' '}
                      {n.type === 'like' && '赞了你的帖子'}
                      {n.type === 'comment' && '评论了你的帖子'}
                      {n.type === 'reply' && '回复了你的评论'}
                      {n.type === 'bookmark' && '收藏了你的帖子'}
                      {n.type === 'follow' && '关注了你'}
                      {n.type === 'system' && (n.content || '新消息')}
                    </span>
                    <span style={{ color: 'var(--muted-text)', fontSize: 11, whiteSpace: 'nowrap' }}>
                      {getTimeAgo(n.createdAt)}
                    </span>
                  </div>
                ))}
                {recentNotifications.length > 2 && (
                  <div style={{ color: 'var(--muted-text)', fontSize: 11, marginTop: 2 }}>
                    还有 {recentNotifications.length - 2} 条未读
                  </div>
                )}
              </div>
              <Link
                href="/notifications"
                className="pixel-btn pixel-btn-subtle"
                style={{ padding: '4px 10px', fontSize: 11, flexShrink: 0 }}
              >
                查看全部
              </Link>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: 20 }}>
          <button
            className={`tab ${sort === 'latest' ? 'active' : ''}`}
            onClick={() => setSort('latest')}
          >
            ■ 最新
          </button>
          <button
            className={`tab ${sort === 'hot' ? 'active' : ''}`}
            onClick={() => setSort('hot')}
          >
            ◆ 最热
          </button>
          <button
            className={`tab ${sort === 'featured' ? 'active' : ''}`}
            onClick={() => setSort('featured')}
          >
            ★ 精华
          </button>
        </div>

        {/* Feed */}
        <div className="post-feed">
          {items.map(post => (
            <PostCard key={post.id} post={post} />
          ))}

          {/* Loading state */}
          {isLoading && (
            <div style={{ padding: 40, textAlign: 'center' }}>
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton" style={{ height: 120, marginBottom: 16 }} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && items.length === 0 && !error && (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted-text)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
              <div style={{ fontSize: 16, fontFamily: 'Zpix, monospace', marginBottom: 8 }}>
                还没有帖子
              </div>
              <div style={{ fontSize: 13 }}>成为第一个分享的冒险者吧！</div>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--pink)' }}>
              <div style={{ fontSize: 13 }}>加载失败，请刷新页面重试</div>
            </div>
          )}

          {/* Infinite scroll trigger */}
          {hasMore && <div ref={loaderRef} style={{ height: 1 }} />}

          {/* End of feed */}
          {!hasMore && items.length > 0 && (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted-text)', fontSize: 12 }}>
              — 已经到底了 —
            </div>
          )}
        </div>
      </div>

      <div className="sidebar-col">
        <Sidebar />
      </div>
    </div>
  )
}
