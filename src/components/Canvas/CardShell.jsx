import { memo, useRef } from 'react'
import { useCanvasStore } from '../../state/useCanvasStore'
import useUiStore from '../../state/useUiStore'
import { screenToCanvas } from '../../lib/coords'
import { cardAt } from '../../lib/edges'
import NoteCard from './NoteCard'
import TodoCard from './TodoCard'
import CodeCard from './CodeCard'
import LinkCard from './LinkCard'
import ResizeHandles from './ResizeHandles'

const DRAG_THRESHOLD = 3 // screen px of movement before a press counts as a drag

// presses on these should work normally, not start a card drag
const INTERACTIVE = 'input, textarea, select, button, a, [contenteditable="true"]'

// which component draws the inside of each card type
const BODIES = {
  note: NoteCard,
  todo: TodoCard,
  code: CodeCard,
  link: LinkCard,
}

// pointer position in canvas coordinates (needs the canvas container's screen position)
const toCanvas = (e) => {
  const rect = e.currentTarget.closest('.canvas').getBoundingClientRect()
  return screenToCanvas(
    e.clientX - rect.left,
    e.clientY - rect.top,
    useCanvasStore.getState().viewport
  )
}

function CardShell({ card }) {
  const dragRef = useRef(null)
  const connectRef = useRef(false) // true while drawing an arrow from this card
  const Body = BODIES[card.type]

  const selected = useCanvasStore((s) => s.selectedIds.includes(card.id))
  // resize handles only show when this is the one and only selected card
  const showHandles = useCanvasStore(
    (s) => s.selectedIds.length === 1 && s.selectedIds[0] === card.id
  )
  const setEditingId = useCanvasStore((s) => s.setEditingId)
  const lineMode = useUiStore((s) => s.activeTool === 'line')

  const handlePointerDown = (e) => {
    // middle click or Space held: don't drag the card, let the canvas pan
    if (e.button !== 0 || useCanvasStore.getState().spacePressed) return
    e.stopPropagation() // so the canvas doesn't treat this as "click on empty space"

    const { selectedIds, toggleSelect, selectCard, startConnect } =
      useCanvasStore.getState()

    // Line tool: start an arrow from this card
    if (useUiStore.getState().activeTool === 'line') {
      const p = toCanvas(e)
      startConnect(card.id, p.x, p.y)
      connectRef.current = true
      e.currentTarget.setPointerCapture(e.pointerId)
      return
    }

    // pressed on a textarea / input / select / button: select the card,
    // but do NOT start a drag or capture the pointer
    if (e.target.closest(INTERACTIVE)) {
      if (!selectedIds.includes(card.id)) selectCard(card.id)
      return
    }

    // shift-click: add/remove this card from the selection, no drag
    if (e.shiftKey) {
      toggleSelect(card.id)
      return
    }

    // pressing a card that's already part of a group keeps the group, so you can drag it all
    const inGroup = selectedIds.includes(card.id) && selectedIds.length > 1
    if (!inGroup) selectCard(card.id)

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      moved: false,
      collapseOnUp: inGroup,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e) => {
    // drawing an arrow: move its free end
    if (connectRef.current) {
      const p = toCanvas(e)
      useCanvasStore.getState().moveConnect(p.x, p.y)
      return
    }

    const drag = dragRef.current
    if (!drag) return

    // ignore tiny jitters so a simple click doesn't count as a drag (or an undo step)
    if (!drag.moved) {
      const distance = Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY)
      if (distance < DRAG_THRESHOLD) return
      drag.moved = true
      useCanvasStore.getState().saveHistory() // the whole drag = one undo step
    }

    const { viewport, moveSelectedBy } = useCanvasStore.getState()
    moveSelectedBy(
      (e.clientX - drag.lastX) / viewport.zoom,
      (e.clientY - drag.lastY) / viewport.zoom
    )
    drag.lastX = e.clientX
    drag.lastY = e.clientY
  }

  const handlePointerUp = (e) => {
    // finishing an arrow: connect to whichever card is under the pointer
    if (connectRef.current) {
      connectRef.current = false
      const state = useCanvasStore.getState()
      const p = toCanvas(e)
      const target = cardAt(state.cards, p.x, p.y)
      state.endConnect(target ? target.id : null)
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId)
      }
      return
    }

    const drag = dragRef.current
    if (!drag) return
    dragRef.current = null
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    // plain click (no drag) on a card inside a group: narrow the selection to just this card
    if (drag.collapseOnUp && !drag.moved) {
      useCanvasStore.getState().selectCard(card.id)
    }
  }

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={() => setEditingId(card.id)}
      className={`absolute rounded-lg border bg-white/5 text-sm shadow-lg backdrop-blur
        ${selected ? 'border-fuchsia-500 ring-2 ring-fuchsia-500/40' : 'border-white/10'}
        ${lineMode ? 'cursor-crosshair' : ''}`}
      style={{ left: card.x, top: card.y, width: card.w, height: card.h, zIndex: card.z }}
    >
      {/* in Line mode the inside ignores the mouse, so presses always reach the card */}
      <div className="h-full w-full" style={lineMode ? { pointerEvents: 'none' } : undefined}>
        {Body && <Body card={card} />}
      </div>
      {showHandles && <ResizeHandles card={card} />}
    </div>
  )
}

export default memo(CardShell)