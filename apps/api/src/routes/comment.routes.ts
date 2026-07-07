import { Router } from 'express'
import { z } from 'zod'
import { commentService } from '../services/comment.service.js'
import { requireAuth, optionalAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { success, error } from '../lib/response.js'

export const commentRouter = Router()

const createCommentSchema = z.object({
  contentMd: z.string().min(1).max(5000),
  contentHtml: z.string().min(1).optional(),
  parentId: z.string().uuid().optional(),
})

commentRouter.get('/posts/:postId/comments', optionalAuth, async (req, res) => {
  const result = await commentService.list(req.params.postId as string, req.user?.sub)
  if (!result.success) return error(res, result.error.code, 404, result.error.message)
  return success(res, result.data)
})

commentRouter.post('/posts/:postId/comments', requireAuth, validate('body', createCommentSchema), async (req, res) => {
  const result = await commentService.create(req.params.postId as string, req.user!.sub, req.body)
  if (!result.success) return error(res, result.error.code, 400, result.error.message)
  return success(res, result.data, 201)
})

commentRouter.delete('/comments/:id', requireAuth, async (req, res) => {
  const result = await commentService.delete(req.params.id as string, req.user!.sub, req.user!.role)
  if (!result.success) {
    const status = result.error.code === 14007 ? 403 : 404
    return error(res, result.error.code, status, result.error.message)
  }
  return success(res, null)
})

commentRouter.post('/comments/:id/like', requireAuth, async (req, res) => {
  const result = await commentService.like(req.params.id as string, req.user!.sub)
  if (!result.success) return error(res, result.error.code, 400, result.error.message)
  return success(res, null)
})

commentRouter.delete('/comments/:id/like', requireAuth, async (req, res) => {
  const result = await commentService.unlike(req.params.id as string, req.user!.sub)
  if (!result.success) return error(res, result.error.code, 400, result.error.message)
  return success(res, null)
})
