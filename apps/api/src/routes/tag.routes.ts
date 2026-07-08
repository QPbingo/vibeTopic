import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { optionalAuth } from '../middleware/auth.js'
import { success, error } from '../lib/response.js'
import { postService } from '../services/post.service.js'
import { z } from 'zod'
import { validate } from '../middleware/validate.js'

export const tagRouter = Router()

const tagFeedQuerySchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
})

tagRouter.get('/', async (_req, res) => {
  const tags = await prisma.tag.findMany({ orderBy: [{ isOfficial: 'desc' }, { postCount: 'desc' }] })
  return success(res, tags.map(t => ({
    id: t.id, name: t.name, slug: t.slug, description: t.description,
    isOfficial: t.isOfficial, postCount: t.postCount, createdAt: t.createdAt.toISOString(),
  })))
})

tagRouter.get('/:slug', optionalAuth, validate('query', tagFeedQuerySchema), async (req, res) => {
  const result = await postService.listByTag(req.params.slug as string, {
    cursor: req.query.cursor as string | undefined,
    limit: req.query.limit as unknown as number | undefined,
    userId: req.user?.sub,
  })
  if (!result.success) return error(res, result.error.code, 404, result.error.message)
  const { tag, ...rest } = result.data
  return success(res, { tag, ...rest })
})
