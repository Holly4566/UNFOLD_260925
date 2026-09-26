import { Archive, Check, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { Island, IslandSize, IslandStatus, IslandType } from '../types'

interface Props {
  island: Island
  onChange: (patch: Partial<Island>) => void
  onClose: () => void
  onComplete: () => void
  isNew: boolean
  onDelete: () => void
}

export function EditorDrawer({ island, onChange, onClose, onComplete, isNew, onDelete }: Props) {
  const [stageDraft, setStageDraft] = useState('')
  const currentStages = island.stageNotes.filter((note) => !note.archivedAt)
  const pastStages = island.stageNotes.filter((note) => note.archivedAt)

  function addStage() {
    const content = stageDraft.trim()
    if (!content) return
    onChange({ stageNotes: [...island.stageNotes, { id: crypto.randomUUID(), content, createdAt: new Date().toISOString(), archivedAt: null }] })
    setStageDraft('')
  }

  function updateStage(id: string, patch: { content?: string; archivedAt?: string | null }) {
    onChange({ stageNotes: island.stageNotes.map((note) => note.id === id ? { ...note, ...patch } : note) })
  }

  function deleteStage(id: string) {
    onChange({ stageNotes: island.stageNotes.filter((note) => note.id !== id) })
  }

  return <><button className="editor-backdrop" onClick={onClose} aria-label="关闭编辑面板" /><aside className="sheet editor-sheet" aria-label="编辑岛屿">
    <header><div><small>编辑岛屿</small><h2>{island.name}</h2></div></header>
    <label>名称<input value={island.name} maxLength={20} onChange={(e) => onChange({ name: e.target.value })} /></label>
    <section className="stage-editor" aria-label="当前阶段">
      <div className="section-heading"><div><b>当前阶段</b><small>记录这个领域里的你，现在在哪里</small></div><span>{currentStages.length} 条</span></div>
      <div className="stage-list">{currentStages.map((note) => <div className="stage-row" key={note.id}><textarea value={note.content} maxLength={80} aria-label="阶段描述" onChange={(e) => updateStage(note.id, { content: e.target.value })} /><div><button className="stage-action" onClick={() => updateStage(note.id, { archivedAt: new Date().toISOString() })}><Archive size={14} />移入过往</button><button className="icon-button danger-plain" onClick={() => deleteStage(note.id)} aria-label="删除阶段描述"><Trash2 /></button></div></div>)}</div>
      <div className="stage-add"><input value={stageDraft} maxLength={80} placeholder="例如：正在重新寻找生活节奏" onChange={(e) => setStageDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addStage() } }} /><button className="secondary" onClick={addStage}><Plus size={16} />添加状态</button></div>
    </section>
    {pastStages.length > 0 && <details className="past-stages"><summary>过往阶段 <span>{pastStages.length}</span></summary><div>{pastStages.map((note) => <article key={note.id}><div><p>{note.content}</p><time>{new Date(note.archivedAt!).toLocaleDateString('zh-CN')}</time></div><button className="stage-action" onClick={() => updateStage(note.id, { archivedAt: null })}><RotateCcw size={13} />恢复到现在</button></article>)}</div></details>}
    <fieldset><legend>类型</legend><Segmented values={[['main', '主线'], ['side', '支线']]} current={island.type} onChange={(type) => onChange({ type: type as IslandType })} /></fieldset>
    <fieldset><legend>状态</legend><Segmented values={[['active', '探索中'], ['paused', '暂停'], ['completed', '完成']]} current={island.status} onChange={(status) => onChange({ status: status as IslandStatus })} /></fieldset>
    <fieldset><legend>大小</legend><Segmented values={[['small', '小'], ['medium', '中'], ['large', '大']]} current={island.size} onChange={(size) => onChange({ size: size as IslandSize })} /></fieldset>
    <button className="primary editor-complete" onClick={onComplete}><Check size={17} />{isNew ? '完成创建' : '保存并关闭'}</button>
    <div className="editor-icon-actions"><button className="danger editor-icon-action" onClick={onDelete} aria-label="删除岛屿"><Trash2 /></button><button className="primary editor-icon-action" onClick={onComplete} aria-label={isNew ? '完成创建' : '保存并关闭'}><Check /></button></div>
  </aside></>
}

function Segmented({ values, current, onChange }: { values: string[][]; current: string; onChange: (value: string) => void }) {
  return <div className="segmented">{values.map(([value, label]) => <button key={value} className={current === value ? 'active' : ''} onClick={() => onChange(value)}>{label}</button>)}</div>
}
