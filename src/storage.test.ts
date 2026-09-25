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
    expect(state.schemaVersion).toBe(2)
    expect(state.islands).toEqual([])
  })

  it('migrates the former current event into a current stage note', () => {
    const legacy = createInitialState() as unknown as Record<string, unknown>
    legacy.schemaVersion = 1
    legacy.islands = [{ ...createInitialState().islands, id: 'legacy', name: '求职', type: 'main', currentEvent: '正在面试', status: 'active', size: 'medium', position: { x: 1, y: 2 }, archived: false, createdAt: '2026-01-01', updatedAt: '2026-01-02' }]
    const migrated = loadState({ getItem: () => JSON.stringify(legacy) })
    expect(migrated.schemaVersion).toBe(2)
    expect(migrated.islands[0].stageNotes[0].content).toBe('正在面试')
  })
})
