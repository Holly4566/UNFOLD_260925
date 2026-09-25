import { describe, expect, it } from 'vitest'
import { createInitialState } from './domain'
import { loadState, saveState, STORAGE_KEY } from './storage'

describe('storage', () => {
  it('round trips the versioned state', () => {
    const memory = new Map<string, string>()
    const storage = {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => { memory.set(key, value) },
    }
    const state = createInitialState()
    state.onboarding.firstIslandCreated = true
    saveState(state, storage)
    expect(memory.has(STORAGE_KEY)).toBe(true)
    expect(loadState(storage).onboarding.firstIslandCreated).toBe(true)
  })

  it('falls back safely for corrupt data', () => {
    const state = loadState({ getItem: () => '{bad json' })
    expect(state.schemaVersion).toBe(1)
    expect(state.islands).toEqual([])
  })
})
