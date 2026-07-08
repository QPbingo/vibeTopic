import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { uploadLimiter } from '../middleware/ratelimit.js'
import { success, error } from '../lib/response.js'
import { ErrorCodes, OSSConfig } from '@bingo/shared'
import { config } from '../config.js'
import { prisma } from '../lib/prisma.js'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

export const uploadRouter = Router()

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAGIC_BYTES: Record<string, number[]> = {
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'image/gif': [0x47, 0x49, 0x46, 0x38],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
}
const EXT_BY_MIME: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
}

function getUploadBaseUrl(): string {
  return process.env.UPLOAD_PUBLIC_BASE_URL || `http://localhost:${config.port}`
}

const uploadSchema = z.object({
  filename: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(100),
  size: z.number().int().positive().max(OSSConfig.maxFileSize),
  dataUrl: z.string().min(1),
})

// POST /api/v1/media/upload
uploadRouter.post('/upload', requireAuth, uploadLimiter, validate('body', uploadSchema), async (req, res) => {
  const { filename, mimeType, size, dataUrl } = req.body as z.infer<typeof uploadSchema>

  // Validate MIME type
  if (!ALLOWED_TYPES.includes(mimeType)) {
    return error(res, ErrorCodes.UPLOAD_UNSUPPORTED_TYPE, 400, `不支持的文件类型: ${mimeType}`)
  }

  // Reject SVG for security
  if (mimeType === 'image/svg+xml') {
    return error(res, ErrorCodes.UPLOAD_UNSUPPORTED_TYPE, 400, '不支持 SVG 文件上传')
  }

  // Validate data URL format
  if (!dataUrl.startsWith('data:')) {
    return error(res, ErrorCodes.UPLOAD_INVALID_DATA, 400, '无效的图片数据')
  }

  // Decode base64
  const base64Match = dataUrl.match(/^data:[^;]+;base64,(.+)$/)
  if (!base64Match) {
    return error(res, ErrorCodes.UPLOAD_INVALID_DATA, 400, '无效的 Base64 编码')
  }

  let bytes: Buffer
  try {
    bytes = Buffer.from(base64Match[1]!, 'base64')
  } catch {
    return error(res, ErrorCodes.UPLOAD_INVALID_DATA, 400, 'Base64 解码失败')
  }

  // Verify declared size matches actual
  if (bytes.length !== size) {
    return error(res, ErrorCodes.UPLOAD_SIZE_MISMATCH, 400, '文件大小不匹配')
  }

  // Verify magic bytes
  const magic = MAGIC_BYTES[mimeType]
  if (magic) {
    const matches = magic.every((b, i) => bytes[i] === b)
    if (!matches) {
      return error(res, ErrorCodes.UPLOAD_INVALID_DATA, 400, '文件内容与声明的类型不符')
    }
  }

  // Derive extension from verified MIME type
  const ext = EXT_BY_MIME[mimeType] || '.bin'
  const normalizedName = `${crypto.randomUUID()}${ext}`
  const userDir = path.join('uploads', 'users', req.user!.sub)
  const filePath = path.join(userDir, normalizedName)

  // Ensure directory exists
  fs.mkdirSync(path.resolve(process.cwd(), userDir), { recursive: true })

  // Write file
  fs.writeFileSync(path.resolve(process.cwd(), filePath), bytes)

  // Create MediaFile record
  const mediaFile = await prisma.mediaFile.create({
    data: {
      userId: req.user!.sub,
      fileUrl: `${getUploadBaseUrl()}/${filePath}`,
      fileType: 'image',
      fileSize: BigInt(bytes.length),
      mimeType,
      originalName: filename,
      ossObjectKey: filePath,
    },
  })

  return success(res, {
    url: mediaFile.fileUrl,
    id: mediaFile.id,
    fileType: mediaFile.fileType,
    mimeType: mediaFile.mimeType,
  })
})

// POST /api/v1/media/upload-credential — DISABLED
// This endpoint no longer returns any credentials.
// Use POST /upload for local API storage in this milestone.
uploadRouter.post('/upload-credential', requireAuth, async (_req, res) => {
  if (config.oss.enabled) {
    return error(res, ErrorCodes.UPLOAD_CREDENTIAL_FAILED, 503, 'OSS STS 尚未配置，已拒绝返回不安全的长期密钥')
  }
  // Return a clear error directing to the local upload endpoint
  return error(res, ErrorCodes.UPLOAD_CREDENTIAL_FAILED, 400, '本环境使用本地存储，请使用 POST /api/v1/media/upload 上传文件')
})
