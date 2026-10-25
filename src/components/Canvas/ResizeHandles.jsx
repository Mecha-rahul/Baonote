import { useRef } from 'react'
import { useCanvasStore } from '../../state/useCanvasStore'

const MIN_W = 80
const MIN_H = 60

// where each handle sits (as % of the card) and which cursor it shows
const HANDLES = [
  { dir: 'nw', left: '0%', top: '0%', cursor: 'nwse-resize' },
  { dir: 'n', left: '50%', top: '0%', cursor: 'ns-resize' },
  { dir: 'ne', left: '100%', top: '0%', cursor: 'nesw-resize' },
  { dir: 'e', left: '100%', top: '50%', cursor: 'ew-resize' },
  { dir: 'se', left: '100%', top: '100%', cursor: 'nwse-resize' },
  { dir: 's', left: '50%', top: '100%', cursor: 'ns-resize' },
  { dir: 'sw', left: '0%', top: '100%', cursor: 'nesw-resize' },
  { dir: 'w', left: '0%', top: '50%', cursor: 'ew-resize' },
]

// orig = the card's rectangle when the resize started; dx/dy = mouse movement in canvas units
function resizeRect(orig, dir, dx, dy) {
  let { x, y, w, h } = orig

  if (dir.includes('e')) w = orig.w + dx
  if (dir.includes('s')) h = orig.h + dy
  if (dir.includes('w')) {
    w = orig.w - dx
    x = orig.x + dx
  }
  if (dir.includes('n')) {
    h = orig.h - dy
    y = orig.y + dy
  }

  // enforce the minimum size; for west/north handles, pin the opposite edge in place
  if (w < MIN_W) {
    if (dir.includes('w')) x = orig.x + orig.w - MIN_W
    w = MIN_W
  }
  if (h < MIN_H) {
    if (dir.includes('n')) y = orig.y + orig.h - MIN_H
    h = MIN_H
  }

  return { x, y, w, h }
}

export default function ResizeHandles({ card }) {
  const zoom = useCanvasStore((s) => s.viewport.zoom)
  const resizeRef = useRef(null)

  const handlePointerDown = (e, dir) => {
    if (e.button !== 0) return
    e.stopPropagation() // don't start dragging the card
    resizeRef.current = {
      dir,
      startX: e.clientX,
      startY: e.clientY,
      orig: { x: card.x, y: card.y, w: card.w, h: card.h },
      moved: false,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e) => {
    const r = resizeRef.current
    if (!r) return
    const scale = useCanvasStore.getState().viewport.zoom
    const dx = (e.clientX - r.startX) / scale
    const dy = (e.clientY - r.startY) / scale

    if (!r.moved) {
      if (dx === 0 && dy === 0) return
      r.moved = true
      useCanvasStore.getState().saveHistory() // the whole resize = one undo step
    }
    useCanvasStore.getState().updateCard(card.id, resizeRect(r.orig, r.dir, dx, dy))
  }

  const handlePointerUp = (e) => {
    if (!resizeRef.current) return
    resizeRef.current = null
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }

  return (
    <>
      {HANDLES.map((h) => (
        <div
          key={h.dir}
          onPointerDown={(e) => handlePointerDown(e, h.dir)}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onDoubleClick={(e) => e.stopPropagation()} // don't open text editing
          // swap the colors for your tokens
          className="absolute h-2.5 w-2.5 rounded-sm border border-fuchsia-500 bg-white"
          style={{
            left: h.left,
            top: h.top,
            cursor: h.cursor,
            transform: `translate(-50%, -50%) scale(${1 / zoom})`,
          }}
        />
      ))}
    </>
  )
}