import { ArchiveRestore, Trash2 } from 'lucide-react'
import type { Island } from '../types'

export function ArchiveDrawer({ islands, onRestore, onDelete, onClose, onBackup, onImport }: { islands: Island[]; onRestore: (id: string) => void; onDelete: (id: string) => void; onClose: () => void; onBackup: () => void; onImport: () => void }) {
  return <><button className="drawer-backdrop" onClick={onClose} aria-label="关闭归档" /><aside className="sheet archive-sheet"><header><div><small>远去的岛屿</small><h2>归档</h2></div><div className="drawer-header-actions"><button className="text-button backup-button" onClick={onBackup}>导出</button><button className="text-button backup-button" onClick={onImport}>导入</button></div></header>
    <div className="list">{islands.length ? islands.map((island) => <div className="list-row" key={island.id}><div><b>{island.name}</b><small>{island.type === 'main' ? '主线' : '支线'}</small></div><div><button className="icon-button" onClick={() => onRestore(island.id)} aria-label="恢复"><ArchiveRestore /></button><button className="icon-button danger-plain" onClick={() => onDelete(island.id)} aria-label="永久删除"><Trash2 /></button></div></div>) : <p className="empty">这里暂时没有归档的岛屿。</p>}</div>
  </aside></>
}
