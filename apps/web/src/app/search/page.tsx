'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { useCallback } from 'react'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { api } from '@/lib/api'
import { PostCard } from '@/components/feed/PostCard'
import type { PostCard as PostCardType, PaginatedResponse } from '@bingo/shared'

function SearchContent() {
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''

  const fetchPosts = useCallback(async (cursor?: string) => {
    const params = new URLSearchParams({ q, limit: '20' })
    if (cursor) params.set('cursor', cursor)
    const res = await api.get<PaginatedResponse<PostCardType>>(`/search?${params.toString()}`)
    return res.data ?? { items: [], cursor: null, hasMore: false }
  }, [q])

  const { items, isLoading, hasMore, error, loaderRef } = useInfiniteScroll<PostCardType>({
    fetchFn: fetchPosts,
    enabled: q.length >= 2,
  })

  return (
    <div className="page-layout" style={{ marginTop: 24 }}>
      <div className="feed-col">
        <div style={{
          fontFamily: 'Zpix, monospace', fontSize: 14, color: 'var(--cyan)',
          marginBottom: 20,
        }}>
          ▸ 搜索：{q}
          {!isLoading && items.length > 0 && `（${items.length} 个结果）`}
        </div>

        <div className="post-feed">
          {error && (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--pink)', fontSize: 13, marginBottom: 16 }}>
              搜索失败，请稍后重试
            </div>
          )}
          {items.map(post => (
            <PostCard key={post.id} post={post} />
          ))}

          {isLoading && (
            <div className="skeleton" style={{ height: 120 }} />
          )}

          {!isLoading && items.length === 0 && q.length >= 2 && !error && (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted-text)' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <div>未找到相关帖子</div>
            </div>
          )}

          {q.length < 2 && (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted-text)' }}>
              <div style={{ fontSize: 14 }}>输入至少 2 个字符进行搜索</div>
            </div>
          )}

          {hasMore && <div ref={loaderRef} style={{ height: 1 }} />}

          {!hasMore && items.length > 0 && (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted-text)', fontSize: 12 }}>
              — 已显示全部结果 —
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="skeleton" style={{ height: 200, margin: 24 }} />}>
      <SearchContent />
    </Suspense>
  )
}
