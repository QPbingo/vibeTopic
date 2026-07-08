import type { Request, Response, NextFunction } from 'express'
import { verifyAccessToken, type AccessTokenPayload } from '../lib/jwt.js'
import { error } from '../lib/response.js'
import { ErrorCodes } from '@bingo/shared'

// Extend Express Request to include user
/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenPayload
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

/**
 * Required auth — rejects if no valid access token.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return error(res, ErrorCodes.UNAUTHORIZED, 401)
  }

  const token = header.slice(7)
  try {
    const payload = verifyAccessToken(token)
    req.user = payload
    next()
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    if (message.includes('expired') || message.includes('jwt expired')) {
      return error(res, ErrorCodes.TOKEN_EXPIRED, 401)
    }
    return error(res, ErrorCodes.UNAUTHORIZED, 401)
  }
}

/**
 * Optional auth — attaches user if valid token present, but doesn't reject.
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (header && header.startsWith('Bearer ')) {
    const token = header.slice(7)
    try {
      req.user = verifyAccessToken(token)
    } catch {
      // silently ignore invalid tokens for optional auth
    }
  }
  next()
}
