'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

interface UseInfiniteScrollOptions<T> {
  fetchFn: (cursor?: string) => Promise<{ items: T[]; cursor: string | null; hasMore: boolean }>
  enabled?: boolean
}

export function useInfiniteScroll<T>({ fetchFn, enabled = true }: UseInfiniteScrollOptions<T>) {
  const [items, setItems] = useState<T[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const loaderRef = useRef<HTMLDivElement>(null)
  const fetchRef = useRef(fetchFn)
  const loadingRef = useRef(false)
  const generationRef = useRef(0)

  const fetchPage = useCallback(async (nextCursor?: string, replace = false) => {
    if (loadingRef.current || !enabled) return
    const generation = generationRef.current
    loadingRef.current = true
    setIsLoading(true)
    setError(null)
    try {
      const result = await fetchRef.current(nextCursor)
      if (generation !== generationRef.current) return
      setItems(prev => replace ? result.items : [...prev, ...result.items])
      setCursor(result.cursor)
      setHasMore(result.hasMore)
    } catch (err) {
      if (generation !== generationRef.current) return
      setError(err instanceof Error ? err : new Error('Failed to load'))
      setHasMore(false)
    } finally {
      if (generation === generationRef.current) {
        loadingRef.current = false
        setIsLoading(false)
      }
    }
  }, [enabled])

  const loadMore = useCallback(async () => {
    if (!hasMore) return
    await fetchPage(cursor || undefined)
  }, [cursor, fetchPage, hasMore])

  // Intersection observer for infinite scroll
  useEffect(() => {
    const el = loaderRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoading) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore, hasMore, isLoading])

  // A new fetch function represents a new query (sort, search term, or route).
  useEffect(() => {
    fetchRef.current = fetchFn
    generationRef.current += 1
    loadingRef.current = false
    setItems([])
    setCursor(null)
    setHasMore(true)
    setError(null)
    setIsLoading(false)
    if (enabled) void fetchPage(undefined, true)
  }, [enabled, fetchFn, fetchPage])

  const reset = useCallback(() => {
    generationRef.current += 1
    loadingRef.current = false
    setItems([])
    setCursor(null)
    setHasMore(true)
    setError(null)
    setIsLoading(false)
  }, [])

  return { items, isLoading, hasMore, error, loadMore, reset, loaderRef }
}
