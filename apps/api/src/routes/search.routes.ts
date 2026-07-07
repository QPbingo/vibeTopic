import { Router } from 'express'
import { optionalAuth } from '../middleware/auth.js'
import { error, paginated } from '../lib/response.js'
import { searchService } from '../services/search.service.js'
import { z } from 'zod'
import { validate } from '../middleware/validate.js'

export const searchRouter = Router()

const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(200),
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
})

searchRouter.get('/', optionalAuth, validate('query', searchQuerySchema), async (req, res) => {
  const result = await searchService.search({
    q: (req.query.q as string) || '',
    cursor: req.query.cursor as string | undefined,
    limit: req.query.limit as unknown as number | undefined,
    userId: req.user?.sub,
  })
  if (!result.success) return error(res, result.error.code, 400, result.error.message)
  return paginated(res, result.data.items, result.data.cursor, result.data.hasMore)
})
