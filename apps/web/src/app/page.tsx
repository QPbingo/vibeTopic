'use client'

import { useState, useCallback } from 'react'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { api } from '@/lib/api'
import { PostCard } from '@/components/feed/PostCard'
import { Sidebar } from '@/components/layout/Sidebar'
import type { PostCard as PostCardType, PaginatedResponse } from '@bingo/shared'

type SortMode = 'latest' | 'hot' | 'featured'

export default function HomePage() {
  const [sort, setSort] = useState<SortMode>('latest')

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
