import type { Response } from 'express'
import { ErrorMessages } from '@bingo/shared'

export function success<T>(res: Response, data: T, status = 200) {
  return res.status(status).json({
    code: 0,
    data,
    message: 'ok',
  })
}

export function error(res: Response, code: number, status = 400, customMessage?: string) {
  return res.status(status).json({
    code,
    data: null,
    message: customMessage || (ErrorMessages as Record<number, string>)[code] || '未知错误',
  })
}

export function paginated<T>(
  res: Response,
  items: T[],
  cursor: string | null,
  hasMore: boolean,
) {
  return success(res, { items, cursor, hasMore })
}
