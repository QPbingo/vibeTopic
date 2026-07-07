import { notFound } from 'next/navigation'
import type { ApiResponse, Post } from '@bingo/shared'
import { PostDetailClient } from './PostDetailClient'

export const dynamic = 'force-dynamic'

export default async function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const apiBase = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1'

  const response = await fetch(`${apiBase}/posts/${encodeURIComponent(slug)}`, {
    cache: 'no-store',
  }).catch(() => null)

  if (!response?.ok) notFound()
  const result = await response.json() as ApiResponse<Post>
  if (result.code !== 0 || !result.data) notFound()

  return <PostDetailClient initialPost={result.data} />
}
