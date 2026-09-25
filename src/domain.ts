import type { AppState, Island, PoolEvent, Point } from './types'

export const WORLD = { width: 1800, height: 1200 }
export const MYSTERY_POSITION: Point = { x: 1260, y: 370 }

export function createDefaultViewport(screen = {
  width: typeof window === 'undefined' ? 390 : window.innerWidth,
  height: typeof window === 'undefined' ? 844 : window.innerHeight,
}) {
  const scale = Math.min(1, Math.max(0.6, Math.max(screen.width / WORLD.width, screen.height / WORLD.height) * 1.1))
  return { x: (screen.width - WORLD.width * scale) / 2, y: (screen.height - WORLD.height * scale) / 2, scale }
}

const starterEvents = [
  '去一个没去过的公园',
  '给很久没联系的人发一条消息',
  '独自散步二十分钟，不带耳机',
  '做一道从没尝试过的菜',
  '记录今天让你开心的三个瞬间',
  '提前一小时放下手机去休息',
]

export function createInitialState(): AppState {
  const now = new Date().toISOString()
  return {
    schemaVersion: 1,
    islands: [],
    boatPosition: { x: 860, y: 720 },
    viewport: createDefaultViewport(),
    eventPool: starterEvents.map((text, index) => ({
      id: `seed-${index + 1}`,
      text,
      enabled: true,
      createdAt: now,
    })),
    currentMysteryEvent: null,
    completedEventHistory: [],
    onboarding: { firstIslandCreated: false },
  }
}

export function createIsland(position: Point): Island {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    name: '未命名岛屿',
    type: 'main',
    currentEvent: '',
    status: 'active',
    size: 'medium',
    position,
    archived: false,
    createdAt: now,
    updatedAt: now,
  }
}

export function drawCandidate(pool: PoolEvent[], seenIds: string[], random = Math.random) {
  const available = pool.filter((item) => item.enabled && !seenIds.includes(item.id))
  if (!available.length) return null
  return available[Math.floor(random() * available.length)]
}

export function clampViewport(
  viewport: AppState['viewport'],
  screen: { width: number; height: number },
): AppState['viewport'] {
  const scale = Math.min(1.8, Math.max(0.5, viewport.scale))
  const margin = Math.min(screen.width, screen.height) * 0.22
  const minX = screen.width - WORLD.width * scale - margin
  const maxX = margin
  const minY = screen.height - WORLD.height * scale - margin
  const maxY = margin
  return {
    x: Math.min(maxX, Math.max(minX, viewport.x)),
    y: Math.min(maxY, Math.max(minY, viewport.y)),
    scale,
  }
}

export function isValidState(value: unknown): value is AppState {
  if (!value || typeof value !== 'object') return false
  const state = value as Partial<AppState>
  return state.schemaVersion === 1 && Array.isArray(state.islands) &&
    Array.isArray(state.eventPool) && Array.isArray(state.completedEventHistory) &&
    !!state.boatPosition && !!state.viewport && !!state.onboarding
}
