export type Point = { x: number; y: number }
export type IslandType = 'main' | 'side'
export type IslandStatus = 'active' | 'paused' | 'completed'
export type IslandSize = 'small' | 'medium' | 'large'

export interface Island {
  id: string
  name: string
  type: IslandType
  currentEvent: string
  status: IslandStatus
  size: IslandSize
  position: Point
  archived: boolean
  createdAt: string
  updatedAt: string
}

export interface PoolEvent {
  id: string
  text: string
  enabled: boolean
  createdAt: string
}

export interface MysteryEvent {
  id: string
  poolEventId: string
  text: string
  acceptedAt: string
}

export interface CompletedEvent extends MysteryEvent {
  completedAt: string
}

export interface Viewport {
  x: number
  y: number
  scale: number
}

export interface AppState {
  schemaVersion: 1
  islands: Island[]
  boatPosition: Point
  viewport: Viewport
  eventPool: PoolEvent[]
  currentMysteryEvent: MysteryEvent | null
  completedEventHistory: CompletedEvent[]
  onboarding: { firstIslandCreated: boolean }
}
