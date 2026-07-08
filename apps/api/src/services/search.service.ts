import { prisma } from '../lib/prisma.js'
import { AppConfig, ErrorCodes } from '@bingo/shared'
import { getLimit } from '../lib/pagination.js'
import type { ServiceResult } from '../lib/result.js'
import type { PostMedia } from '@bingo/shared'
import { Prisma } from '@prisma/client'

type SearchPost = Prisma.PostGetPayload<{
  include: { author: { select: { id: true; username: true; avatarUrl: true } }; postTags: { include: { tag: true } } }
}>

export const searchService = {
  async search(params: { q: string; cursor?: string; limit?: number; userId?: string }): Promise<ServiceResult<{ items: unknown[]; cursor: string | null; hasMore: boolean; query: string }>> {
    const { q, cursor, userId } = params
    if (!q?.trim()) return { success: false, error: { code: ErrorCodes.SEARCH_KEYWORD_EMPTY, message: '搜索关键词不能为空' } }
    if (q.trim().length < AppConfig.SEARCH_KEYWORD_MIN_LENGTH) return { success: false, error: { code: ErrorCodes.SEARCH_KEYWORD_TOO_SHORT, message: '搜索关键词过短' } }

    const limit = getLimit(params.limit, AppConfig.SEARCH_PAGE_SIZE)
    const take = limit + 1

    // Try PostgreSQL tsvector FTS first, fall back to ILIKE
    let posts: SearchPost[]
    try {
      // Sanitize search tokens: remove tsquery operators and punctuation
      const sanitized = q.trim().replace(/[&|!:*()'"]/g, ' ').replace(/\s+/g, ' ').trim()
      if (!sanitized) {
        return { success: true, data: { items: [], cursor: null, hasMore: false, query: q } }
      }
      const tsquery = sanitized.split(/\s+/).map(w => w + ':*').join(' & ')
      const cursorPost = cursor
        ? await prisma.post.findUnique({ where: { id: cursor }, select: { createdAt: true } })
        : null
      if (cursor && !cursorPost) {
        return { success: true, data: { items: [], cursor: null, hasMore: false, query: q } }
      }
      const cursorClause = cursorPost
        ? Prisma.sql`AND (p.created_at, p.id) < (${cursorPost.createdAt}, ${cursor}::uuid)`
        : Prisma.empty
      const rawPosts = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
        SELECT p.id FROM posts p
         WHERE p.status = 'published'
         AND p.tsv_content @@ to_tsquery('simple', ${tsquery})
         ${cursorClause}
         ORDER BY p.created_at DESC, p.id DESC
         LIMIT ${take}`)
      const ids = rawPosts.map((r: { id: string }) => r.id)

      if (ids.length > 0) {
        posts = await prisma.post.findMany({
          where: { id: { in: ids } },
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          include: { author: { select: { id: true, username: true, avatarUrl: true } }, postTags: { include: { tag: true } } },
        })
      } else {
        posts = []
      }
    } catch {
      // Fall back to ILIKE
      const where: Record<string, unknown> = {
        status: 'published',
        OR: [{ title: { contains: q, mode: 'insensitive' as const } }, { contentMd: { contains: q, mode: 'insensitive' as const } }],
      }
      posts = await prisma.post.findMany({
        where, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        include: { author: { select: { id: true, username: true, avatarUrl: true } }, postTags: { include: { tag: true } } },
      }) as unknown as SearchPost[]
    }

    const hasMore = posts.length > limit
    const items = hasMore ? posts.slice(0, limit) : posts

    let likedIds = new Set<string>()
    let bookmarkedIds = new Set<string>()
    if (userId && items.length > 0) {
      const ids = items.map(p => p.id)
      const [likes, bookmarks] = await Promise.all([
        prisma.like.findMany({ where: { userId, targetType: 'post', targetId: { in: ids } }, select: { targetId: true } }),
        prisma.bookmark.findMany({ where: { userId, postId: { in: ids } }, select: { postId: true } }),
      ])
      likedIds = new Set(likes.map(l => l.targetId))
      bookmarkedIds = new Set(bookmarks.map(b => b.postId))
    }

    function makeExcerpt(contentMd: string, keyword: string): string {
      const plain = contentMd.replace(/#{1,6}\s/g, '').replace(/\*\*?|__?|~~|`/g, '')
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '')
        .replace(/\n+/g, ' ').trim()
      const idx = plain.toLowerCase().indexOf(keyword.toLowerCase())
      if (idx > -1) {
        const start = Math.max(0, idx - 60), end = Math.min(plain.length, idx + keyword.length + 100)
        return (start > 0 ? '...' : '') + plain.slice(start, end) + (end < plain.length ? '...' : '')
      }
      return plain.length > 200 ? plain.slice(0, 200) + '...' : plain
    }

    const postCards = items.map((post: SearchPost) => ({
      id: post.id, title: post.title, slug: post.slug, excerpt: makeExcerpt(post.contentMd, q),
      status: post.status, likeCount: post.likeCount, commentCount: post.commentCount,
      bookmarkCount: post.bookmarkCount, viewCount: post.viewCount, isPinned: post.isPinned,
      createdAt: post.createdAt.toISOString(), author: post.author,
      tags: post.postTags.map(pt => ({ id: pt.tag.id, name: pt.tag.name, slug: pt.tag.slug, description: pt.tag.description, isOfficial: pt.tag.isOfficial, postCount: pt.tag.postCount, createdAt: pt.tag.createdAt.toISOString() })),
      isLiked: likedIds.has(post.id), isBookmarked: bookmarkedIds.has(post.id),
      media: (post.media as unknown as PostMedia[]) ?? [],
    }))

    return { success: true, data: { items: postCards, cursor: items.length > 0 ? items[items.length - 1]!.id : null, hasMore, query: q } }
  },
}
