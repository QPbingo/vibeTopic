'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { PostEditorForm } from '@/components/posts/PostEditorForm'
import { api } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import type { Post } from '@bingo/shared'

export function EditPostClient() {
  const params = useParams<{ slug: string }>()
  const { isAuthenticated, isLoading } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isLoading || !isAuthenticated) return
    let ignore = false
    api.get<Post>(`/posts/${params.slug}`)
      .then(response => {
        if (!ignore) setPost(response.data ?? null)
      })
      .catch(err => {
        if (!ignore) setError(err instanceof Error ? err.message : '帖子加载失败')
      })
    return () => { ignore = true }
  }, [isAuthenticated, isLoading, params.slug])

  if (error) {
    return (
      <div className="editor-page">
        <div className="editor-card" role="alert" style={{ color: 'var(--pink)' }}>{error}</div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="editor-page">
        <div className="editor-card" style={{ padding: 40, color: 'var(--muted-text)' }}>
          正在加载帖子...
        </div>
      </div>
    )
  }

  return <PostEditorForm mode="edit" initialPost={post} />
}
