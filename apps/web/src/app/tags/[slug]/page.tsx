'use client'

import { useParams } from 'next/navigation'
import { useCallback, useState, useEffect } from 'react'
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll'
import { api } from '@/lib/api'
import { PostCard } from '@/components/feed/PostCard'
import type { PostCard as PostCardType, Tag } from '@bingo/shared'

interface TagPageData {
  tag: Tag
  items: PostCardType[]
  cursor: string | null
  hasMore: boolean
}

export default function TagPage() {
  const params = useParams()
  const slug = params.slug as string
  const [tag, setTag] = useState<Tag | null>(null)

  useEffect(() => {
    api.get<TagPageData>(`/tags/${slug}`).then(res => {
      if (res.data) setTag(res.data.tag)
    }).catch(() => {})
  }, [slug])

  const fetchPosts = useCallback(async (cursor?: string) => {
    const queryParams = new URLSearchParams({ limit: '20' })
    if (cursor) queryParams.set('cursor', cursor)
    const res = await api.get<TagPageData>(`/tags/${slug}?${queryParams.toString()}`)
    return res.data ?? { items: [], cursor: null, hasMore: false }
  }, [slug])

  const { items, isLoading, hasMore, loaderRef } = useInfiniteScroll<PostCardType>({
    fetchFn: fetchPosts,
    enabled: true,
  })

  return (
    <div className="page-layout" style={{ marginTop: 24 }}>
      <div className="feed-col">
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontFamily: 'Zpix, monospace', fontSize: 14, color: 'var(--cyan)',
            marginBottom: 4,
          }}>
            ## {tag?.name || slug}
          </div>
          {tag?.description && (
            <div style={{ fontSize: 13, color: 'var(--muted-text)' }}>
              {tag.description}
            </div>
          )}
          {tag && (
            <div style={{ fontSize: 12, color: 'var(--muted-text)', marginTop: 4 }}>
              {tag.postCount} 个帖子
            </div>
          )}
        </div>

        <div className="post-feed">
          {items.map(post => (
            <PostCard key={post.id} post={post} />
          ))}

          {isLoading && <div className="skeleton" style={{ height: 120 }} />}

          {!isLoading && items.length === 0 && (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--muted-text)' }}>
              该标签下暂无帖子
            </div>
          )}

          {hasMore && <div ref={loaderRef} style={{ height: 1 }} />}
        </div>
      </div>
    </div>
  )
}
