import { Archive, LocateFixed, Pencil, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { asset } from './assets'
import { ArchiveDrawer } from './components/ArchiveDrawer'
import { EditorDrawer } from './components/EditorDrawer'
import { MapCanvas } from './components/MapCanvas'
import { MysterySheet } from './components/MysterySheet'
import { createIsland, WORLD } from './domain'
import type { Island } from './types'
import { useAppState } from './useAppState'

export default function App() {
  const { state, actions } = useAppState()
  const [editMode, setEditMode] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [newIslandId, setNewIslandId] = useState<string | null>(null)
  const [draftIsland, setDraftIsland] = useState<Island | null>(null)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [mysteryOpen, setMysteryOpen] = useState(false)
  const [guideStep, setGuideStep] = useState<number | null>(null)
  const selected = state.islands.find((island) => island.id === selectedId && !island.archived) ?? (draftIsland?.id === selectedId ? draftIsland : undefined)
  const archived = state.islands.filter((island) => island.archived)

  useEffect(() => {
    const handleBack = () => {
      setSelectedId(null)
      setNewIslandId(null)
    }
    window.addEventListener('popstate', handleBack)
    return () => window.removeEventListener('popstate', handleBack)
  }, [])

  function openEditor(id: string, isNew: boolean) {
    setEditMode(true)
    setSelectedId(id)
    setNewIslandId(isNew ? id : null)
    if (!window.history.state?.islandEditor) window.history.pushState({ islandEditor: true }, '')
  }

  function closeEditor() {
    if (window.history.state?.islandEditor) {
      window.history.back()
      return
    }
    setSelectedId(null)
    setNewIslandId(null)
    setDraftIsland(null)
  }

  function addIsland() {
    const screenCenter = { x: innerWidth / 2, y: innerHeight / 2 }
    const position = {
      x: Math.min(WORLD.width - 100, Math.max(100, (screenCenter.x - state.viewport.x) / state.viewport.scale)),
      y: Math.min(WORLD.height - 100, Math.max(100, (screenCenter.y - state.viewport.y) / state.viewport.scale)),
    }
    const draft = createIsland(position)
    setDraftIsland(draft)
    const id = draft.id
    setGuideStep(null)
    openEditor(id, true)
  }

  function updateSelected(patch: Partial<Island>) {
    if (newIslandId && draftIsland) setDraftIsland((current) => current ? { ...current, ...patch, updatedAt: new Date().toISOString() } : current)
    else if (selectedId) actions.updateIsland(selectedId, patch)
  }

  function completeEditor() {
    if (newIslandId && draftIsland) {
      actions.addIslandData(draftIsland)
      setDraftIsland(null)
    }
    closeEditor()
  }

  function removeIsland(id: string, permanent = false) {
    if (confirm(permanent ? '永久删除这座归档岛屿？此操作无法撤销。' : '删除这座岛屿？此操作无法撤销。')) {
      actions.deleteIsland(id)
      if (selectedId === id) setSelectedId(null)
      if (newIslandId === id) setNewIslandId(null)
      return true
    }
    return false
  }

  return <main className="app-shell">
    <MapCanvas
      viewport={state.viewport}
      islands={state.islands}
      boatPosition={state.boatPosition}
      editMode={editMode}
      selectedId={selectedId}
      onViewportChange={actions.setViewport}
      onSelectIsland={(id) => openEditor(id, false)}
      onOpenMystery={() => setMysteryOpen(true)}
      onMoveIsland={(id, position) => actions.updateIsland(id, { position })}
      onMoveBoat={actions.setBoatPosition}
    />

    <header className="topbar"><div className="brand"><img className="brand-mark" src={asset('undetermined-realm-mark.svg')} alt="" /><div><b>未定之境</b></div></div><div className="top-actions"><button className="icon-button glass" onClick={actions.resetViewport} aria-label="复位地图"><LocateFixed /></button><button className="icon-button glass" onClick={() => setArchiveOpen(true)} aria-label="归档"><Archive /></button><button className={`mode-toggle icon-only ${editMode ? 'editing' : ''}`} aria-label={editMode ? '完成编辑' : '编辑地图'} title={editMode ? '完成编辑' : '编辑地图'} onClick={() => { setEditMode((value) => !value); setSelectedId(null); setNewIslandId(null) }}><Pencil size={15} /><span className="sr-only">{editMode ? '完成编辑' : '编辑地图'}</span></button></div></header>

    {!state.onboarding.firstIslandCreated && <button className={`first-island ${guideStep === 4 ? 'first-island--guided' : ''}`} onClick={addIsland}><span><Plus /></span><div><b>为此刻，升起一座岛</b></div></button>}
    {state.onboarding.firstIslandCreated && editMode && <button className="floating-add" onClick={addIsland}><Plus />新建岛屿</button>}

    {guideStep !== null && <div className={`guide-overlay guide-overlay--step-${guideStep}`} aria-live="polite">
      {guideStep === 1 && <div className="guide-top-labels"><span>复位视角</span><span>归档</span><span>编辑</span></div>}
      {guideStep === 1 && <button className="guide-next" onClick={() => setGuideStep(4)}>下一步</button>}
    </div>}

    {!state.onboarding.introCompleted && <div className="onboarding-scrim"><section className="onboarding-card" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <h1 id="onboarding-title"><span>欢迎来到</span><strong>「未定之境·Unfold」</strong></h1>
      <p className="onboarding-lead">这不是任务清单，是你此刻正经历的人生阶段</p>
      <div className="onboarding-list">
        <article><strong>这片海</strong><span>地图代表你当前的人生版图，可以拖动、缩放</span></article>
        <article><strong>岛屿大小</strong><span>岛屿越大，代表它对当前阶段越重要</span></article>
        <article><strong>神秘岛与漂流瓶</strong><span>想探索未知时，可以捞个漂流瓶</span></article>
      </div>
      <button className="onboarding-start" onClick={() => { actions.completeIntro(); setGuideStep(1) }}>开始航行</button>
    </section></div>}

    {selected && editMode && <EditorDrawer island={selected} isNew={newIslandId === selected.id} onChange={updateSelected} onComplete={completeEditor} onClose={closeEditor} onArchive={() => { if (newIslandId) closeEditor(); else { actions.updateIsland(selected.id, { archived: true }); closeEditor() } }} onDelete={() => { if (newIslandId) closeEditor(); else if (removeIsland(selected.id)) closeEditor() }} />}
    {archiveOpen && <ArchiveDrawer islands={archived} onRestore={(id) => actions.updateIsland(id, { archived: false })} onDelete={(id) => removeIsland(id, true)} onClose={() => setArchiveOpen(false)} />}
    {mysteryOpen && <MysterySheet current={state.currentMysteryEvent} history={state.completedEventHistory} pool={state.eventPool} onClose={() => setMysteryOpen(false)} onAccept={actions.acceptMysteryEvent} onComplete={actions.completeMysteryEvent} onAbandon={actions.abandonMysteryEvent} onAddPool={actions.addPoolEvent} onUpdatePool={actions.updatePoolEvent} onDeletePool={actions.deletePoolEvent} />}
  </main>
}
