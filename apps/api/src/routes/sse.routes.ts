import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { success } from '../lib/response.js'
import { authService } from '../services/auth.service.js'

export const sseRouter = Router()

// POST /api/v1/sse/token — get short-lived SSE ticket
sseRouter.post('/token', requireAuth, async (req, res) => {
  const ticket = await authService.getSSETicket(req.user!.sub)
  return success(res, ticket)
})
