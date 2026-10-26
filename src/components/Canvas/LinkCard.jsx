import { useEffect, useRef, useState } from 'react'
import { ExternalLink, Link2 } from 'lucide-react'
import { useCanvasStore } from '../../state/useCanvasStore'
import { getHostname, getOrigin, normalizeUrl } from '../../lib/url'

const stop = (e) => e.stopPropagation() // controls must not drag the card

// the site's icon, falling back to a generic link icon if it can't load
function Favicon({ url }) {
  const [failed, setFailed] = useState(false)
  const origin = getOrigin(url)
  if (!origin || failed) {
    return <Link2 size={18} className="mt-0.5 shrink-0 opacity-60" />
  }
  return (
    <img
      src={`${origin}/favicon.ico`}
      alt=""
      width={18}
      height={18}
      draggable={false}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="mt-0.5 h-[18px] w-[18px] shrink-0 rounded-sm"
    />
  )
}

export default function LinkCard({ card }) {
  const editingNow = useCanvasStore((s) => s.editingId === card.id)
  const setEditingId = useCanvasStore((s) => s.setEditingId)
  const setSelection = useCanvasStore((s) => s.setSelection)
  const updateCardContent = useCanvasStore((s) => s.updateCardContent)

  const savedUrl = card.content.url ?? ''
  const savedTitle = card.content.title ?? ''
  // re-check stored links every time (saved data could have been tampered with)
  const safeUrl = normalizeUrl(savedUrl)

  const [draftUrl, setDraftUrl] = useState(savedUrl)
  const [draftTitle, setDraftTitle] = useState(savedTitle)
  const [error, setError] = useState('')
  const urlRef = useRef(null)

  // the edit form shows when editing, or when there's no valid link yet
  const editing = editingNow || !safeUrl

  // when editing starts: load the saved values, then focus the URL box
  // (setTimeout lets the click that created the card finish first, or it steals the focus back)
  useEffect(() => {
    if (!editingNow) return
    setDraftUrl(savedUrl)
    setDraftTitle(savedTitle)
    setError('')
    const t = setTimeout(() => urlRef.current?.focus(), 0)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingNow])

  const commit = () => {
    const typed = draftUrl.trim()
    // nothing typed: keep what we had
    if (!typed) {
      setError('')
      setEditingId(null)
      return
    }
    const normalized = normalizeUrl(typed)
    if (!normalized) {
      setError('Enter a valid web link (http or https)')
      return
    }
    const title = draftTitle.trim()
    if (normalized !== savedUrl || title !== savedTitle) {
      updateCardContent(card.id, { url: normalized, title })
    }
    setError('')
    setEditingId(null)
  }

  const cancel = () => {
    setDraftUrl(savedUrl)
    setDraftTitle(savedTitle)
    setError('')
    setEditingId(null)
    document.activeElement?.blur?.()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      commit()
    } else if (e.key === 'Escape') {
      cancel()
    }
  }

  // save when focus leaves BOTH inputs (moving between them doesn't count)
  const handleBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) commit()
  }

  if (editing) {
    return (
      <div className="flex h-full w-full flex-col justify-center gap-2 p-3" onBlur={handleBlur}>
        <input
          ref={urlRef}
          value={draftUrl}
          placeholder="Paste a link"
          onChange={(e) => setDraftUrl(e.target.value)}
          onPointerDown={stop}
          onFocus={() => setSelection([card.id])}
          onKeyDown={handleKeyDown}
          className="w-full rounded border border-white/10 bg-transparent px-2 py-1 outline-none placeholder:opacity-40"
        />
        <input
          value={draftTitle}
          placeholder="Title (optional)"
          onChange={(e) => setDraftTitle(e.target.value)}
          onPointerDown={stop}
          onFocus={() => setSelection([card.id])}
          onKeyDown={handleKeyDown}
          className="w-full rounded border border-white/10 bg-transparent px-2 py-1 text-xs outline-none placeholder:opacity-40"
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col justify-between p-3">
      <div className="flex items-start gap-2">
        <Favicon key={safeUrl} url={safeUrl} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-medium">{savedTitle || getHostname(safeUrl)}</div>
          <div className="truncate text-xs opacity-60">{safeUrl}</div>
        </div>
      </div>
      <a
        href={safeUrl}
        target="_blank"
        rel="noopener noreferrer"
        onPointerDown={stop}
        className="flex items-center gap-1 self-start text-xs opacity-70 hover:opacity-100"
      >
        <ExternalLink size={14} /> Open
      </a>
    </div>
  )
}