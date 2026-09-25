import { useRef } from 'react'
import { Anchor, Compass, Sparkles } from 'lucide-react'
import { MYSTERY_POSITION, WORLD, clampViewport } from '../domain'
import type { Island, Point, Viewport } from '../types'

const sizePixels = { small: 170, medium: 230, large: 300 }
const statusLabel = { active: '探索中', paused: '暂停', completed: '完成' }

interface Props {
  viewport: Viewport
  islands: Island[]
  boatPosition: Point
  editMode: boolean
  selectedId: string | null
  onViewportChange: (value: Viewport) => void
  onSelectIsland: (id: string) => void
  onOpenMystery: () => void
  onMoveIsland: (id: string, position: Point) => void
  onMoveBoat: (position: Point) => void
}

export function MapCanvas(props: Props) {
  const frameRef = useRef<HTMLDivElement>(null)
  const pointers = useRef(new Map<number, Point>())
  const gesture = useRef<{ viewport: Viewport; point: Point; distance?: number; center?: Point } | null>(null)

  const screen = () => ({ width: frameRef.current?.clientWidth ?? innerWidth, height: frameRef.current?.clientHeight ?? innerHeight })

  function onPointerDown(event: React.PointerEvent) {
    if ((event.target as HTMLElement).closest('[data-map-object]')) return
    frameRef.current?.setPointerCapture(event.pointerId)
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    const points = [...pointers.current.values()]
    if (points.length === 1) {
      gesture.current = { viewport: props.viewport, point: points[0] }
    } else if (points.length === 2) {
      const center = { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 }
      gesture.current = { viewport: props.viewport, point: center, center, distance: Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y) }
    }
  }

  function onPointerMove(event: React.PointerEvent) {
    if (!pointers.current.has(event.pointerId) || !gesture.current) return
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
    const points = [...pointers.current.values()]
    const start = gesture.current
    if (points.length === 2 && start.distance && start.center) {
      const center = { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 }
      const distance = Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y)
      const nextScale = Math.min(1.8, Math.max(0.5, start.viewport.scale * distance / start.distance))
      const worldX = (start.center.x - start.viewport.x) / start.viewport.scale
      const worldY = (start.center.y - start.viewport.y) / start.viewport.scale
      props.onViewportChange(clampViewport({ x: center.x - worldX * nextScale, y: center.y - worldY * nextScale, scale: nextScale }, screen()))
    } else if (points.length === 1) {
      props.onViewportChange(clampViewport({ ...start.viewport, x: start.viewport.x + points[0].x - start.point.x, y: start.viewport.y + points[0].y - start.point.y }, screen()))
    }
  }

  function endPointer(event: React.PointerEvent) {
    pointers.current.delete(event.pointerId)
    gesture.current = null
  }

  function onWheel(event: React.WheelEvent) {
    event.preventDefault()
    const rect = frameRef.current!.getBoundingClientRect()
    const cursor = { x: event.clientX - rect.left, y: event.clientY - rect.top }
    const nextScale = Math.min(1.8, Math.max(0.5, props.viewport.scale * (event.deltaY > 0 ? 0.9 : 1.1)))
    const worldX = (cursor.x - props.viewport.x) / props.viewport.scale
    const worldY = (cursor.y - props.viewport.y) / props.viewport.scale
    props.onViewportChange(clampViewport({ x: cursor.x - worldX * nextScale, y: cursor.y - worldY * nextScale, scale: nextScale }, screen()))
  }

  function movablePointerDown(event: React.PointerEvent, position: Point, move: (point: Point) => void) {
    if (!props.editMode) return
    event.stopPropagation()
    const start = { x: event.clientX, y: event.clientY }
    const target = event.currentTarget as HTMLElement
    target.setPointerCapture(event.pointerId)
    const handleMove = (next: PointerEvent) => move({
      x: Math.min(WORLD.width, Math.max(0, position.x + (next.clientX - start.x) / props.viewport.scale)),
      y: Math.min(WORLD.height, Math.max(0, position.y + (next.clientY - start.y) / props.viewport.scale)),
    })
    const handleUp = () => {
      target.removeEventListener('pointermove', handleMove)
      target.removeEventListener('pointerup', handleUp)
      target.removeEventListener('pointercancel', handleUp)
    }
    target.addEventListener('pointermove', handleMove)
    target.addEventListener('pointerup', handleUp)
    target.addEventListener('pointercancel', handleUp)
  }

  const activeIslands = props.islands.filter((island) => !island.archived && island.status === 'active')

  return (
    <div ref={frameRef} className="map-frame" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endPointer} onPointerCancel={endPointer} onWheel={onWheel}>
      <div className="world" style={{ width: WORLD.width, height: WORLD.height, transform: `translate(${props.viewport.x}px, ${props.viewport.y}px) scale(${props.viewport.scale})` }}>
        <svg className="routes" viewBox={`0 0 ${WORLD.width} ${WORLD.height}`} aria-hidden="true">
          {activeIslands.map((island) => <path key={island.id} d={`M ${props.boatPosition.x} ${props.boatPosition.y} Q ${(props.boatPosition.x + island.position.x) / 2} ${(props.boatPosition.y + island.position.y) / 2 + 85} ${island.position.x} ${island.position.y}`} />)}
        </svg>

        <button data-map-object className="mystery-island" style={{ left: MYSTERY_POSITION.x, top: MYSTERY_POSITION.y }} onClick={props.onOpenMystery} aria-label="打开神秘岛">
          <img src="/assets/mystery-island.png" alt="雾中的神秘岛" draggable={false} />
          <span><Sparkles size={14} /> 神秘岛</span>
        </button>

        {props.islands.filter((item) => !item.archived).map((island) => (
          <button
            data-map-object
            key={island.id}
            className={`island island--${island.status} ${props.selectedId === island.id ? 'island--selected' : ''}`}
            style={{ left: island.position.x, top: island.position.y, width: sizePixels[island.size] }}
            onClick={() => props.onSelectIsland(island.id)}
            onPointerDown={(event) => movablePointerDown(event, island.position, (position) => props.onMoveIsland(island.id, position))}
          >
            <img src="/assets/island.png" alt="" draggable={false} />
            <span className="island-card">
              <b>{island.name}</b>
              <small>{statusLabel[island.status]} · {island.type === 'main' ? '主线' : '支线'}</small>
              {island.currentEvent && <em>{island.currentEvent}</em>}
            </span>
          </button>
        ))}

        <button
          data-map-object
          className={`boat ${props.editMode ? 'boat--editable' : ''}`}
          style={{ left: props.boatPosition.x, top: props.boatPosition.y }}
          onPointerDown={(event) => movablePointerDown(event, props.boatPosition, props.onMoveBoat)}
          aria-label={props.editMode ? '拖动我的船' : '我的船'}
        >
          <img src="/assets/boat.png" alt="我的船" draggable={false} />
          <span><Anchor size={13} /> 我在这里</span>
        </button>

        {!props.islands.length && <div className="map-whisper"><Compass size={19} /><span>海面还很安静<br />去建造属于你的第一座岛</span></div>}
      </div>
    </div>
  )
}
