import type { Request, Response, NextFunction } from 'express'
import { ZodSchema, ZodError } from 'zod'
import { error } from '../lib/response.js'
import { ErrorCodes } from '@bingo/shared'

type ValidationTarget = 'body' | 'query' | 'params'

/**
 * Zod validation middleware factory.
 * Usage: router.post('/path', validate('body', mySchema), handler)
 */
export function validate(target: ValidationTarget, schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = schema.parse(req[target])
      // Replace with parsed (and transformed) data
      req[target] = data
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        const message = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ')
        return error(res, ErrorCodes.VALIDATION_ERROR, 400, message)
      }
      return error(res, ErrorCodes.VALIDATION_ERROR, 400)
    }
  }
}
