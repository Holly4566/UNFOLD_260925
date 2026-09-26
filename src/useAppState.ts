import { useCallback, useEffect, useRef, useState } from 'react'
import { createDefaultViewport, createIsland } from './domain'
import { loadState, saveState } from './storage'
import type { AppState, Island, Point, PoolEvent, Viewport } from './types'

export function useAppState() {
  const [state, setState] = useState<AppState>(() => loadState())
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const timer = window.setTimeout(() => saveState(state), 220)
    return () => window.clearTimeout(timer)
  }, [state])

  const update = useCallback((recipe: (current: AppState) => AppState) => setState(recipe), [])

  const actions = {
    setViewport: (viewport: Viewport) => update((s) => ({ ...s, viewport })),
    resetViewport: () => update((s) => ({ ...s, viewport: createDefaultViewport() })),
    addIsland: (position: Point) => {
      const island = createIsland(position)
      update((s) => ({ ...s, islands: [...s.islands, island], onboarding: { ...s.onboarding, firstIslandCreated: true } }))
      return island.id
    },
    addIslandData: (island: Island) => update((s) => ({ ...s, islands: [...s.islands, island], onboarding: { ...s.onboarding, firstIslandCreated: true } })),
    completeIntro: () => update((s) => ({ ...s, onboarding: { ...s.onboarding, introCompleted: true } })),
    replaceState: (nextState: AppState) => setState(nextState),
    updateIsland: (id: string, patch: Partial<Island>) => update((s) => ({
      ...s,
      islands: s.islands.map((island) => island.id === id
        ? { ...island, ...patch, updatedAt: new Date().toISOString() }
        : island),
    })),
    deleteIsland: (id: string) => update((s) => ({ ...s, islands: s.islands.filter((item) => item.id !== id) })),
    setBoatPosition: (boatPosition: Point) => update((s) => ({ ...s, boatPosition })),
    addPoolEvent: (text: string) => update((s) => ({
      ...s,
      eventPool: [...s.eventPool, { id: crypto.randomUUID(), text, enabled: true, createdAt: new Date().toISOString() }],
    })),
    updatePoolEvent: (id: string, patch: Partial<PoolEvent>) => update((s) => ({
      ...s,
      eventPool: s.eventPool.map((item) => item.id === id ? { ...item, ...patch } : item),
    })),
    deletePoolEvent: (id: string) => update((s) => ({ ...s, eventPool: s.eventPool.filter((item) => item.id !== id) })),
    acceptMysteryEvent: (event: PoolEvent) => update((s) => ({
      ...s,
      currentMysteryEvent: { id: crypto.randomUUID(), poolEventId: event.id, text: event.text, acceptedAt: new Date().toISOString() },
    })),
    completeMysteryEvent: () => update((s) => s.currentMysteryEvent ? ({
      ...s,
      currentMysteryEvent: null,
      completedEventHistory: [{ ...s.currentMysteryEvent, completedAt: new Date().toISOString() }, ...s.completedEventHistory],
    }) : s),
    abandonMysteryEvent: () => update((s) => ({ ...s, currentMysteryEvent: null })),
  }

  return { state, actions }
}
