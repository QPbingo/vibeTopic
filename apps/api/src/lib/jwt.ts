import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { config } from '../config.js'
import { SSEConfig, AppBaseConfig } from '@bingo/shared'

export interface AccessTokenPayload {
  sub: string // user id
  role: string
  type: 'access'
}

export interface RefreshTokenPayload {
  sub: string // user id
  type: 'refresh'
  jti: string // token id for revocation
}

export function signAccessToken(userId: string, role: string): string {
  const payload: Omit<AccessTokenPayload, 'type'> & { type: 'access' } = {
    sub: userId,
    role,
    type: 'access',
  }
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.accessExpiresIn,
    issuer: config.jwt.issuer,
  })
}

export function signRefreshToken(userId: string): { token: string; jti: string } {
  const jti = crypto.randomUUID()
  const payload: Omit<RefreshTokenPayload, 'type'> & { type: 'refresh' } = {
    sub: userId,
    type: 'refresh',
    jti,
  }
  const token = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiresIn,
    issuer: config.jwt.issuer,
  })
  return { token, jti }
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const payload = jwt.verify(token, config.jwt.secret, {
    issuer: config.jwt.issuer,
  }) as AccessTokenPayload
  if (payload.type !== 'access') {
    throw new Error('Invalid token type')
  }
  return payload
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const payload = jwt.verify(token, config.jwt.secret, {
    issuer: config.jwt.issuer,
  }) as RefreshTokenPayload
  if (payload.type !== 'refresh') {
    throw new Error('Invalid token type')
  }
  return payload
}

export function signSSETicket(userId: string): string {
  return jwt.sign({ sub: userId, type: 'sse_ticket', jti: crypto.randomUUID() }, config.sse.ticketSecret, {
    expiresIn: SSEConfig.ticketExpiresIn,
    issuer: config.jwt.issuer,
  })
}
