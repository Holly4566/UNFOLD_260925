import { ArrowLeft, Check, History, Pencil, Plus, RotateCcw, Settings2, Trash2, Waves, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { drawCandidate } from '../domain'
import type { CompletedEvent, MysteryEvent, PoolEvent } from '../types'

type Page = 'home' | 'draw' | 'history' | 'pool'

interface Props {
  current: MysteryEvent | null
  history: CompletedEvent[]
  pool: PoolEvent[]
  onClose: () => void
  onAccept: (event: PoolEvent) => void
  onComplete: () => void
  onAbandon: () => void
  onAddPool: (text: string) => void
  onUpdatePool: (id: string, patch: Partial<PoolEvent>) => void
  onDeletePool: (id: string) => void
}

export function MysterySheet(props: Props) {
  const [page, setPage] = useState<Page>('home')
  const [seen, setSeen] = useState<string[]>([])
  const [candidate, setCandidate] = useState<PoolEvent | null>(null)
  const [draft, setDraft] = useState('')
  const enabledCount = useMemo(() => props.pool.filter((event) => event.enabled).length, [props.pool])

  function startDraw() {
    const next = drawCandidate(props.pool, [])
    setSeen(next ? [next.id] : [])
    setCandidate(next)
    setPage('draw')
  }

  function redraw() {
    const next = drawCandidate(props.pool, seen)
    if (!next) return
    setSeen((items) => [...items, next.id])
    setCandidate(next)
  }

  function accept() {
    if (!candidate) return
    props.onAccept(candidate)
    setPage('home')
  }

  const back = page !== 'home' ? <button className="icon-button" onClick={() => setPage('home')} aria-label="返回"><ArrowLeft /></button> : null

  return <div className="scrim" onMouseDown={(e) => e.target === e.currentTarget && props.onClose()}>
    <section className="sheet mystery-sheet" role="dialog" aria-modal="true" aria-label="神秘岛">
      <header>{back}<div className="mystery-title"><small>雾中来信</small><h2>{page === 'home' ? '神秘岛' : page === 'draw' ? '漂流瓶' : page === 'history' ? '走过的路' : '事件池'}</h2></div><button className="icon-button" onClick={props.onClose} aria-label="关闭"><X /></button></header>

      {page === 'home' && <>
        {props.current ? <div className="current-event"><span>当前漂流瓶事件</span><p>{props.current.text}</p><div><button className="primary" onClick={props.onComplete}><Check size={17} />完成</button><button className="secondary" onClick={props.onAbandon}>放弃</button></div></div> : <div className="bottle-call"><img src="/assets/bottle.png" alt="漂流瓶" /><div><p>潮水带来了一只漂流瓶</p><button className="primary" onClick={startDraw}><Waves size={17} />捞一个漂流瓶</button></div></div>}
        <nav className="quiet-links"><button onClick={() => setPage('history')}><History size={17} />之前做过的事<span>{props.history.length}</span></button><button onClick={() => setPage('pool')}><Settings2 size={17} />管理漂流瓶事件池<span>{enabledCount} 启用</span></button></nav>
      </>}

      {page === 'draw' && <div className="draw-view">
        {candidate ? <><small>第 {seen.length} 次遇见</small><blockquote>{candidate.text}</blockquote><p>{seen.length < 3 ? `还可以换 ${3 - seen.length} 次` : '换取机会已用完，你仍可以放回海里'}</p><div className="draw-actions"><button className="primary" onClick={accept}>接下它</button>{seen.length < 3 && enabledCount > seen.length && <button className="secondary" onClick={redraw}><RotateCcw size={16} />换一个</button>}<button className="text-button" onClick={() => setPage('home')}>放回海里</button></div></> : <div className="empty"><p>海里暂时没有可用的漂流瓶。</p><button className="secondary" onClick={() => setPage('pool')}>去添加事件</button></div>}
      </div>}

      {page === 'history' && <div className="history-list">{props.history.length ? props.history.map((item) => <article key={item.id}><Check size={16} /><div><p>{item.text}</p><time>{new Date(item.completedAt).toLocaleDateString('zh-CN')}</time></div></article>) : <p className="empty">完成过的随机事件会留在这里。</p>}</div>}

      {page === 'pool' && <div className="pool-manager">
        <form onSubmit={(e) => { e.preventDefault(); if (draft.trim()) { props.onAddPool(draft.trim()); setDraft('') } }}><input value={draft} maxLength={60} onChange={(e) => setDraft(e.target.value)} placeholder="写下一件值得尝试的小事" /><button className="primary" aria-label="添加事件"><Plus /></button></form>
        <div className="pool-list">{props.pool.map((item) => <PoolRow key={item.id} item={item} onUpdate={props.onUpdatePool} onDelete={props.onDeletePool} />)}</div>
      </div>}
    </section>
  </div>
}

function PoolRow({ item, onUpdate, onDelete }: { item: PoolEvent; onUpdate: (id: string, patch: Partial<PoolEvent>) => void; onDelete: (id: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(item.text)
  return <div className={`pool-row ${item.enabled ? '' : 'disabled'}`}><button className={`toggle ${item.enabled ? 'on' : ''}`} onClick={() => onUpdate(item.id, { enabled: !item.enabled })} aria-label={item.enabled ? '停用' : '启用'}><span /></button>{editing ? <input autoFocus value={text} onChange={(e) => setText(e.target.value)} onBlur={() => { if (text.trim()) onUpdate(item.id, { text: text.trim() }); setEditing(false) }} /> : <p>{item.text}</p>}<button className="icon-button" onClick={() => setEditing(true)} aria-label="编辑"><Pencil /></button><button className="icon-button danger-plain" onClick={() => onDelete(item.id)} aria-label="删除"><Trash2 /></button></div>
}
