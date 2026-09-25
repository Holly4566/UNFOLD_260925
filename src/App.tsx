import { Archive, LocateFixed, Map, Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { ArchiveDrawer } from './components/ArchiveDrawer'
import { EditorDrawer } from './components/EditorDrawer'
import { MapCanvas } from './components/MapCanvas'
import { MysterySheet } from './components/MysterySheet'
import { WORLD } from './domain'
import { useAppState } from './useAppState'

export default function App() {
  const { state, actions } = useAppState()
  const [editMode, setEditMode] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [mysteryOpen, setMysteryOpen] = useState(false)
  const selected = state.islands.find((island) => island.id === selectedId && !island.archived)
  const archived = state.islands.filter((island) => island.archived)

  function addIsland() {
    const screenCenter = { x: innerWidth / 2, y: innerHeight / 2 }
    const position = {
      x: Math.min(WORLD.width - 100, Math.max(100, (screenCenter.x - state.viewport.x) / state.viewport.scale)),
      y: Math.min(WORLD.height - 100, Math.max(100, (screenCenter.y - state.viewport.y) / state.viewport.scale)),
    }
    const id = actions.addIsland(position)
    setEditMode(true)
    setSelectedId(id)
  }

  function removeIsland(id: string, permanent = false) {
    if (confirm(permanent ? '永久删除这座归档岛屿？此操作无法撤销。' : '删除这座岛屿？此操作无法撤销。')) {
      actions.deleteIsland(id)
      if (selectedId === id) setSelectedId(null)
    }
  }

  return <main className="app-shell">
    <MapCanvas
      viewport={state.viewport}
      islands={state.islands}
      boatPosition={state.boatPosition}
      editMode={editMode}
      selectedId={selectedId}
      onViewportChange={actions.setViewport}
      onSelectIsland={(id) => { setSelectedId(id); if (!editMode) setEditMode(true) }}
      onOpenMystery={() => setMysteryOpen(true)}
      onMoveIsland={(id, position) => actions.updateIsland(id, { position })}
      onMoveBoat={actions.setBoatPosition}
    />

    <header className="topbar"><div className="brand"><Map size={18} /><div><b>人生群岛</b><small>此刻的航海图</small></div></div><div className="top-actions"><button className="icon-button glass" onClick={actions.resetViewport} aria-label="复位地图"><LocateFixed /></button><button className="icon-button glass" onClick={() => setArchiveOpen(true)} aria-label="归档"><Archive /></button><button className={`mode-toggle ${editMode ? 'editing' : ''}`} onClick={() => { setEditMode((value) => !value); setSelectedId(null) }}><Pencil size={15} />{editMode ? '完成编辑' : '编辑地图'}</button></div></header>

    {!state.onboarding.firstIslandCreated && <button className="first-island" onClick={addIsland}><span><Plus /></span><div><b>新建第一座岛</b><small>把此刻重要的事放到海上</small></div></button>}
    {state.onboarding.firstIslandCreated && editMode && <button className="floating-add" onClick={addIsland}><Plus />新建岛屿</button>}

    {selected && editMode && <EditorDrawer island={selected} onChange={(patch) => actions.updateIsland(selected.id, patch)} onClose={() => setSelectedId(null)} onArchive={() => { actions.updateIsland(selected.id, { archived: true }); setSelectedId(null) }} onDelete={() => removeIsland(selected.id)} />}
    {archiveOpen && <ArchiveDrawer islands={archived} onRestore={(id) => actions.updateIsland(id, { archived: false })} onDelete={(id) => removeIsland(id, true)} onClose={() => setArchiveOpen(false)} />}
    {mysteryOpen && <MysterySheet current={state.currentMysteryEvent} history={state.completedEventHistory} pool={state.eventPool} onClose={() => setMysteryOpen(false)} onAccept={actions.acceptMysteryEvent} onComplete={actions.completeMysteryEvent} onAbandon={actions.abandonMysteryEvent} onAddPool={actions.addPoolEvent} onUpdatePool={actions.updatePoolEvent} onDeletePool={actions.deletePoolEvent} />}
  </main>
}
