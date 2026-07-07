import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { success } from '../lib/response.js'
import { error } from '../lib/response.js'
import { ErrorCodes } from '@bingo/shared'
import { config } from '../config.js'
import crypto from 'crypto'

export const uploadRouter = Router()

// POST /api/v1/media/upload-credential
uploadRouter.post('/upload-credential', requireAuth, async (_req, res) => {
  if (config.oss.enabled) {
    return error(res, ErrorCodes.UPLOAD_CREDENTIAL_FAILED, 503, 'OSS STS 尚未配置，已拒绝返回不安全的长期密钥')
  }

  const objectKey = `users/${_req.user!.sub}/${Date.now()}-${crypto.randomUUID()}.jpg`
  return success(res, {
    accessKeyId: 'minioadmin',
    accessKeySecret: 'minioadmin',
    securityToken: '',
    region: 'local',
    bucket: 'bingbingbingo',
    endpoint: 'http://localhost:9000', // MinIO for local dev
    cdnDomain: 'http://localhost:9000/bingbingbingo',
    uploadPath: objectKey,
    expiration: new Date(Date.now() + 3600 * 1000).toISOString(),
  })
})
