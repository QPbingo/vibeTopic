'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth'
import { api } from '@/lib/api'
import { CommentCard } from './CommentCard'
import type { Comment } from '@bingo/shared'
import Link from 'next/link'

interface CommentSectionProps {
  postId: string
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { isAuthenticated } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [content, setContent] = useState('')
  const [replyToId, setReplyToId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const fetchComments = useCallback(async () => {
    try {
      const res = await api.get<Comment[]>(`/posts/${postId}/comments`)
      if (res.data) setComments(res.data)
    } catch {
      // ignore
    } finally {
      setIsLoading(false)
    }
  }, [postId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || isSubmitting) return

    setIsSubmitting(true)
    setSubmitError('')
    try {
      await api.post(`/posts/${postId}/comments`, {
        contentMd: content,
        contentHtml: content,
        parentId: replyToId || undefined,
      })
      setContent('')
      setReplyToId(null)
      await fetchComments()
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '评论发布失败，请重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div style={{ padding: '20px 0' }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ height: 60, marginBottom: 12 }} />
        ))}
      </div>
    )
  }

  return (
    <div style={{ marginTop: 32 }}>
      <h3 style={{
        fontFamily: 'Zpix, Space Grotesk, monospace', fontSize: 14, fontWeight: 600,
        color: 'var(--cyan)', marginBottom: 16,
      }}>
        ◆◆ 评论 ({comments.length})
      </h3>
      {submitError && <div role="alert" style={{ color: 'var(--pink)', fontSize: 12, marginBottom: 12 }}>{submitError}</div>}

      {/* Comment form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
          {replyToId && (
            <div style={{ fontSize: 12, color: 'var(--muted-text)', marginBottom: 8 }}>
              回复中...
              <button
                type="button"
                onClick={() => setReplyToId(null)}
                style={{ color: 'var(--pink)', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 8 }}
              >
                取消回复
              </button>
            </div>
          )}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={replyToId ? '写下你的回复...' : '写下你的评论...'}
            rows={3}
            className="auth-input"
            style={{ resize: 'vertical', minHeight: 80 }}
          />
          <button type="submit" className="pixel-btn" disabled={isSubmitting || !content.trim()}>
            {isSubmitting ? '发布中...' : '发布评论'}
          </button>
        </form>
      ) : (
        <div style={{ padding: 16, marginBottom: 24, background: 'var(--muted-bg)', fontSize: 13, color: 'var(--muted-text)' }}>
          请先<Link href="/login" style={{ color: 'var(--cyan)', margin: '0 4px' }}>登录</Link>后再发表评论
        </div>
      )}

      {/* Comment list */}
      <div className="comment-thread">
        {comments.length === 0 ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted-text)', fontSize: 13 }}>
            暂无评论，来说点什么吧
          </div>
        ) : (
          comments.map(comment => (
            <CommentCard
              key={comment.id}
              comment={comment}
              onReply={(id) => setReplyToId(id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
