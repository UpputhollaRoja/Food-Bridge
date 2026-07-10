import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { calculateDeterministicPriority } from '../app/api/ai/prioritize/route'

describe('calculateDeterministicPriority', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return score 0 if food is expired', () => {
    vi.setSystemTime(new Date('2026-07-10T12:00:00Z'))
    const donation = {
      expiry_at: '2026-07-10T10:00:00Z', // Expired 2 hours ago
      estimated_meals: 10,
    }
    const result = calculateDeterministicPriority(donation)
    expect(result.score).toBe(0)
    expect(result.reasoning).toContain('expired')
  })

  it('should return a high score if food expires soon', () => {
    vi.setSystemTime(new Date('2026-07-10T10:00:00Z'))
    const donation = {
      expiry_at: '2026-07-10T14:00:00Z', // Expires in 4 hours
      estimated_meals: 50, // Meal bonus = 10
    }
    const result = calculateDeterministicPriority(donation)
    expect(result.score).toBe(96)
  })

  it('should cap the score at 100', () => {
    vi.setSystemTime(new Date('2026-07-10T10:00:00Z'))
    const donation = {
      expiry_at: '2026-07-10T11:00:00Z', // Expires in 1 hour
      estimated_meals: 200, // Meal bonus = 20 (maxed)
    }
    const result = calculateDeterministicPriority(donation)
    expect(result.score).toBe(100)
  })
})
