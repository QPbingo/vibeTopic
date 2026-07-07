import { prisma } from '../lib/prisma.js'
import { AppConfig, ErrorCodes } from '@bingo/shared'
import { getLimit } from '../lib/pagination.js'
import type { CreatePostInput, UpdatePostInput, FeedSort } from '@bingo/shared'
import type { ServiceResult } from '../lib/result.js'
import { renderMarkdown } from '../lib/content.js'
import { notificationService } from './notification.service.js'
import { config } from '../config.js'

function generateSlug(title: string): string {
  const base = title.toLowerCase().replace(/[^a-z0-9一-鿿]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 100)
  const random = Math.random().toString(36).slice(2, 8)
  return `${base}-${random}`
}

function createExcerpt(contentMd: string, maxLen = 200): string {
  const plain = contentMd
    .replace(/#{1,6}\s/g, '').replace(/\*\*?|__?|~~|`/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '[图片]')
    .replace(/```[\s\S]*?```/g, '[代码块]').replace(/`[^`]*`/g, '[代码]')
    .replace(/\n+/g, ' ').trim()
  return plain.length > maxLen ? plain.slice(0, maxLen) + '...' : plain
}

type PostCardData = {
  id: string; title: string; slug: string; excerpt: string; status: string
  likeCount: number; commentCount: number; bookmarkCount: number; viewCount: number
  isPinned: boolean; createdAt: string
  author: { id: string; username: string; avatarUrl: string | null }
  tags: Array<{ id: string; name: string; slug: string; description: string | null; isOfficial: boolean; postCount: number; createdAt: string }>
  isLiked: boolean; isBookmarked: boolean
}

type PaginatedData = { items: PostCardData[]; cursor: string | null; hasMore: boolean }

export const postService = {
  async list(params: { cursor?: string; limit?: number; sort?: FeedSort; userId?: string }): Promise<ServiceResult<PaginatedData>> {
    const { cursor, sort = 'latest', userId } = params
    const limit = getLimit(params.limit)
    const take = limit + 1
    const where: Record<string, unknown> = { status: 'published' }
    if (sort === 'featured') where.isPinned = true

    const orderBy = sort === 'hot'
      ? [{ isPinned: 'desc' as const }, { likeCount: 'desc' as const }, { createdAt: 'desc' as const }, { id: 'desc' as const }]
      : [{ isPinned: 'desc' as const }, { createdAt: 'desc' as const }, { id: 'desc' as const }]

    const posts = await prisma.post.findMany({
      where, orderBy, take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: { author: { select: { id: true, username: true, avatarUrl: true } }, postTags: { include: { tag: true } } },
    })

    const hasMore = posts.length > limit
    const items = hasMore ? posts.slice(0, limit) : posts

    let likedIds = new Set<string>(), bookmarkedIds = new Set<string>()
    if (userId && items.length > 0) {
      const ids = items.map(p => p.id)
      const [likes, bookmarks] = await Promise.all([
        prisma.like.findMany({ where: { userId, targetType: 'post', targetId: { in: ids } }, select: { targetId: true } }),
        prisma.bookmark.findMany({ where: { userId, postId: { in: ids } }, select: { postId: true } }),
      ])
      likedIds = new Set(likes.map(l => l.targetId))
      bookmarkedIds = new Set(bookmarks.map(b => b.postId))
    }

    const postCards: PostCardData[] = items.map(post => ({
      id: post.id, title: post.title, slug: post.slug, excerpt: createExcerpt(post.contentMd),
      status: post.status, likeCount: post.likeCount, commentCount: post.commentCount,
      bookmarkCount: post.bookmarkCount, viewCount: post.viewCount, isPinned: post.isPinned,
      createdAt: post.createdAt.toISOString(), author: post.author,
      tags: post.postTags.map(pt => ({ id: pt.tag.id, name: pt.tag.name, slug: pt.tag.slug, description: pt.tag.description, isOfficial: pt.tag.isOfficial, postCount: pt.tag.postCount, createdAt: pt.tag.createdAt.toISOString() })),
      isLiked: likedIds.has(post.id), isBookmarked: bookmarkedIds.has(post.id),
    }))

    return { success: true, data: { items: postCards, cursor: items.length > 0 ? items[items.length - 1]!.id : null, hasMore } }
  },

  async getBySlug(slug: string, userId?: string): Promise<ServiceResult<Record<string, unknown>>> {
    const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug)
    const post = await prisma.post.findUnique({
      where: isId ? { id: slug } : { slug },
      include: { author: { select: { id: true, username: true, avatarUrl: true } }, postTags: { include: { tag: true } } },
    })
    if (!post || (post.status !== 'published' && post.userId !== userId)) {
      return { success: false, error: { code: ErrorCodes.POST_NOT_FOUND, message: '帖子不存在' } }
    }
    await prisma.post.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } })

    let isLiked = false, isBookmarked = false
    if (userId) {
      const [like, bookmark] = await Promise.all([
        prisma.like.findUnique({ where: { userId_targetType_targetId: { userId, targetType: 'post', targetId: post.id } } }),
        prisma.bookmark.findUnique({ where: { userId_postId: { userId, postId: post.id } } }),
      ])
      isLiked = !!like; isBookmarked = !!bookmark
    }

    return {
      success: true,
      data: {
        id: post.id, title: post.title, contentMd: post.contentMd, contentHtml: post.contentHtml,
        slug: post.slug, userId: post.userId, status: post.status,
        viewCount: post.viewCount + 1, likeCount: post.likeCount, commentCount: post.commentCount,
        bookmarkCount: post.bookmarkCount, isPinned: post.isPinned,
        editedAt: post.editedAt?.toISOString() ?? null, createdAt: post.createdAt.toISOString(), updatedAt: post.updatedAt.toISOString(),
        author: post.author,
        tags: post.postTags.map(pt => ({ id: pt.tag.id, name: pt.tag.name, slug: pt.tag.slug, description: pt.tag.description, isOfficial: pt.tag.isOfficial, postCount: pt.tag.postCount, createdAt: pt.tag.createdAt.toISOString() })),
        isLiked, isBookmarked,
      },
    }
  },

  async create(userId: string, input: CreatePostInput): Promise<ServiceResult<Record<string, unknown>>> {
    if (!input.title?.trim()) return { success: false, error: { code: ErrorCodes.POST_TITLE_EMPTY, message: '标题不能为空' } }
    if (input.title.length > AppConfig.POST_TITLE_MAX_LENGTH) return { success: false, error: { code: ErrorCodes.POST_TITLE_TOO_LONG, message: `标题不能超过${AppConfig.POST_TITLE_MAX_LENGTH}个字符` } }
    if (!input.contentMd?.trim()) return { success: false, error: { code: ErrorCodes.POST_CONTENT_EMPTY, message: '内容不能为空' } }
    if (input.contentMd.length > AppConfig.POST_CONTENT_MAX_LENGTH) return { success: false, error: { code: ErrorCodes.POST_CONTENT_TOO_LONG, message: `内容不能超过${AppConfig.POST_CONTENT_MAX_LENGTH}个字符` } }
    const tags = [...new Map((input.tags || []).map(tag => [tag.trim().toLocaleLowerCase(), tag.trim()])).values()]
    if (tags.length > AppConfig.POST_TAG_MAX_COUNT) return { success: false, error: { code: ErrorCodes.POST_TAG_LIMIT_EXCEEDED, message: `每帖最多${AppConfig.POST_TAG_MAX_COUNT}个标签` } }
    if (tags.some(tag => tag.length < AppConfig.TAG_NAME_MIN_LENGTH || tag.length > AppConfig.TAG_NAME_MAX_LENGTH)) {
      return { success: false, error: { code: ErrorCodes.TAG_NAME_INVALID, message: `标签名称需为${AppConfig.TAG_NAME_MIN_LENGTH}-${AppConfig.TAG_NAME_MAX_LENGTH}个字符` } }
    }

    const slug = generateSlug(input.title)
    const post = await prisma.post.create({
      data: {
        title: input.title.trim(), contentMd: input.contentMd, contentHtml: renderMarkdown(input.contentMd),
        slug, userId, status: config.contentSafety.enabled ? 'pending_review' : 'published',
        postTags: { create: await Promise.all(tags.map(async (tagName) => {
          const tagSlug = tagName.toLowerCase().replace(/\s+/g, '-')
          const tag = await prisma.tag.upsert({ where: { slug: tagSlug }, update: {}, create: { name: tagName, slug: tagSlug, isOfficial: false } })
          return { tagId: tag.id }
        })) },
      },
      include: { author: { select: { id: true, username: true, avatarUrl: true } }, postTags: { include: { tag: true } } },
    })

    return {
      success: true,
      data: {
        id: post.id, title: post.title, slug: post.slug, status: post.status, createdAt: post.createdAt.toISOString(),
        author: post.author, tags: post.postTags.map(pt => ({ id: pt.tag.id, name: pt.tag.name, slug: pt.tag.slug })),
      },
    }
  },

  async update(postId: string, userId: string, input: UpdatePostInput): Promise<ServiceResult<Record<string, unknown>>> {
    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (!post) return { success: false, error: { code: ErrorCodes.POST_NOT_FOUND, message: '帖子不存在' } }
    if (post.userId !== userId) return { success: false, error: { code: ErrorCodes.POST_EDIT_FORBIDDEN, message: '无权限编辑该帖子' } }
    // Only rejected posts can be edited per PRD section 4.2.1
    if (post.status !== 'rejected') {
      if (post.status === 'pending_review') return { success: false, error: { code: ErrorCodes.POST_UNDER_REVIEW, message: '帖子正在审核中，暂不可编辑' } }
      return { success: false, error: { code: ErrorCodes.POST_EDIT_FORBIDDEN, message: '仅审核未通过的帖子可以编辑' } }
    }

    const data: Record<string, unknown> = { editedAt: new Date() }
    if (input.title) data.title = input.title
    if (input.contentMd) {
      data.contentMd = input.contentMd
      data.contentHtml = renderMarkdown(input.contentMd)
    }

    const updated = await prisma.post.update({ where: { id: postId }, data })
    return { success: true, data: { id: updated.id, slug: updated.slug, updatedAt: updated.updatedAt.toISOString() } }
  },

  async delete(postId: string, userId: string, userRole: string): Promise<ServiceResult<null>> {
    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (!post) return { success: false, error: { code: ErrorCodes.POST_NOT_FOUND, message: '帖子不存在' } }
    if (post.userId !== userId && userRole !== 'admin') return { success: false, error: { code: ErrorCodes.POST_DELETE_FORBIDDEN, message: '无权限删除该帖子' } }
    await prisma.post.update({ where: { id: postId }, data: { status: 'deleted' } })
    return { success: true, data: null }
  },

  async resubmit(postId: string, userId: string): Promise<ServiceResult<Record<string, unknown>>> {
    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (!post) return { success: false, error: { code: ErrorCodes.POST_NOT_FOUND, message: '帖子不存在' } }
    if (post.userId !== userId) return { success: false, error: { code: ErrorCodes.POST_EDIT_FORBIDDEN, message: '无权限编辑该帖子' } }
    if (post.status !== 'rejected') return { success: false, error: { code: ErrorCodes.POST_UNDER_REVIEW, message: '仅审核未通过的帖子可以重新提交' } }
    const status = config.contentSafety.enabled ? 'pending_review' : 'published'
    const updated = await prisma.post.update({ where: { id: postId }, data: { status } })
    return { success: true, data: { id: updated.id, slug: updated.slug, status: updated.status } }
  },

  async like(postId: string, userId: string): Promise<ServiceResult<null>> {
    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (!post || post.status === 'deleted') return { success: false, error: { code: ErrorCodes.POST_NOT_FOUND, message: '帖子不存在' } }
    if (post.status !== 'published') return { success: false, error: { code: ErrorCodes.POST_NOT_FOUND, message: '帖子不存在' } }
    const existing = await prisma.like.findUnique({ where: { userId_targetType_targetId: { userId, targetType: 'post', targetId: postId } } })
    if (existing) return { success: false, error: { code: ErrorCodes.ALREADY_LIKED, message: '已点赞' } }
    await prisma.like.create({ data: { userId, targetType: 'post', targetId: postId } })
    if (post.userId !== userId) {
      await notificationService.create({ userId: post.userId, type: 'like', actorId: userId, targetType: 'post', targetId: postId, content: '点赞了你的帖子' }).catch(() => {})
    }
    return { success: true, data: null }
  },

  async unlike(postId: string, userId: string): Promise<ServiceResult<null>> {
    const existing = await prisma.like.findUnique({ where: { userId_targetType_targetId: { userId, targetType: 'post', targetId: postId } } })
    if (!existing) return { success: false, error: { code: ErrorCodes.NOT_LIKED, message: '未点赞' } }
    await prisma.like.delete({ where: { id: existing.id } })
    return { success: true, data: null }
  },

  async bookmark(postId: string, userId: string): Promise<ServiceResult<null>> {
    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (!post || post.status === 'deleted') return { success: false, error: { code: ErrorCodes.BOOKMARK_POST_NOT_FOUND, message: '帖子不存在' } }
    if (post.status !== 'published') return { success: false, error: { code: ErrorCodes.BOOKMARK_POST_NOT_FOUND, message: '帖子不存在' } }
    const existing = await prisma.bookmark.findUnique({ where: { userId_postId: { userId, postId } } })
    if (existing) return { success: false, error: { code: ErrorCodes.ALREADY_BOOKMARKED, message: '已收藏' } }
    await prisma.bookmark.create({ data: { userId, postId } })
    if (post.userId !== userId) {
      await notificationService.create({ userId: post.userId, type: 'bookmark', actorId: userId, targetType: 'post', targetId: postId, content: '收藏了你的帖子' }).catch(() => {})
    }
    return { success: true, data: null }
  },

  async unbookmark(postId: string, userId: string): Promise<ServiceResult<null>> {
    const existing = await prisma.bookmark.findUnique({ where: { userId_postId: { userId, postId } } })
    if (!existing) return { success: false, error: { code: ErrorCodes.NOT_BOOKMARKED, message: '未收藏' } }
    await prisma.bookmark.delete({ where: { id: existing.id } })
    return { success: true, data: null }
  },

  async listByTag(tagSlug: string, params: { cursor?: string; limit?: number; userId?: string }): Promise<ServiceResult<{ tag: Record<string, unknown>; items: PostCardData[]; cursor: string | null; hasMore: boolean }>> {
    const tag = await prisma.tag.findUnique({ where: { slug: tagSlug } })
    if (!tag) return { success: false, error: { code: ErrorCodes.TAG_NOT_FOUND, message: '标签不存在' } }
    const { cursor, userId } = params
    const limit = getLimit(params.limit)
    const take = limit + 1
    const posts = await prisma.post.findMany({
      where: { status: 'published', postTags: { some: { tagId: tag.id } } },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: { author: { select: { id: true, username: true, avatarUrl: true } }, postTags: { include: { tag: true } } },
    })

    const hasMore = posts.length > limit
    const items = hasMore ? posts.slice(0, limit) : posts
    let likedIds = new Set<string>()
    let bookmarkedIds = new Set<string>()
    if (userId && items.length > 0) {
      const ids = items.map(post => post.id)
      const [likes, bookmarks] = await Promise.all([
        prisma.like.findMany({ where: { userId, targetType: 'post', targetId: { in: ids } }, select: { targetId: true } }),
        prisma.bookmark.findMany({ where: { userId, postId: { in: ids } }, select: { postId: true } }),
      ])
      likedIds = new Set(likes.map(l => l.targetId))
      bookmarkedIds = new Set(bookmarks.map(b => b.postId))
    }

    const postCards: PostCardData[] = items.map(post => ({
      id: post.id, title: post.title, slug: post.slug, excerpt: createExcerpt(post.contentMd),
      status: post.status, likeCount: post.likeCount, commentCount: post.commentCount,
      bookmarkCount: post.bookmarkCount, viewCount: post.viewCount, isPinned: post.isPinned,
      createdAt: post.createdAt.toISOString(), author: post.author,
      tags: post.postTags.map(pt => ({ id: pt.tag.id, name: pt.tag.name, slug: pt.tag.slug, description: pt.tag.description, isOfficial: pt.tag.isOfficial, postCount: pt.tag.postCount, createdAt: pt.tag.createdAt.toISOString() })),
      isLiked: likedIds.has(post.id), isBookmarked: bookmarkedIds.has(post.id),
    }))

    return {
      success: true,
      data: {
        tag: { id: tag.id, name: tag.name, slug: tag.slug, description: tag.description, isOfficial: tag.isOfficial, postCount: tag.postCount, createdAt: tag.createdAt.toISOString() },
        items: postCards, cursor: items.length > 0 ? items[items.length - 1]!.id : null, hasMore,
      },
    }
  },
}
