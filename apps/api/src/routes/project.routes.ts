import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { success, error } from '../lib/response.js'
import { ErrorCodes, AppConfig } from '@bingo/shared'

export const projectRouter = Router()

const createProjectSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  coverImage: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  sourceUrl: z.string().url().optional(),
})

const updateProjectSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  coverImage: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  sourceUrl: z.string().url().optional(),
  sortOrder: z.number().int().optional(),
})

projectRouter.post('/', requireAuth, validate('body', createProjectSchema), async (req, res) => {
  const count = await prisma.project.count({ where: { userId: req.user!.sub } })
  if (count >= AppConfig.PROJECT_MAX_PER_USER) return error(res, ErrorCodes.PROJECT_LIMIT_EXCEEDED, 400)

  const project = await prisma.project.create({
    data: {
      userId: req.user!.sub, title: req.body.title, description: req.body.description,
      coverImage: req.body.coverImage, images: req.body.images || [], sourceUrl: req.body.sourceUrl,
    },
  })
  return success(res, { id: project.id, title: project.title, createdAt: project.createdAt.toISOString() }, 201)
})

projectRouter.patch('/:id', requireAuth, validate('body', updateProjectSchema), async (req, res) => {
  const projectId = req.params.id as string
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return error(res, ErrorCodes.PROJECT_NOT_FOUND, 404)
  if (project.userId !== req.user!.sub) return error(res, ErrorCodes.PROJECT_OPERATION_FORBIDDEN, 403)

  const updated = await prisma.project.update({ where: { id: projectId }, data: req.body })
  return success(res, { id: updated.id, updatedAt: updated.updatedAt.toISOString() })
})

projectRouter.delete('/:id', requireAuth, async (req, res) => {
  const projectId = req.params.id as string
  const project = await prisma.project.findUnique({ where: { id: projectId } })
  if (!project) return error(res, ErrorCodes.PROJECT_NOT_FOUND, 404)
  if (project.userId !== req.user!.sub) return error(res, ErrorCodes.PROJECT_OPERATION_FORBIDDEN, 403)

  await prisma.project.delete({ where: { id: projectId } })
  return success(res, null)
})
