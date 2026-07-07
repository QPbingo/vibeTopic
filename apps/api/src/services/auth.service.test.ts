import crypto from 'crypto'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ErrorCodes } from '@bingo/shared'

const prismaMock = vi.hoisted(() => ({
  user: {
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
