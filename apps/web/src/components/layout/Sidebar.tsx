'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Tag, PostCard, PaginatedResponse } from '@bingo/shared'
import { PixelAvatar } from '@/components/ui/PixelAvatar'

interface HotPost {
  id: string
  title: string
  slug: string
  likeCount: number
  commentCount: number
}

interface RecommendedAuthor {
  id: string
  username: string
  avatarUrl: string | null
  postCount: number
  followerCount: number
}

export function Sidebar() {
  const [hotPosts, setHotPosts] = useState<HotPost[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [authors, setAuthors] = useState<RecommendedAuthor[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const [hotRes, tagsRes, authorsRes] = await Promise.all([
          api.get<PaginatedResponse<PostCard>>('/posts?sort=hot&limit=5'),
          api.get<Tag[]>('/tags'),
          api.get<RecommendedAuthor[]>('/users?limit=5'),
        ])
        if (hotRes.data) {
          setHotPosts(hotRes.data.items.slice(0, 5).map(p => ({
            id: p.id, title: p.title, slug: p.slug,
            likeCount: p.likeCount, commentCount: p.commentCount,
          })))
        }
        if (tagsRes.data) {
          setTags(tagsRes.data.slice(0, 15))
        }
        if (authorsRes.data) setAuthors(authorsRes.data)
      } catch {
        // Sidebar fails silently
      }
    }
    fetchData()
  }, [])

  return (
    <aside>
      {/* Hot Posts */}
      <div className="sidebar-section">
        <h3>■■ 热榜</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {hotPosts.length === 0 && (
            <div style={{ color: 'var(--muted-text)', fontSize: 13 }}>暂无数据</div>
          )}
          {hotPosts.map((post, i) => (
            <Link
              key={post.id}
              href={`/posts/${post.slug}`}
              style={{
                display: 'flex', alignItems: 'baseline', gap: 10,
                textDecoration: 'none', color: i === 0 ? 'var(--pink)' : 'var(--muted-text)',
                fontSize: 13, lineHeight: 1.4,
              }}
              className={i === 0 ? 'rank-1' : ''}
            >
              <span style={{
                fontFamily: 'Inter, system-ui, sans-serif', fontWeight: 700,
                fontSize: 14, minWidth: 20, flexShrink: 0,
              }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {post.title}
              </span>
              <span style={{ fontSize: 11, flexShrink: 0 }}>
                ♥{post.likeCount} ◆{post.commentCount}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recommended Authors */}
      <div className="sidebar-section">
        <h3>◇◇ 推荐作者</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {authors.length === 0 && <div style={{ color: 'var(--muted-text)', fontSize: 13 }}>暂无数据</div>}
          {authors.map(author => (
            <Link key={author.id} href={`/u/${author.username}`} style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--muted-text)', textDecoration: 'none' }}>
              <PixelAvatar username={author.username} avatarUrl={author.avatarUrl} size={32} />
              <span style={{ minWidth: 0 }}>
                <strong style={{ display: 'block', color: 'var(--color)', fontSize: 13 }}>{author.username}</strong>
                <span style={{ fontSize: 11 }}>{author.postCount} 帖子 · {author.followerCount} 粉丝</span>
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Hot Tags */}
      <div className="sidebar-section">
        <h3>## 热门标签</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {tags.map(tag => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className={tag.isOfficial ? 'sidebar-tag-official' : 'sidebar-tag'}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                padding: '4px 10px', fontSize: 12, lineHeight: 1,
                textDecoration: 'none',
              }}
            >
              {tag.name}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  )
}
