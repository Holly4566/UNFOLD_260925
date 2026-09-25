import { describe, expect, it, vi } from 'vitest'
import { createInitialState, createIsland, drawCandidate, isValidState } from './domain'

describe('island domain', () => {
  it('creates an empty life map and a complete island model', () => {
    const state = createInitialState()
    expect(state.islands).toEqual([])
    expect(state.onboarding.firstIslandCreated).toBe(false)
    expect(createIsland({ x: 10, y: 20 })).toMatchObject({
      name: '未命名岛屿', status: 'active', size: 'medium', stageNotes: [], position: { x: 10, y: 20 }, archived: false,
    })
  })
})

describe('mystery event draw', () => {
  it('uses enabled unseen events only', () => {
    const pool = createInitialState().eventPool
    pool[0].enabled = false
    const candidate = drawCandidate(pool, [pool[1].id], vi.fn(() => 0))
    expect(candidate?.id).toBe(pool[2].id)
  })

  it('returns null when no candidate remains', () => {
    const pool = createInitialState().eventPool.slice(0, 1)
    expect(drawCandidate(pool, [pool[0].id])).toBeNull()
  })
})

describe('schema validation', () => {
  it('accepts current state and rejects malformed state', () => {
    expect(isValidState(createInitialState())).toBe(true)
    expect(isValidState({ schemaVersion: 2, islands: [] })).toBe(false)
  })
})
