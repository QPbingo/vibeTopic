import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { success, paginated } from '../lib/response.js'
import { notificationService } from '../services/notification.service.js'
import { z } from 'zod'
import { validate } from '../middleware/validate.js'

export const notificationRouter = Router()

const notificationQuerySchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
})

notificationRouter.get('/', requireAuth, validate('query', notificationQuerySchema), async (req, res) => {
  const result = await notificationService.list(req.user!.sub, {
    cursor: req.query.cursor as string | undefined,
    limit: req.query.limit as unknown as number | undefined,
  })
  if (!result.success) return paginated(res, [], null, false)
  return paginated(res, result.data.items, result.data.cursor, result.data.hasMore)
})

notificationRouter.get('/unread-count', requireAuth, async (req, res) => {
  const result = await notificationService.unreadCount(req.user!.sub)
  if (!result.success) return success(res, { count: 0 })
  return success(res, result.data)
})

notificationRouter.post('/read', requireAuth, async (req, res) => {
  await notificationService.markRead(req.user!.sub)
  return success(res, null)
})
