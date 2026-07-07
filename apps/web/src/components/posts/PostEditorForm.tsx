'use client'

import React from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Editor } from '@bytemd/react'
import gfm from '@bytemd/plugin-gfm'
import highlight from '@bytemd/plugin-highlight'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'

type PostEditorFormProps = {
  mode: 'create' | 'edit'
  initialPost?: {
    id: string
    title: string
    contentMd: string
    tags?: Array<{ name: string }>
  }
}

type SavedPost = {
  id: string
  slug?: string
}

const plugins = [gfm(), highlight()]

function parseTags(tagsText: string): string[] {
  const seen = new Set<string>()
  const tags: string[] = []
  for (const rawTag of tagsText.split(',')) {
    const tag = rawTag.trim()
    const key = tag.toLocaleLowerCase()
    if (!tag || seen.has(key)) continue
    seen.add(key)
    tags.push(tag)
  }
  return tags
}

export function PostEditorForm({ mode, initialPost }: PostEditorFormProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [title, setTitle] = useState(initialPost?.title ?? '')
  const [contentMd, setContentMd] = useState(initialPost?.contentMd ?? '')
  const [tagsText, setTagsText] = useState(initialPost?.tags?.map(tag => tag.name).join(', ') ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loginNext = mode === 'create' ? '/posts/new' : `/posts/${initialPost?.id ?? ''}/edit`
  const actionLabel = mode === 'create' ? '发布帖子' : '保存修改'
  const titleText = mode === 'create' ? '发布新帖子' : '编辑帖子'
  const helperText = useMemo(() => {
    const count = contentMd.length
    return `${count}/50000 · 支持 Markdown、代码块、链接和图片 URL`
  }, [contentMd.length])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?next=${encodeURIComponent(loginNext)}`)
    }
  }, [isAuthenticated, isLoading, loginNext, router])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isAuthenticated || isSubmitting) return

    const trimmedTitle = title.trim()
    const trimmedContent = contentMd.trim()
    if (!trimmedTitle) { setError('标题不能为空'); return }
    if (!trimmedContent) { setError('正文不能为空'); return }

    setError(null)
    setIsSubmitting(true)
    try {
      const body = { title: trimmedTitle, contentMd: trimmedContent, tags: parseTags(tagsText) }
      const response = mode === 'create'
        ? await api.post<SavedPost>('/posts', body)
        : await api.patch<SavedPost>(`/posts/${initialPost!.id}`, body)
      const saved = mode === 'edit'
        ? (await api.post<SavedPost>(`/posts/${initialPost!.id}/resubmit`)).data ?? response.data
        : response.data
      router.push(saved?.slug ? `/posts/${saved.slug}` : '/')
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="editor-page">
        <div className="editor-card" style={{ padding: 40, color: 'var(--muted-text)' }}>
          正在进入编辑器...
        </div>
      </div>
    )
  }

  return (
    <div className="editor-page">
      <form className="editor-card" onSubmit={handleSubmit}>
        <div className="editor-header">
          <div>
            <div className="editor-kicker">WRITE / SHARE / VIBE</div>
            <h1>{titleText}</h1>
          </div>
          <button className="pixel-btn pixel-btn-accent" type="submit" disabled={isSubmitting}>
            {isSubmitting ? '提交中...' : actionLabel}
          </button>
        </div>

        {error && <div className="form-error" role="alert">{error}</div>}

        <label className="field-label" htmlFor="post-title">标题</label>
        <input
          id="post-title"
          aria-label="标题"
          className="editor-input"
          maxLength={200}
          value={title}
          onChange={(event) => setTitle(event.currentTarget.value)}
          placeholder="比如：我用 Codex 搭了一个像素风社区"
        />

        <div className="editor-row">
          <label className="field-label" htmlFor="post-tags">标签</label>
          <span>{helperText}</span>
        </div>
        <input
          id="post-tags"
          aria-label="标签"
          className="editor-input"
          value={tagsText}
          onChange={(event) => setTagsText(event.currentTarget.value)}
          placeholder="Codex, AI, Vibe Coding（最多 5 个，用英文逗号分隔）"
        />

        <label className="field-label" style={{ marginTop: 16 }}>正文</label>
        <div className="bytemd-shell">
          <Editor
            value={contentMd}
            plugins={plugins}
            onChange={setContentMd}
            placeholder="写下你的项目、踩坑、提示词、代码片段，或者一次冒险。"
          />
        </div>
      </form>
    </div>
  )
}
