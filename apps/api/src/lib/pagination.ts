import { AppConfig } from '@bingo/shared'

export interface PaginationInput {
  cursor?: string
  limit?: number
}

export async function paginateQuery<T extends { id: string }>(
  items: T[],
  limit: number,
): Promise<{ items: T[]; cursor: string | null; hasMore: boolean }> {
  const hasMore = items.length > limit
  const result = hasMore ? items.slice(0, limit) : items
  const cursor = result.length > 0 ? result[result.length - 1]!.id : null
  return { items: result, cursor, hasMore }
}

export function cursorWhere(cursor?: string) {
  if (!cursor) return {}
  return { id: { lt: cursor } }
}

export function getLimit(limit?: number, defaultLimit: number = AppConfig.FEED_PAGE_SIZE): number {
  const value = Number.isFinite(limit) ? Math.trunc(limit!) : defaultLimit
  return Math.min(Math.max(value, 1), 100)
}
