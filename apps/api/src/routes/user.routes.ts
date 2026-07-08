import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth, optionalAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { success, error, paginated } from '../lib/response.js'
import { ErrorCodes, type PostMedia } from '@bingo/shared'
import { getLimit } from '../lib/pagination.js'
import type { Prisma } from '@prisma/client'

export const userRouter = Router()

type UserWithCounts = Prisma.UserGetPayload<{
  include: { _count: { select: { followers: true; followees: true; posts: { where: { status: 'published' } }; projects: true } } }
}>

const updateProfileSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  bio: z.string().max(500).optional(),
  avatarUrl: z.string().url().nullable().optional(),
})

userRouter.get('/', async (req, res) => {
  const limit = getLimit(req.query.limit ? parseInt(req.query.limit as string, 10) : 5, 5)
  const users = await prisma.user.findMany({
    where: { status: 'active' },
    orderBy: { posts: { _count: 'desc' } },
    take: limit,
    select: {
      id: true, username: true, avatarUrl: true, bio: true,
      _count: { select: { posts: { where: { status: 'published' } }, followers: true } },
    },
  })
  return success(res, users.map(user => ({
    id: user.id, username: user.username, avatarUrl: user.avatarUrl, bio: user.bio,
    postCount: user._count.posts, followerCount: user._count.followers,
  })))
})

userRouter.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.sub },
    include: { _count: { select: { followers: true, followees: true, posts: { where: { status: 'published' } }, projects: true } } },
  })
  if (!user) return error(res, ErrorCodes.USER_NOT_FOUND, 404)
  return success(res, {
    id: user.id, username: user.username, email: user.email, avatarUrl: user.avatarUrl,
    bio: user.bio, githubUsername: user.githubUsername, githubUrl: user.githubUrl,
    role: user.role, status: user.status, lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
    createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString(),
    followerCount: (user as unknown as UserWithCounts)._count?.followers ?? 0,
    followingCount: (user as unknown as UserWithCounts)._count?.followees ?? 0,
    postCount: (user as unknown as UserWithCounts)._count?.posts ?? 0,
    projectCount: (user as unknown as UserWithCounts)._count?.projects ?? 0,
  })
})

userRouter.get('/:id', optionalAuth, async (req, res) => {
  const param = req.params.id as string
  // Try UUID first, then username lookup (UUID v7 format: 8-4-4-4-12 hex chars)
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(param)
  const user = isUuid
    ? await prisma.user.findUnique({
        where: { id: param },
        include: { _count: { select: { followers: true, followees: true, posts: { where: { status: 'published' } }, projects: true } } },
      })
    : await prisma.user.findUnique({
        where: { username: param },
        include: { _count: { select: { followers: true, followees: true, posts: { where: { status: 'published' } }, projects: true } } },
      })
  if (!user || user.status === 'deleted') return error(res, ErrorCodes.USER_NOT_FOUND, 404)

  let isFollowing = false
  if (req.user?.sub && req.user.sub !== user.id) {
    const follow = await prisma.userFollow.findUnique({ where: { followerId_followeeId: { followerId: req.user.sub, followeeId: user.id } } })
    isFollowing = !!follow
  }

  return success(res, {
    id: user.id, username: user.username, avatarUrl: user.avatarUrl, bio: user.bio,
    githubUsername: user.githubUsername, githubUrl: user.githubUrl, role: user.role,
    createdAt: user.createdAt.toISOString(),
    followerCount: (user as unknown as UserWithCounts)._count?.followers ?? 0,
    followingCount: (user as unknown as UserWithCounts)._count?.followees ?? 0,
    postCount: (user as unknown as UserWithCounts)._count?.posts ?? 0,
    projectCount: (user as unknown as UserWithCounts)._count?.projects ?? 0,
    isFollowing,
  })
})

userRouter.get('/:id/posts', optionalAuth, async (req, res) => {
  const param = req.params.id as string
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(param)
  const user = isUuid
    ? await prisma.user.findUnique({ where: { id: param } })
    : await prisma.user.findUnique({ where: { username: param } })
  if (!user || user.status === 'deleted') return error(res, ErrorCodes.USER_NOT_FOUND, 404)

  const limit = getLimit(req.query.limit ? parseInt(req.query.limit as string, 10) : undefined)
  const take = limit + 1
  const cursor = req.query.cursor as string | undefined

  const where: Prisma.PostWhereInput = { userId: user.id, status: 'published' }

  const posts = await prisma.post.findMany({
    where, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      author: { select: { id: true, username: true, avatarUrl: true } },
      postTags: { include: { tag: true } },
    },
  })

  const hasMore = posts.length > limit
  const items = hasMore ? posts.slice(0, limit) : posts
  const nextCursor = items.length > 0 ? items[items.length - 1]!.id : null

  return paginated(res, items.map(p => ({
    id: p.id, title: p.title, slug: p.slug, excerpt: p.contentMd.slice(0, 200),
    status: p.status, likeCount: p.likeCount, commentCount: p.commentCount,
    bookmarkCount: p.bookmarkCount, viewCount: p.viewCount, isPinned: p.isPinned,
    createdAt: p.createdAt.toISOString(),
    author: p.author,
    tags: p.postTags.map(pt => ({ id: pt.tag.id, name: pt.tag.name, slug: pt.tag.slug })),
    media: p.media as unknown as PostMedia[],
  })), nextCursor, hasMore)
})

userRouter.patch('/me', requireAuth, validate('body', updateProfileSchema), async (req, res) => {
  const { username, bio, avatarUrl } = req.body
  if (username) {
    const existing = await prisma.user.findUnique({ where: { username } })
    if (existing && existing.id !== req.user!.sub) return error(res, ErrorCodes.USERNAME_TAKEN, 400)
  }
  const updated = await prisma.user.update({
    where: { id: req.user!.sub },
    data: { ...(username && { username }), ...(bio !== undefined && { bio }), ...(avatarUrl !== undefined && { avatarUrl }) },
  })
  return success(res, { id: updated.id, username: updated.username, avatarUrl: updated.avatarUrl, bio: updated.bio })
})

userRouter.get('/me/posts', requireAuth, async (req, res) => {
  const limit = getLimit(req.query.limit ? parseInt(req.query.limit as string, 10) : undefined)
  const take = limit + 1
  const cursor = req.query.cursor as string | undefined
  const where: Record<string, unknown> = { userId: req.user!.sub }

  const posts = await prisma.post.findMany({
    where, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: { postTags: { include: { tag: true } } },
  })

  const hasMore = posts.length > limit
  const items = hasMore ? posts.slice(0, limit) : posts
  const nextCursor = items.length > 0 ? items[items.length - 1]!.id : null
  return paginated(res, items.map(p => ({
    id: p.id, title: p.title, slug: p.slug, status: p.status,
    likeCount: p.likeCount, commentCount: p.commentCount, createdAt: p.createdAt.toISOString(),
    tags: p.postTags.map(pt => ({ id: pt.tag.id, name: pt.tag.name, slug: pt.tag.slug })),
  })), nextCursor, hasMore)
})

userRouter.get('/:id/followers', async (req, res) => {
  const limit = getLimit(req.query.limit ? parseInt(req.query.limit as string, 10) : undefined)
  const take = limit + 1
  const cursor = req.query.cursor as string | undefined
  const where: Record<string, unknown> = { followeeId: req.params.id as string }
  if (cursor) where.followerId = { lt: cursor }
  const follows = await prisma.userFollow.findMany({
    where, orderBy: { followerId: 'desc' }, take,
    include: { follower: { select: { id: true, username: true, avatarUrl: true, bio: true } } },
  })
  const hasMore = follows.length > limit
  const items = hasMore ? follows.slice(0, limit) : follows
  const nextCursor = items.length > 0 ? items[items.length - 1]!.followerId : null
  return paginated(res, items.map(f => f.follower), nextCursor, hasMore)
})

userRouter.get('/:id/following', async (req, res) => {
  const limit = getLimit(req.query.limit ? parseInt(req.query.limit as string, 10) : undefined)
  const take = limit + 1
  const cursor = req.query.cursor as string | undefined
  const where: Record<string, unknown> = { followerId: req.params.id as string }
  if (cursor) where.followeeId = { lt: cursor }
  const follows = await prisma.userFollow.findMany({
    where, orderBy: { followeeId: 'desc' }, take,
    include: { followee: { select: { id: true, username: true, avatarUrl: true, bio: true } } },
  })
  const hasMore = follows.length > limit
  const items = hasMore ? follows.slice(0, limit) : follows
  const nextCursor = items.length > 0 ? items[items.length - 1]!.followeeId : null
  return paginated(res, items.map(f => f.followee), nextCursor, hasMore)
})

userRouter.get('/:id/projects', async (req, res) => {
  const projects = await prisma.project.findMany({
    where: { userId: req.params.id as string, status: 'published' },
    orderBy: [{ sortOrder: 'desc' }, { createdAt: 'desc' }],
  })
  return success(res, projects.map(p => ({
    id: p.id, title: p.title, description: p.description, coverImage: p.coverImage,
    images: p.images, sourceType: p.sourceType, sourceUrl: p.sourceUrl, createdAt: p.createdAt.toISOString(),
  })))
})
