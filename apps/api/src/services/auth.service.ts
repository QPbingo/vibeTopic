import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { prisma } from '../lib/prisma.js'
import { signAccessToken, signRefreshToken, verifyRefreshToken, signSSETicket } from '../lib/jwt.js'
import { config } from '../config.js'
import { AppConfig, ErrorCodes } from '@bingo/shared'
import type { RegisterInput, SSETicket } from '@bingo/shared'
import type { ServiceResult } from '../lib/result.js'

const SALT_ROUNDS = 12

function hashPassword(password: string): string {
  return bcrypt.hashSync(password, SALT_ROUNDS)
}

function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function validateUsername(username: string): string | null {
  if (username.length < AppConfig.USERNAME_MIN_LENGTH || username.length > AppConfig.USERNAME_MAX_LENGTH) {
    return `用户名长度需为 ${AppConfig.USERNAME_MIN_LENGTH}-${AppConfig.USERNAME_MAX_LENGTH} 个字符`
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return '用户名只能包含字母、数字和下划线'
  }
  return null
}

function validatePassword(password: string): string | null {
  if (password.length < AppConfig.PASSWORD_MIN_LENGTH) {
    return `密码至少 ${AppConfig.PASSWORD_MIN_LENGTH} 个字符`
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return '密码必须包含字母和数字'
  }
  return null
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export const authService = {
  async register(input: RegisterInput): Promise<ServiceResult<{
    user: Record<string, unknown>
    accessToken: string
    refreshToken: string
    expiresIn: number
  }>> {
    const userErr = validateUsername(input.username)
    if (userErr) return { success: false, error: { code: ErrorCodes.INVALID_USERNAME_FORMAT, message: userErr } }
    if (!validateEmail(input.email)) return { success: false, error: { code: ErrorCodes.INVALID_EMAIL_FORMAT, message: '邮箱格式不正确' } }
    const passErr = validatePassword(input.password)
    if (passErr) return { success: false, error: { code: ErrorCodes.INVALID_PASSWORD_FORMAT, message: passErr } }

    // Only check against active/banned users, not deleted ones
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username: input.username }, { email: input.email }],
        status: { not: 'deleted' },
      },
    })
    if (existingUser) {
      if (existingUser.username === input.username) return { success: false, error: { code: ErrorCodes.USERNAME_TAKEN, message: '用户名已存在' } }
      return { success: false, error: { code: ErrorCodes.EMAIL_TAKEN, message: '邮箱已被注册' } }
    }

    const user = await prisma.user.create({
      data: {
        username: input.username,
        email: input.email,
        passwordHash: hashPassword(input.password),
        status: 'active',
      },
    })

    const accessToken = signAccessToken(user.id, user.role)
    const { token: refreshToken } = signRefreshToken(user.id)
    const refreshTokenHash = hashToken(refreshToken)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: refreshTokenHash,
        refreshTokenExpiresAt: new Date(Date.now() + config.jwt.refreshExpiresIn * 1000),
        lastLoginAt: new Date(),
      },
    })

    return {
      success: true,
      data: {
        user: { id: user.id, username: user.username, email: user.email, avatarUrl: user.avatarUrl, bio: user.bio, role: user.role, createdAt: user.createdAt.toISOString() },
        accessToken,
        refreshToken,
        expiresIn: config.jwt.accessExpiresIn,
      },
    }
  },

  async login(email: string, password: string): Promise<ServiceResult<{
    user: Record<string, unknown>
    accessToken: string
    refreshToken: string
    expiresIn: number
  }>> {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.passwordHash) return { success: false, error: { code: ErrorCodes.INVALID_CREDENTIALS, message: '用户名或密码错误' } }
    if (user.status === 'banned') return { success: false, error: { code: ErrorCodes.USER_BANNED, message: '用户已被封禁' } }
    if (user.status === 'deleted') return { success: false, error: { code: ErrorCodes.INVALID_CREDENTIALS, message: '用户名或密码错误' } }
    if (!verifyPassword(password, user.passwordHash)) return { success: false, error: { code: ErrorCodes.INVALID_CREDENTIALS, message: '用户名或密码错误' } }

    const accessToken = signAccessToken(user.id, user.role)
    const { token: refreshToken } = signRefreshToken(user.id)
    const refreshTokenHash = hashToken(refreshToken)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        refreshToken: refreshTokenHash,
        refreshTokenExpiresAt: new Date(Date.now() + config.jwt.refreshExpiresIn * 1000),
        lastLoginAt: new Date(),
      },
    })

    return {
      success: true,
      data: {
        user: { id: user.id, username: user.username, email: user.email, avatarUrl: user.avatarUrl, bio: user.bio, role: user.role, createdAt: user.createdAt.toISOString() },
        accessToken,
        refreshToken,
        expiresIn: config.jwt.accessExpiresIn,
      },
    }
  },

  async refresh(refreshTokenStr: string): Promise<ServiceResult<{
    accessToken: string
    refreshToken: string
    expiresIn: number
  }>> {
    try {
      const payload = verifyRefreshToken(refreshTokenStr)
      const user = await prisma.user.findUnique({ where: { id: payload.sub } })
      if (!user || !user.refreshToken) return { success: false, error: { code: ErrorCodes.INVALID_REFRESH_TOKEN, message: 'Refresh Token 无效' } }
      if (user.status === 'banned') return { success: false, error: { code: ErrorCodes.USER_BANNED, message: '用户已被封禁' } }
      if (user.status === 'deleted') return { success: false, error: { code: ErrorCodes.INVALID_REFRESH_TOKEN, message: 'Refresh Token 无效' } }
      // Token reuse detection: if stored hash doesn't match, the token was already rotated
      // This indicates potential token theft — revoke all tokens for this user
      if (hashToken(refreshTokenStr) !== user.refreshToken) {
        await prisma.user.update({
          where: { id: user.id },
          data: { refreshToken: null, refreshTokenExpiresAt: null },
        })
        return { success: false, error: { code: ErrorCodes.INVALID_REFRESH_TOKEN, message: 'Refresh Token 无效' } }
      }
      if (user.refreshTokenExpiresAt && user.refreshTokenExpiresAt < new Date()) return { success: false, error: { code: ErrorCodes.TOKEN_EXPIRED, message: '登录已过期，请重新登录' } }

      const accessToken = signAccessToken(user.id, user.role)
      const { token: newRefreshToken } = signRefreshToken(user.id)
      const newRefreshTokenHash = hashToken(newRefreshToken)

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: newRefreshTokenHash, refreshTokenExpiresAt: new Date(Date.now() + config.jwt.refreshExpiresIn * 1000) },
      })

      return { success: true, data: { accessToken, refreshToken: newRefreshToken, expiresIn: config.jwt.accessExpiresIn } }
    } catch {
      return { success: false, error: { code: ErrorCodes.INVALID_REFRESH_TOKEN, message: 'Refresh Token 无效' } }
    }
  },

  async me(userId: string): Promise<ServiceResult<Record<string, unknown>>> {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return { success: false, error: { code: ErrorCodes.USER_NOT_FOUND, message: '用户不存在' } }
    return {
      success: true,
      data: {
        id: user.id, username: user.username, email: user.email, avatarUrl: user.avatarUrl,
        bio: user.bio, githubUsername: user.githubUsername, githubUrl: user.githubUrl,
        role: user.role, status: user.status, lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
        createdAt: user.createdAt.toISOString(), updatedAt: user.updatedAt.toISOString(),
      },
    }
  },

  async logout(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null, refreshTokenExpiresAt: null },
    })
  },

  async requestPasswordReset(email: string): Promise<ServiceResult<{ resetToken?: string }>> {
    if (!validateEmail(email)) return { success: false, error: { code: ErrorCodes.INVALID_EMAIL_FORMAT, message: '邮箱格式不正确' } }
    const user = await prisma.user.findUnique({ where: { email } })
    // Don't leak account existence — return identical response for all cases
    if (!user || user.status === 'deleted' || user.status === 'banned') {
      return { success: true, data: {} }
    }

    const resetToken = crypto.randomBytes(24).toString('hex')
    await prisma.userToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(resetToken),
        type: 'password_reset',
        expiresAt: new Date(Date.now() + config.email.resetTokenTTL * 1000),
      },
    })

    // Email delivery adapter is intentionally not faked. Local/dev returns the token for manual testing.
    // Production must never return reset tokens in API responses.
    return { success: true, data: (config.email.enabled || config.isProduction) ? {} : { resetToken } }
  },

  async resetPassword(resetToken: string, password: string): Promise<ServiceResult<null>> {
    const passErr = validatePassword(password)
    if (passErr) return { success: false, error: { code: ErrorCodes.INVALID_PASSWORD_FORMAT, message: passErr } }

    const token = await prisma.userToken.findUnique({
      where: { tokenHash: hashToken(resetToken) },
      include: { user: true },
    })
    if (
      !token ||
      token.type !== 'password_reset' ||
      token.usedAt ||
      token.expiresAt < new Date() ||
      token.user.status !== 'active'
    ) {
      return { success: false, error: { code: ErrorCodes.INVALID_RESET_TOKEN, message: '重置密码链接无效或已过期' } }
    }

    await prisma.userToken.update({ where: { id: token.id }, data: { usedAt: new Date() } })
    await prisma.user.update({
      where: { id: token.userId },
      data: {
        passwordHash: hashPassword(password),
        refreshToken: null,
        refreshTokenExpiresAt: null,
      },
    })
    return { success: true, data: null }
  },

  async getSSETicket(userId: string): Promise<SSETicket> {
    const ticket = signSSETicket(userId)
    return { ticket, expiresIn: AppConfig.SSE_TICKET_EXPIRES_IN, sseUrl: config.sse.publicUrl }
  },
}
