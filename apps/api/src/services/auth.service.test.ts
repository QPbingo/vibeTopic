import crypto from 'crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ErrorCodes } from '@bingo/shared'

const prismaMock = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  userToken: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
}))

vi.mock('../lib/prisma.js', () => ({ prisma: prismaMock }))
vi.mock('../lib/jwt.js', () => ({
  signAccessToken: vi.fn(() => 'access'),
  signRefreshToken: vi.fn(() => ({ token: 'next-refresh', jti: 'jti' })),
  verifyRefreshToken: vi.fn(() => ({ sub: 'user-1', type: 'refresh', jti: 'jti' })),
  signSSETicket: vi.fn(() => 'ticket'),
}))

import { authService } from './auth.service'

describe('authService session lifecycle', () => {
  beforeEach(() => vi.clearAllMocks())

  it('revokes the stored refresh token on logout', async () => {
    prismaMock.user.update.mockResolvedValue({})

    await authService.logout('user-1')

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { refreshToken: null, refreshTokenExpiresAt: null },
    })
  })

  it('does not refresh a banned account', async () => {
    const refreshToken = 'refresh'
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1', role: 'user', status: 'banned',
      refreshToken: crypto.createHash('sha256').update(refreshToken).digest('hex'),
      refreshTokenExpiresAt: new Date(Date.now() + 60_000),
    })

    const result = await authService.refresh(refreshToken)

    expect(result).toEqual({
      success: false,
      error: { code: ErrorCodes.USER_BANNED, message: '用户已被封禁' },
    })
  })
})

describe('authService password reset tokens', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates a password reset token for an existing email', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 'user-1', email: 'me@example.com', status: 'active' })
    prismaMock.userToken.create.mockResolvedValue({})

    const result = await authService.requestPasswordReset('me@example.com')

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.resetToken).toHaveLength(48)
    expect(prismaMock.userToken.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        tokenHash: expect.any(String),
        type: 'password_reset',
        expiresAt: expect.any(Date),
      },
    })
  })

  it('uses a reset token once, changes the password, and revokes refresh tokens', async () => {
    prismaMock.userToken.findUnique.mockResolvedValue({
      id: 'token-1',
      userId: 'user-1',
      type: 'password_reset',
      usedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      user: { id: 'user-1', status: 'active' },
    })
    prismaMock.userToken.update.mockResolvedValue({})
    prismaMock.user.update.mockResolvedValue({})

    const result = await authService.resetPassword('reset-token', 'newPass123')

    expect(result).toEqual({ success: true, data: null })
    expect(prismaMock.userToken.update).toHaveBeenCalledWith({
      where: { id: 'token-1' },
      data: { usedAt: expect.any(Date) },
    })
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: {
        passwordHash: expect.any(String),
        refreshToken: null,
        refreshTokenExpiresAt: null,
      },
    })
  })

  it('rejects expired or already used reset tokens', async () => {
    prismaMock.userToken.findUnique.mockResolvedValue({
      id: 'token-1',
      userId: 'user-1',
      type: 'password_reset',
      usedAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
      user: { id: 'user-1', status: 'active' },
    })

    const result = await authService.resetPassword('reset-token', 'newPass123')

    expect(result).toEqual({
      success: false,
      error: { code: ErrorCodes.INVALID_RESET_TOKEN, message: '重置密码链接无效或已过期' },
    })
    expect(prismaMock.user.update).not.toHaveBeenCalled()
  })
})
