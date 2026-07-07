import { Router } from 'express'
import { z } from 'zod'
import { authService } from '../services/auth.service.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { loginLimiter, registerLimiter } from '../middleware/ratelimit.js'
import { success, error } from '../lib/response.js'
import { ErrorCodes } from '@bingo/shared'
import { config } from '../config.js'

export const authRouter = Router()

const registerSchema = z.object({
  username: z.string().min(3).max(30),
  email: z.string().email(),
  password: z.string().min(8),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

authRouter.post('/register', registerLimiter, validate('body', registerSchema), async (req, res) => {
  const result = await authService.register(req.body)
  if (!result.success) return error(res, result.error.code, 400, result.error.message)
  res.cookie('refresh_token', result.data.refreshToken, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', maxAge: config.jwt.refreshExpiresIn * 1000, path: '/api/v1/auth',
  })
  return success(res, { user: result.data.user, accessToken: result.data.accessToken, expiresIn: result.data.expiresIn })
})

authRouter.post('/login', loginLimiter, validate('body', loginSchema), async (req, res) => {
  const { email, password } = req.body
  const result = await authService.login(email, password)
  if (!result.success) {
    const status = result.error.code === ErrorCodes.USER_BANNED ? 403 : 401
    return error(res, result.error.code, status, result.error.message)
  }
  res.cookie('refresh_token', result.data.refreshToken, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', maxAge: config.jwt.refreshExpiresIn * 1000, path: '/api/v1/auth',
  })
  return success(res, { user: result.data.user, accessToken: result.data.accessToken, expiresIn: result.data.expiresIn })
})

authRouter.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies?.refresh_token
  if (!refreshToken) return error(res, ErrorCodes.INVALID_REFRESH_TOKEN, 401)
  const result = await authService.refresh(refreshToken)
  if (!result.success) return error(res, result.error.code, 401, result.error.message)
  res.cookie('refresh_token', result.data.refreshToken, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax', maxAge: config.jwt.refreshExpiresIn * 1000, path: '/api/v1/auth',
  })
  return success(res, { accessToken: result.data.accessToken, expiresIn: result.data.expiresIn })
})

authRouter.post('/logout', requireAuth, async (req, res) => {
  await authService.logout(req.user!.sub)
  res.clearCookie('refresh_token', { path: '/api/v1/auth' })
  return success(res, null)
})

authRouter.get('/me', requireAuth, async (req, res) => {
  const result = await authService.me(req.user!.sub)
  if (!result.success) return error(res, result.error.code, 404, result.error.message)
  return success(res, result.data)
})
