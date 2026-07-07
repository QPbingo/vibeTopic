'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { PixelAvatar } from '@/components/ui/PixelAvatar'
import { PixelTag } from '@/components/ui/PixelTag'
import { StatIcons } from '@/components/ui/StatIcons'
import { CommentSection } from '@/components/comments/CommentSection'
import type { Post } from '@bingo/shared'

export function PostDetailClient({ initialPost }: { initialPost: Post }) {
  const slug = initialPost.slug
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()

  const post = initialPost
  const [isLiked, setIsLiked] = useState(initialPost.isLiked || false)
  const [likeCount, setLikeCount] = useState(initialPost.likeCount)
  const [isBookmarked, setIsBookmarked] = useState(initialPost.isBookmarked || false)
  const [bookmarkCount, setBookmarkCount] = useState(initialPost.bookmarkCount)
  const [actionError, setActionError] = useState('')

  const handleLike = async () => {
    if (!post) return
    if (!isAuthenticated) { router.push(`/login?next=/posts/${slug}`); return }
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
    } catch { setActionError('点赞操作失败，请重试') }
  }

  const handleBookmark = async () => {
    if (!post) return
    if (!isAuthenticated) { router.push(`/login?next=/posts/${slug}`); return }
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
    } catch { setActionError('收藏操作失败，请重试') }
  }

  const timeStr = new Date(post.createdAt).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="page-layout" style={{ marginTop: 24, maxWidth: 800 }}>
      <div style={{ flex: 1 }}>
        <article className="pixel-card" style={{ marginBottom: 32 }}>
          {actionError && <div role="alert" style={{ color: 'var(--pink)', fontSize: 12, marginBottom: 12 }}>{actionError}</div>}
          {/* Author */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            {post.author && (
              <>
                <PixelAvatar username={post.author.username} avatarUrl={post.author.avatarUrl} />
                <div>
                  <Link href={`/u/${post.author.username}`} style={{ fontWeight: 600, color: 'var(--cyan)', textDecoration: 'none', fontSize: 14 }}>
                    {post.author.username}
                  </Link>
                  <div style={{ fontSize: 12, color: 'var(--muted-text)' }}>{timeStr}</div>
                </div>
              </>
            )}
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: 'Inter, system-ui, sans-serif', fontSize: 24, fontWeight: 700,
            color: 'var(--color)', lineHeight: 1.4, marginBottom: 12,
          }} className="light:text-black">
            {post.title}
          </h1>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
              {post.tags.map(tag => (
                <PixelTag key={tag.id} {...tag} />
              ))}
            </div>
          )}

          {user?.id === post.userId && post.status === 'rejected' && (
            <div style={{ marginBottom: 16 }}>
              <Link href={`/posts/${post.slug}/edit`} className="pixel-btn" style={{ display: 'inline-block', padding: '6px 14px', fontSize: 12 }}>
                编辑并重新提交
              </Link>
            </div>
          )}

          {/* Content */}
          <div
            className="post-detail-content"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
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
        </article>

        {/* Comments */}
        <div className="pixel-card">
          <CommentSection postId={post.id} />
        </div>
      </div>
    </div>
  )
}
