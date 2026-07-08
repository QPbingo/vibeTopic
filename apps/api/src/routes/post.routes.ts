import { Router } from 'express'
import { z } from 'zod'
import { postService } from '../services/post.service.js'
import { requireAuth, optionalAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { createPostLimiter } from '../middleware/ratelimit.js'
import { success, error, paginated } from '../lib/response.js'
import { ErrorCodes } from '@bingo/shared'

export const postRouter = Router()

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  contentMd: z.string().min(1).max(50000),
  contentHtml: z.string().min(1).optional(),
  tags: z.array(z.string().max(50)).max(5).optional(),
  media: z.array(z.object({
    type: z.enum(['image', 'video']),
    url: z.string(),
    placeholderType: z.string().optional(),
    duration: z.string().optional(),
    isLive: z.boolean().optional(),
    alt: z.string().optional(),
    title: z.string().optional(),
  })).max(10).optional(),
})

const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  contentMd: z.string().min(1).max(50000).optional(),
  contentHtml: z.string().min(1).optional(),
  tags: z.array(z.string().max(50)).max(5).optional(),
  media: z.array(z.object({
    type: z.enum(['image', 'video']),
    url: z.string(),
    placeholderType: z.string().optional(),
    duration: z.string().optional(),
    isLive: z.boolean().optional(),
    alt: z.string().optional(),
    title: z.string().optional(),
  })).max(10).optional(),
})

const feedQuerySchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sort: z.enum(['latest', 'hot', 'featured']).default('latest'),
})

postRouter.get('/', optionalAuth, validate('query', feedQuerySchema), async (req, res) => {
  const result = await postService.list({
    cursor: req.query.cursor as string | undefined,
    limit: req.query.limit as unknown as number | undefined,
    sort: req.query.sort as 'latest' | 'hot' | 'featured',
    userId: req.user?.sub,
  })
  if (!result.success) return error(res, result.error.code, 400, result.error.message)
  return paginated(res, result.data.items, result.data.cursor, result.data.hasMore)
})

postRouter.post('/', requireAuth, createPostLimiter, validate('body', createPostSchema), async (req, res) => {
  const result = await postService.create(req.user!.sub, req.body)
  if (!result.success) return error(res, result.error.code, 400, result.error.message)
  return success(res, result.data, 201)
})

postRouter.get('/:slug', optionalAuth, async (req, res) => {
  const incrementView = req.query.incrementView === 'true'
  const result = await postService.getBySlug(req.params.slug as string, req.user?.sub, incrementView)
  if (!result.success) return error(res, result.error.code, 404, result.error.message)
  return success(res, result.data)
})

postRouter.patch('/:id', requireAuth, validate('body', updatePostSchema), async (req, res) => {
  const result = await postService.update(req.params.id as string, req.user!.sub, req.body)
  if (!result.success) {
    const status = result.error.code === ErrorCodes.POST_EDIT_FORBIDDEN ? 403 : 400
    return error(res, result.error.code, status, result.error.message)
  }
  return success(res, result.data)
})

postRouter.delete('/:id', requireAuth, async (req, res) => {
  const result = await postService.delete(req.params.id as string, req.user!.sub, req.user!.role)
  if (!result.success) {
    const status = result.error.code === ErrorCodes.POST_DELETE_FORBIDDEN ? 403 : 404
    return error(res, result.error.code, status, result.error.message)
  }
  return success(res, null)
})

postRouter.post('/:id/resubmit', requireAuth, async (req, res) => {
  const result = await postService.resubmit(req.params.id as string, req.user!.sub)
  if (!result.success) {
    const status = result.error.code === ErrorCodes.POST_EDIT_FORBIDDEN ? 403 : 400
    return error(res, result.error.code, status, result.error.message)
  }
  return success(res, result.data)
})

postRouter.post('/:id/like', requireAuth, async (req, res) => {
  const result = await postService.like(req.params.id as string, req.user!.sub)
  if (!result.success) return error(res, result.error.code, 400, result.error.message)
  return success(res, null)
})

postRouter.delete('/:id/like', requireAuth, async (req, res) => {
  const result = await postService.unlike(req.params.id as string, req.user!.sub)
  if (!result.success) return error(res, result.error.code, 400, result.error.message)
  return success(res, null)
})

postRouter.post('/:id/bookmark', requireAuth, async (req, res) => {
  const result = await postService.bookmark(req.params.id as string, req.user!.sub)
  if (!result.success) return error(res, result.error.code, 400, result.error.message)
  return success(res, null)
})

postRouter.delete('/:id/bookmark', requireAuth, async (req, res) => {
  const result = await postService.unbookmark(req.params.id as string, req.user!.sub)
  if (!result.success) return error(res, result.error.code, 400, result.error.message)
  return success(res, null)
})
