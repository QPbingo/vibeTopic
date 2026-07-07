import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import { success, error } from '../lib/response.js'
import { ErrorCodes } from '@bingo/shared'
import { notificationService } from '../services/notification.service.js'

export const followRouter = Router()

followRouter.post('/', requireAuth, async (req, res) => {
  const { targetUserId } = req.body
  const userId = req.user!.sub
  if (!targetUserId) return error(res, ErrorCodes.VALIDATION_ERROR, 400)
  if (targetUserId === userId) return error(res, ErrorCodes.CANNOT_FOLLOW_SELF, 400)

  const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } })
  if (!targetUser || targetUser.status === 'deleted') return error(res, ErrorCodes.FOLLOW_TARGET_NOT_FOUND, 404)

  const existing = await prisma.userFollow.findUnique({ where: { followerId_followeeId: { followerId: userId, followeeId: targetUserId } } })
  if (existing) return error(res, ErrorCodes.ALREADY_FOLLOWED, 400)

  await prisma.userFollow.create({ data: { followerId: userId, followeeId: targetUserId } })
  await notificationService.create({ userId: targetUserId, type: 'follow', actorId: userId, content: '关注了你' }).catch(() => {})
  return success(res, null, 201)
})

followRouter.delete('/:userId', requireAuth, async (req, res) => {
  const userId = req.user!.sub
  const targetUserId = req.params.userId as string
  const existing = await prisma.userFollow.findUnique({ where: { followerId_followeeId: { followerId: userId, followeeId: targetUserId } } })
  if (!existing) return error(res, ErrorCodes.NOT_FOLLOWED, 400)
  await prisma.userFollow.delete({ where: { followerId_followeeId: { followerId: userId, followeeId: targetUserId } } })
  return success(res, null)
})
