'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { PixelAvatar } from '@/components/ui/PixelAvatar'
import { PixelTag } from '@/components/ui/PixelTag'
import { StatIcons } from '@/components/ui/StatIcons'
import { PostMedia } from '@/components/feed/PostMedia'
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
  const [followError, setFollowError] = useState('')
  const [isFollowing, setIsFollowing] = useState(false)

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

  const handleFollow = async () => {
    if (!post.author || !isAuthenticated) {
      router.push(`/login?next=/posts/${slug}`)
      return
    }
    setFollowError('')
    try {
      if (isFollowing) {
        await api.delete(`/follows/${post.author.id}`)
        setIsFollowing(false)
      } else {
        await api.post('/follows', { targetUserId: post.author.id })
        setIsFollowing(true)
      }
    } catch {
      setFollowError('关注操作失败')
    }
  }

  const timeStr = new Date(post.createdAt).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  const isAuthor = user?.id === post.userId
  const showFollow = post.author && isAuthenticated && !isAuthor

  return (
    <div className="page-layout post-detail-page" style={{ marginTop: 24 }}>
      <div style={{ flex: 1, minWidth: 0, maxWidth: 800 }}>
        {/* Back to feed */}
        <Link
          href="/"
          className="pixel-btn pixel-btn-subtle"
          style={{ display: 'inline-flex', padding: '6px 14px', fontSize: 12, marginBottom: 20 }}
        >
          ← 返回首页
        </Link>

        <article className="pixel-card post-detail-hero" style={{ marginBottom: 32 }}>
          {actionError && <div role="alert" style={{ color: 'var(--pink)', fontSize: 12, marginBottom: 12 }}>{actionError}</div>}
          {followError && <div role="alert" style={{ color: 'var(--pink)', fontSize: 12, marginBottom: 12 }}>{followError}</div>}

          {/* Status banners */}
          {post.status === 'pending_review' && (
            <div className="post-detail-status-banner" style={{
              padding: '10px 16px', marginBottom: 16,
              background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)',
              color: 'var(--gold)', fontSize: 13,
            }}>
              ⏳ 该帖子正在审核中，仅作者可见
            </div>
          )}
          {post.status === 'rejected' && (
            <div className="post-detail-status-banner" style={{
              padding: '10px 16px', marginBottom: 16,
              background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)',
              color: 'var(--pink)', fontSize: 13,
            }}>
              ✕ 该帖子未通过审核
              {isAuthor && (
                <Link href={`/posts/${post.slug}/edit`} style={{ color: 'var(--cyan)', marginLeft: 12 }}>
                  编辑并重新提交
                </Link>
              )}
            </div>
          )}

          {/* Author block */}
          <div className="post-detail-meta" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            {post.author && (
              <>
                <Link href={`/u/${post.author.username}`}>
                  <PixelAvatar username={post.author.username} avatarUrl={post.author.avatarUrl} />
                </Link>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Link
                    href={`/u/${post.author.username}`}
                    style={{ fontWeight: 600, color: 'var(--cyan)', textDecoration: 'none', fontSize: 14 }}
                  >
                    {post.author.username}
                  </Link>
                  <div className="post-detail-meta-sub" style={{ fontSize: 12, color: 'var(--muted-text)', display: 'flex', gap: 12 }}>
                    <span>{timeStr}</span>
                    <span>{post.viewCount} 次浏览</span>
                  </div>
                </div>
                {showFollow && (
                  <button
                    type="button"
                    className="pixel-btn pixel-btn-subtle"
                    onClick={handleFollow}
                    style={{ padding: '4px 12px', fontSize: 11, flexShrink: 0 }}
                  >
                    {isFollowing ? '已关注' : '+ 关注'}
                  </button>
                )}
                {isAuthor && (
                  <Link
                    href={`/posts/${post.slug}/edit`}
                    className="pixel-btn pixel-btn-subtle"
                    style={{ padding: '4px 12px', fontSize: 11, flexShrink: 0 }}
                  >
                    编辑
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="post-detail-title" style={{
            fontFamily: 'Inter, system-ui, sans-serif', fontSize: 26, fontWeight: 700,
            color: 'var(--color)', lineHeight: 1.4, marginBottom: 12,
          }}>
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

          {/* Media */}
          {post.media && post.media.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <PostMedia media={post.media} />
            </div>
          )}

          {/* Content */}
          <div className="post-detail-body">
            <div
              className="post-detail-content"
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />
          </div>
        </article>

        {/* Stats / Actions footer */}
        <div className="pixel-card" style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
        </div>

        {/* Comments */}
        <div className="post-detail-comments pixel-card">
          <CommentSection postId={post.id} />
        </div>
      </div>
    </div>
  )
}
