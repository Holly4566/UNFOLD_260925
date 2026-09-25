import { createInitialState, isValidState } from './domain'
import type { AppState } from './types'

export const STORAGE_KEY = 'life-archipelago:state:v1'

export function loadState(storage: Pick<Storage, 'getItem'> = localStorage): AppState {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return createInitialState()
    const parsed: unknown = JSON.parse(raw)
    return isValidState(parsed) ? parsed : createInitialState()
  } catch {
    return createInitialState()
  }
}

export function saveState(state: AppState, storage: Pick<Storage, 'setItem'> = localStorage) {
  storage.setItem(STORAGE_KEY, JSON.stringify(state))
}
