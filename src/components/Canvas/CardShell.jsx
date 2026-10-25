import { memo, useRef } from 'react'
import { useCanvasStore } from '../../state/useCanvasStore'
import NoteCard from './NoteCard'
import ResizeHandles from './ResizeHandles'

const DRAG_THRESHOLD = 3 // screen px of movement before a press counts as a drag

function CardShell({ card }) {
  const dragRef = useRef(null)

  const selected = useCanvasStore((s) => s.selectedIds.includes(card.id))
  // resize handles only show when this is the one and only selected card
  const showHandles = useCanvasStore(
    (s) => s.selectedIds.length === 1 && s.selectedIds[0] === card.id
  )
  const setEditingId = useCanvasStore((s) => s.setEditingId)

  const handlePointerDown = (e) => {
    // middle click or Space held: don't drag the card, let the canvas pan
    if (e.button !== 0 || useCanvasStore.getState().spacePressed) return
    e.stopPropagation() // so the canvas doesn't treat this as "click on empty space"

    const { selectedIds, toggleSelect, selectCard } = useCanvasStore.getState()

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
        ${selected ? 'border-fuchsia-500 ring-2 ring-fuchsia-500/40' : 'border-white/10'}`}
      style={{ left: card.x, top: card.y, width: card.w, height: card.h, zIndex: card.z }}
    >
      {card.type === 'note' && <NoteCard card={card} />}
      {showHandles && <ResizeHandles card={card} />}
    </div>
  )
}

export default memo(CardShell)