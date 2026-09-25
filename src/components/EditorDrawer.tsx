import { Archive, Check, Trash2 } from 'lucide-react'
import type { Island, IslandSize, IslandStatus, IslandType } from '../types'

interface Props {
  island: Island
  onChange: (patch: Partial<Island>) => void
  onClose: () => void
  isNew: boolean
  onArchive: () => void
  onDelete: () => void
}

export function EditorDrawer({ island, onChange, onClose, isNew, onArchive, onDelete }: Props) {
  return <><button className="editor-backdrop" onClick={onClose} aria-label="关闭编辑面板" /><aside className="sheet editor-sheet" aria-label="编辑岛屿">
    <header><div><small>编辑岛屿</small><h2>{island.name}</h2></div></header>
    <label>名称<input value={island.name} maxLength={20} onChange={(e) => onChange({ name: e.target.value })} /></label>
    <label>当前事件<textarea value={island.currentEvent} maxLength={80} placeholder="现在正在发生什么？" onChange={(e) => onChange({ currentEvent: e.target.value })} /></label>
    <fieldset><legend>类型</legend><Segmented values={[['main', '主线'], ['side', '支线']]} current={island.type} onChange={(type) => onChange({ type: type as IslandType })} /></fieldset>
    <fieldset><legend>状态</legend><Segmented values={[['active', '探索中'], ['paused', '暂停'], ['completed', '完成']]} current={island.status} onChange={(status) => onChange({ status: status as IslandStatus })} /></fieldset>
    <fieldset><legend>大小</legend><Segmented values={[['small', '小'], ['medium', '中'], ['large', '大']]} current={island.size} onChange={(size) => onChange({ size: size as IslandSize })} /></fieldset>
    <button className="primary editor-complete" onClick={onClose}><Check size={17} />{isNew ? '完成创建' : '保存并关闭'}</button>
    <div className="sheet-actions secondary-actions"><button className="secondary" onClick={onArchive}><Archive size={17} />归档</button><button className="danger" onClick={onDelete}><Trash2 size={17} />删除</button></div>
  </aside></>
}

function Segmented({ values, current, onChange }: { values: string[][]; current: string; onChange: (value: string) => void }) {
  return <div className="segmented">{values.map(([value, label]) => <button key={value} className={current === value ? 'active' : ''} onClick={() => onChange(value)}>{label}</button>)}</div>
}
