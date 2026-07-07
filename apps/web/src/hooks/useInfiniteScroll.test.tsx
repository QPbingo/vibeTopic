// @vitest-environment jsdom
import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useInfiniteScroll } from './useInfiniteScroll'

describe('useInfiniteScroll', () => {
  it('replaces items when the fetch function changes', async () => {
    const latest = vi.fn().mockResolvedValue({
      items: ['latest'], cursor: null, hasMore: false,
    })
    const hot = vi.fn().mockResolvedValue({
      items: ['hot'], cursor: null, hasMore: false,
    })

    const { result, rerender } = renderHook(
      ({ fetchFn }) => useInfiniteScroll<string>({ fetchFn }),
      { initialProps: { fetchFn: latest } },
    )

    await waitFor(() => expect(result.current.items).toEqual(['latest']))
    rerender({ fetchFn: hot })
    await waitFor(() => expect(result.current.items).toEqual(['hot']))

    expect(hot).toHaveBeenCalledTimes(1)
  })

  it('stops automatic pagination after a request fails', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('offline'))
    const { result } = renderHook(() => useInfiniteScroll<string>({ fetchFn }))

    await waitFor(() => expect(result.current.error?.message).toBe('offline'))

    expect(result.current.hasMore).toBe(false)
    expect(fetchFn).toHaveBeenCalledTimes(1)
  })
})
