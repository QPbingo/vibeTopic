import { prisma } from '../lib/prisma.js'
import { AppConfig, ErrorCodes } from '@bingo/shared'
import type { CreateCommentInput } from '@bingo/shared'
import type { ServiceResult } from '../lib/result.js'
import { renderMarkdown } from '../lib/content.js'
import { notificationService } from './notification.service.js'

export const commentService = {
  async list(postId: string, userId?: string): Promise<ServiceResult<unknown[]>> {
    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (!post) return { success: false, error: { code: ErrorCodes.COMMENT_POST_INVALID, message: '帖子不存在或已删除' } }

    const comments = await prisma.comment.findMany({
      where: { postId, status: 'published', parentId: null },
      orderBy: { createdAt: 'asc' },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true } },
        replies: {
          where: { status: 'published' },
          orderBy: { createdAt: 'asc' },
          include: {
            author: { select: { id: true, username: true, avatarUrl: true } },
            replies: {
              where: { status: 'published' },
              orderBy: { createdAt: 'asc' },
              include: { author: { select: { id: true, username: true, avatarUrl: true } } },
            },
          },
        },
      },
    })

    let likedIds = new Set<string>()
    if (userId && comments.length > 0) {
      const allIds = comments.flatMap(c => [c.id, ...c.replies.map(r => r.id), ...c.replies.flatMap(r => r.replies.map(r2 => r2.id))])
      const likes = await prisma.like.findMany({ where: { userId, targetType: 'comment', targetId: { in: allIds } }, select: { targetId: true } })
      likedIds = new Set(likes.map(l => l.targetId))
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapComment = (c: any): Record<string, unknown> => ({
      id: c.id, postId: c.postId, userId: c.userId, parentId: c.parentId, rootId: c.rootId,
      contentMd: c.contentMd, contentHtml: c.contentHtml, depth: c.depth,
      likeCount: c.likeCount, editedAt: c.editedAt?.toISOString() ?? null,
      createdAt: c.createdAt.toISOString(), author: c.author,
      isLiked: likedIds.has(c.id),
      replies: c.replies?.map(mapComment),
    })

    return { success: true, data: comments.map(mapComment) }
  },

  async create(postId: string, userId: string, input: CreateCommentInput): Promise<ServiceResult<Record<string, unknown>>> {
    if (!input.contentMd?.trim()) return { success: false, error: { code: ErrorCodes.COMMENT_CONTENT_EMPTY, message: '评论内容不能为空' } }
    if (input.contentMd.length > AppConfig.COMMENT_CONTENT_MAX_LENGTH) return { success: false, error: { code: ErrorCodes.COMMENT_CONTENT_TOO_LONG, message: '评论内容长度超出限制' } }

    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (!post || post.status === 'deleted') return { success: false, error: { code: ErrorCodes.COMMENT_POST_INVALID, message: '帖子不存在或已删除' } }
    if (post.status !== 'published') return { success: false, error: { code: ErrorCodes.COMMENT_POST_INVALID, message: '帖子不可评论' } }

    let depth = 0, rootId: string | null = null, parentUserId: string | null = null
    if (input.parentId) {
      const parent = await prisma.comment.findUnique({ where: { id: input.parentId } })
      if (!parent || parent.status === 'deleted' || parent.postId !== postId) return { success: false, error: { code: ErrorCodes.COMMENT_PARENT_NOT_FOUND, message: '父评论不存在' } }
      if (parent.depth >= AppConfig.COMMENT_MAX_DEPTH) return { success: false, error: { code: ErrorCodes.COMMENT_DEPTH_EXCEEDED, message: '嵌套深度已达上限' } }
      depth = parent.depth + 1
      rootId = parent.rootId || parent.id
      parentUserId = parent.userId
    }

    const comment = await prisma.comment.create({
      data: { postId, userId, parentId: input.parentId || null, rootId, contentMd: input.contentMd, contentHtml: renderMarkdown(input.contentMd), depth },
      include: { author: { select: { id: true, username: true, avatarUrl: true } } },
    })

    if (parentUserId && parentUserId !== userId) {
      await notificationService.create({ userId: parentUserId, type: 'reply', actorId: userId, targetType: 'comment', targetId: comment.id, content: '回复了你的评论' }).catch(() => {})
    }
    if (!parentUserId && post.userId !== userId) {
      await notificationService.create({ userId: post.userId, type: 'comment', actorId: userId, targetType: 'post', targetId: postId, content: '评论了你的帖子' }).catch(() => {})
    }

    return { success: true, data: { id: comment.id, parentId: comment.parentId, rootId: comment.rootId, depth: comment.depth, contentMd: comment.contentMd, contentHtml: comment.contentHtml, createdAt: comment.createdAt.toISOString(), author: comment.author } }
  },

  async delete(commentId: string, userId: string, userRole: string): Promise<ServiceResult<null>> {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } })
    if (!comment) return { success: false, error: { code: ErrorCodes.COMMENT_NOT_FOUND, message: '评论不存在' } }
    if (comment.userId !== userId && userRole !== 'admin') return { success: false, error: { code: ErrorCodes.COMMENT_DELETE_FORBIDDEN, message: '无权限删除该评论' } }
    await prisma.comment.update({ where: { id: commentId }, data: { status: 'deleted' } })
    return { success: true, data: null }
  },

  async like(commentId: string, userId: string): Promise<ServiceResult<null>> {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } })
    if (!comment || comment.status === 'deleted') return { success: false, error: { code: ErrorCodes.COMMENT_NOT_FOUND, message: '评论不存在' } }
    const existing = await prisma.like.findUnique({ where: { userId_targetType_targetId: { userId, targetType: 'comment', targetId: commentId } } })
    if (existing) return { success: false, error: { code: ErrorCodes.ALREADY_LIKED, message: '已点赞' } }
    await prisma.like.create({ data: { userId, targetType: 'comment', targetId: commentId } })
    if (comment.userId !== userId) {
      await notificationService.create({ userId: comment.userId, type: 'like', actorId: userId, targetType: 'comment', targetId: commentId, content: '点赞了你的评论' }).catch(() => {})
    }
    return { success: true, data: null }
  },

  async unlike(commentId: string, userId: string): Promise<ServiceResult<null>> {
    const existing = await prisma.like.findUnique({ where: { userId_targetType_targetId: { userId, targetType: 'comment', targetId: commentId } } })
    if (!existing) return { success: false, error: { code: ErrorCodes.NOT_LIKED, message: '未点赞' } }
    await prisma.like.delete({ where: { id: existing.id } })
    return { success: true, data: null }
  },
}
