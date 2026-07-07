import type { Request, Response, NextFunction } from 'express'
import { error } from '../lib/response.js'
import { ErrorCodes } from '@bingo/shared'

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return error(res, ErrorCodes.FORBIDDEN, 403)
  }
  next()
}
