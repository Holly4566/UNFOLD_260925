import { createInitialState, isValidState } from './domain'
import type { AppState } from './types'

export const STORAGE_KEY = 'life-archipelago:state:v1'

type LegacyIsland = Omit<AppState['islands'][number], 'stageNotes'> & { currentEvent?: string }
type LegacyState = Omit<AppState, 'schemaVersion' | 'islands'> & { schemaVersion: 1; islands: LegacyIsland[] }

function migrateLegacyState(state: LegacyState): AppState {
  return {
    ...state,
    schemaVersion: 2,
    islands: state.islands.map(({ currentEvent, ...island }) => ({
      ...island,
      stageNotes: currentEvent?.trim() ? [{
        id: crypto.randomUUID(),
        content: currentEvent.trim(),
        createdAt: island.updatedAt,
        archivedAt: null,
      }] : [],
    })),
  }
}

export function loadState(storage: Pick<Storage, 'getItem'> = localStorage): AppState {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return createInitialState()
    const parsed: unknown = JSON.parse(raw)
    if (isValidState(parsed)) return parsed
    if (parsed && typeof parsed === 'object' && (parsed as { schemaVersion?: number }).schemaVersion === 1 && Array.isArray((parsed as LegacyState).islands)) {
      return migrateLegacyState(parsed as LegacyState)
    }
    return createInitialState()
  } catch {
    return createInitialState()
  }
}

export function saveState(state: AppState, storage: Pick<Storage, 'setItem'> = localStorage) {
  storage.setItem(STORAGE_KEY, JSON.stringify(state))
}
