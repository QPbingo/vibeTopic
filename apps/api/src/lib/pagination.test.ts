import { describe, expect, it } from 'vitest'
import { getLimit } from './pagination'

describe('getLimit', () => {
  it.each([
    [undefined, 20],
    [Number.NaN, 20],
    [-5, 1],
    [0, 1],
    [12.9, 12],
    [500, 100],
  ])('normalizes %s to %s', (input, expected) => {
    expect(getLimit(input)).toBe(expected)
  })
})
