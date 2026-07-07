import { prisma } from '../lib/prisma.js'
import { AppConfig } from '@bingo/shared'
import { getLimit } from '../lib/pagination.js'
import type { ServiceResult } from '../lib/result.js'
import type { Prisma } from '@prisma/client'
import { pushNotification } from './sse.service.js'

export const notificationService = {
  async create(data: Prisma.NotificationUncheckedCreateInput) {
    const notification = await prisma.notification.create({ data })
    void pushNotification(notification.userId, notification.id)
    return notification
  },

  async list(userId: string, params: { cursor?: string; limit?: number }): Promise<ServiceResult<{ items: unknown[]; cursor: string | null; hasMore: boolean }>> {
    const limit = getLimit(params.limit, AppConfig.NOTIFICATION_PAGE_SIZE)
    const take = limit + 1
    const where: Record<string, unknown> = { userId }

    const notifications = await prisma.notification.findMany({
      where, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take,
      ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
      include: { actor: { select: { id: true, username: true, avatarUrl: true } } },
    })

    const hasMore = notifications.length > limit
    const items = hasMore ? notifications.slice(0, limit) : notifications
    const result = items.map(n => ({
      id: n.id, userId: n.userId, type: n.type, actorId: n.actorId,
      targetType: n.targetType, targetId: n.targetId, content: n.content,
      isRead: n.isRead, createdAt: n.createdAt.toISOString(), actor: n.actor,
    }))
    return { success: true, data: { items: result, cursor: items.length > 0 ? items[items.length - 1]!.id : null, hasMore } }
  },

  async unreadCount(userId: string): Promise<ServiceResult<{ count: number }>> {
    const count = await prisma.notification.count({ where: { userId, isRead: false } })
    return { success: true, data: { count } }
  },

  async markRead(userId: string): Promise<ServiceResult<null>> {
    await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } })
    return { success: true, data: null }
  },
}
