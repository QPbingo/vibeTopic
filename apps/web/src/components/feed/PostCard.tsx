'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import { PixelAvatar } from '@/components/ui/PixelAvatar'
import { PixelTag } from '@/components/ui/PixelTag'
import { StatIcons } from '@/components/ui/StatIcons'
import { PostMedia } from './PostMedia'
import type { PostCard as PostCardType } from '@bingo/shared'
import { useState } from 'react'
import { getTimeAgo } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface PostCardProps {
  post: PostCardType
}

export function PostCard({ post }: PostCardProps) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [actionError, setActionError] = useState('')
  const [isLiked, setIsLiked] = useState(post.isLiked || false)
  const [likeCount, setLikeCount] = useState(post.likeCount)
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked || false)
  const [bookmarkCount, setBookmarkCount] = useState(post.bookmarkCount)

  const handleLike = async () => {
    if (!isAuthenticated) { router.push(`/login?next=/posts/${post.slug}`); return }
    setActionError('')
    try {
      if (isLiked) {
        await api.delete(`/posts/${post.id}/like`)
        setIsLiked(false)
        setLikeCount(c => Math.max(0, c - 1))
      } else {
        await api.post(`/posts/${post.id}/like`)
        setIsLiked(true)
        setLikeCount(c => c + 1)
      }
    } catch {
      setActionError('点赞操作失败，请重试')
    }
  }

  const handleBookmark = async () => {
    if (!isAuthenticated) { router.push(`/login?next=/posts/${post.slug}`); return }
    setActionError('')
    try {
      if (isBookmarked) {
        await api.delete(`/posts/${post.id}/bookmark`)
        setIsBookmarked(false)
        setBookmarkCount(c => Math.max(0, c - 1))
      } else {
        await api.post(`/posts/${post.id}/bookmark`)
        setIsBookmarked(true)
        setBookmarkCount(c => c + 1)
      }
    } catch {
      setActionError('收藏操作失败，请重试')
    }
  }

  const timeAgo = getTimeAgo(post.createdAt)

  return (
    <article className="pixel-card">
      {actionError && <div role="alert" style={{ color: 'var(--pink)', fontSize: 12, marginBottom: 8 }}>{actionError}</div>}
      {/* Decor blocks */}
      <div className="pixel-card-decor" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="blk" />
        ))}
      </div>

      <div className="post-card-row">
        {post.author && (
          <>
            <div className="post-card-avatar">
              <PixelAvatar username={post.author.username} avatarUrl={post.author.avatarUrl} />
            </div>
            <div className="post-card-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Link href={`/u/${post.author.username}`} className="post-card-user" style={{ textDecoration: 'none' }}>
                  {post.author.username}
                </Link>
                <span className="post-card-time">{timeAgo}</span>
              </div>

          <Link href={`/posts/${post.slug}`} className="post-card-title">
            {post.title}
          </Link>

          <p className="post-card-excerpt">{post.excerpt}</p>

          {/* Media */}
          {post.media && post.media.length > 0 && (
            <PostMedia media={post.media} postSlug={post.slug} />
          )}

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="post-card-tags">
              {post.tags.map(tag => (
                <PixelTag key={tag.id} {...tag} />
              ))}
            </div>
          )}

          <StatIcons
            likeCount={likeCount}
            commentCount={post.commentCount}
            bookmarkCount={bookmarkCount}
            isLiked={isLiked}
            isBookmarked={isBookmarked}
            onLike={handleLike}
            onBookmark={handleBookmark}
          />
        </div>
          </>
        )}
        {!post.author && (
          <div className="post-card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: 'var(--muted-text)' }}>[账号已注销]</span>
              <span className="post-card-time">{timeAgo}</span>
            </div>
            <Link href={`/posts/${post.slug}`} className="post-card-title">
              {post.title}
            </Link>
            <p className="post-card-excerpt">{post.excerpt}</p>
          </div>
        )}
      </div>
    </article>
  )
}

