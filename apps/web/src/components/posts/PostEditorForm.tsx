'use client'

import React from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Editor } from '@bytemd/react'
import gfm from '@bytemd/plugin-gfm'
import highlight from '@bytemd/plugin-highlight'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { uploadImage, preflightCheck } from '../../lib/upload'

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
    const key = tag.toLowerCase()
    if (!tag || seen.has(key)) continue
    seen.add(key)
    tags.push(tag)
    if (tags.length >= 5) break
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
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)

  const uploadImages = useCallback(async (files: File[]) => {
    setIsUploading(true)
    setUploadStatus(null)
    setError(null)
    const results: { url: string; alt?: string; title?: string }[] = []
    let failed = 0
    const total = files.length

    for (const file of files) {
      const checkErr = preflightCheck(file)
      if (checkErr) {
        failed++
        continue
      }
      try {
        const result = await uploadImage(file)
        results.push(result)
      } catch {
        failed++
      }
    }

    if (failed > 0 && results.length > 0) {
      setUploadStatus(`${results.length}/${total} 张上传成功，${failed} 张失败`)
    } else if (failed === total && total > 0) {
      setError('所有图片上传失败，请检查文件类型和大小')
    } else if (results.length > 0) {
      setUploadStatus(`${results.length}/${total} 张上传成功`)
    }

    setIsUploading(false)
    return results
  }, [])

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
      let saved: SavedPost | null = null
      if (mode === 'create') {
        const response = await api.post<SavedPost>('/posts', body)
        saved = response.data
      } else {
        // In edit mode: save content first, then resubmit for review
        const patchRes = await api.patch<SavedPost>(`/posts/${initialPost!.id}`, body)
        if (!patchRes.data) throw new Error('保存失败')
        const resubmitRes = await api.post<SavedPost>(`/posts/${initialPost!.id}/resubmit`)
        saved = resubmitRes.data ?? patchRes.data
      }
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
          <button className="pixel-btn pixel-btn-accent" type="submit" disabled={isSubmitting || isUploading}>
            {isSubmitting ? '提交中...' : isUploading ? '图片上传中...' : actionLabel}
          </button>
        </div>

        {error && <div className="form-error" role="alert">{error}</div>}
        {uploadStatus && <div className="upload-status" style={{ fontFamily: 'Zpix, monospace', fontSize: 12, color: 'var(--cyan)', marginBottom: 8 }}>{uploadStatus}</div>}

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
            uploadImages={uploadImages}
            placeholder="写下你的项目、踩坑、提示词、代码片段，或者一次冒险。"
          />
        </div>
      </form>
    </div>
  )
}
