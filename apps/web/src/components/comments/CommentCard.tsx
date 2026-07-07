'use client'

import Link from 'next/link'
import { PixelAvatar } from '@/components/ui/PixelAvatar'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Comment } from '@bingo/shared'

interface CommentCardProps {
  comment: Comment
  onReply?: (commentId: string) => void
  depth?: number
  maxDepth?: number
}

export function CommentCard({ comment, onReply, depth = 0, maxDepth = 2 }: CommentCardProps) {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [actionError, setActionError] = useState('')
  const [isLiked, setIsLiked] = useState(comment.isLiked || false)
  const [likeCount, setLikeCount] = useState(comment.likeCount)

  const handleLike = async () => {
    if (!isAuthenticated) { router.push('/login'); return }
    setActionError('')
    try {
      if (isLiked) {
        await api.delete(`/comments/${comment.id}/like`)
        setIsLiked(false)
        setLikeCount(c => Math.max(0, c - 1))
      } else {
        await api.post(`/comments/${comment.id}/like`)
        setIsLiked(true)
        setLikeCount(c => c + 1)
      }
    } catch {
      setActionError('点赞操作失败')
    }
  }

  const timeAgo = getTimeAgo(comment.createdAt)
  const author = comment.author

  return (
    <div className="comment-card">
      <div style={{ display: 'flex', gap: 12 }}>
        {author && (
          <PixelAvatar username={author.username} avatarUrl={author.avatarUrl} size={36} />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            {author && (
              <Link href={`/u/${author.username}`} style={{ fontWeight: 600, fontSize: 13, color: 'var(--cyan)', textDecoration: 'none' }}>
                {author.username}
              </Link>
            )}
            <span style={{ fontSize: 11, color: 'var(--muted-text)' }}>{timeAgo}</span>
          </div>

          <div
            style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color)' }}
            dangerouslySetInnerHTML={{ __html: comment.contentHtml }}
          />
          {actionError && <div role="alert" style={{ color: 'var(--pink)', fontSize: 11 }}>{actionError}</div>}

          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <button
              onClick={handleLike}
              style={{
                fontSize: 13, color: isLiked ? 'var(--pink)' : 'var(--muted-text)',
                background: 'none', border: 'none', cursor: isAuthenticated ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              {isLiked ? '♥' : '♡'} {likeCount}
            </button>

            {onReply && depth < maxDepth && isAuthenticated && (
              <button
                onClick={() => onReply(comment.id)}
                style={{
                  fontSize: 13, color: 'var(--muted-text)',
                  background: 'none', border: 'none', cursor: 'pointer',
                }}
              >
                ◆ 回复
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Nested replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="comment-thread">
          {comment.replies.map(reply => (
            <CommentCard
              key={reply.id}
              comment={reply}
              onReply={onReply}
              depth={depth + 1}
              maxDepth={maxDepth}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function getTimeAgo(dateStr: string): string {
  const now = Date.now()
  const diff = now - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}天前`
  return `${Math.floor(days / 30)}个月前`
}
