import { useEffect, useRef, useState } from 'react'
import { useCanvasStore } from '../../state/useCanvasStore'
import useUiStore from '../../state/useUiStore'
import { screenToCanvas } from '../../lib/coords'
import { rectFromPoints, rectsOverlap } from '../../lib/geometry'
import { buildCard, isCardTool } from '../../lib/cardDefaults'
import useCanvasShortcuts from '../../hooks/useCanvasShortcuts'
import CardShell from './CardShell'
import SelectionBox from './SelectionBox'
import EdgesLayer from './EdgesLayer'

const DOT_GAP = 24 // px between dots at 100% zoom
const MARQUEE_THRESHOLD = 3 // px of movement before a click becomes a drag-select

export default function Canvas() {
  const containerRef = useRef(null)
  const panRef = useRef(null) // { lastX, lastY } while panning, else null
  const marqueeRef = useRef(null) // { startX, startY, baseIds, active } while drag-selecting
  const lastCreatedRef = useRef(0) // time a card was last created (to ignore its double-click)
  const [marqueeRect, setMarqueeRect] = useState(null) // the visible box, in screen pixels

  const viewport = useCanvasStore((s) => s.viewport)
  const cards = useCanvasStore((s) => s.cards)
  const panBy = useCanvasStore((s) => s.panBy)
  const spacePressed = useCanvasStore((s) => s.spacePressed)

  const activeTool = useUiStore((s) => s.activeTool)
  const setActiveTool = useUiStore((s) => s.setActiveTool)

  useCanvasShortcuts()

  // wheel: Ctrl/Cmd = zoom toward cursor, otherwise pan.
  // Listens on window so the browser's page-zoom is blocked everywhere,
  // but only moves the canvas when the mouse is over it.
  useEffect(() => {
    const onWheel = (e) => {
      const zoomGesture = e.ctrlKey || e.metaKey
      if (zoomGesture) e.preventDefault()

      const el = containerRef.current
      if (!el || !el.contains(e.target)) return

      // plain scrolling over a todo list / code box that can scroll: let it scroll itself
      if (!zoomGesture) {
        const scrollable = e.target.closest?.('[data-scrollable]')
        if (
          scrollable &&
          (scrollable.scrollHeight > scrollable.clientHeight ||
            scrollable.scrollWidth > scrollable.clientWidth)
        ) {
          return
        }
      }

      e.preventDefault()

      const { zoomAtPoint, panBy, viewport } = useCanvasStore.getState()
      if (zoomGesture) {
        const rect = el.getBoundingClientRect()
        const factor = Math.exp(-e.deltaY * 0.01)
        zoomAtPoint(e.clientX - rect.left, e.clientY - rect.top, viewport.zoom * factor)
      } else {
        panBy(-e.deltaX, -e.deltaY)
      }
    }
    window.addEventListener('wheel', onWheel, { passive: false })
    return () => window.removeEventListener('wheel', onWheel)
  }, [])

  // mouse position relative to the canvas container
  const localPoint = (e) => {
    const rect = containerRef.current.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  } 

  // creates a card of any type, centered on a screen point
  const createCardAt = (type, screenPoint, startEditing) => {
    const { viewport, addCard, setEditingId } = useCanvasStore.getState()
    const p = screenToCanvas(screenPoint.x, screenPoint.y, viewport)
    const card = buildCard(type, p.x, p.y)
    addCard(card)
    lastCreatedRef.current = Date.now()
    if (startEditing) setEditingId(card.id)
  }

  const releaseCapture = (e) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }

  const handlePointerDown = (e) => {
    const store = useCanvasStore.getState()

    // pan: middle mouse, or Space held
    if (e.button === 1 || store.spacePressed) {
      e.preventDefault() // stops the browser's middle-click autoscroll
      panRef.current = { lastX: e.clientX, lastY: e.clientY }
      e.currentTarget.setPointerCapture(e.pointerId)
      return
    }
    if (e.button !== 0) return

    const point = localPoint(e)

    // a card tool (note, todo, code, link): place that card, then go back to Select.
    // a new link card opens its form straight away so you can paste the address.
    if (isCardTool(activeTool)) {
      createCardAt(activeTool, point, activeTool === 'link')
      setActiveTool('select')
      return
    }

    // otherwise: empty canvas. Clear the selection (unless Shift) and start a drag-select box
    if (!e.shiftKey) store.clearSelection()
    marqueeRef.current = {
      startX: point.x,
      startY: point.y,
      baseIds: e.shiftKey ? store.selectedIds : [],
      active: false,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e) => {
    if (panRef.current) {
      panBy(e.clientX - panRef.current.lastX, e.clientY - panRef.current.lastY)
      panRef.current = { lastX: e.clientX, lastY: e.clientY }
      return
    }

    const m = marqueeRef.current
    if (!m) return

    const point = localPoint(e)
    if (!m.active) {
      if (Math.hypot(point.x - m.startX, point.y - m.startY) < MARQUEE_THRESHOLD) return
      m.active = true
    }

    // the visible box (screen pixels)
    setMarqueeRect(rectFromPoints(m.startX, m.startY, point.x, point.y))

    // the same box on the board (canvas units), to test against cards
    const { viewport, cards, setSelection } = useCanvasStore.getState()
    const a = screenToCanvas(m.startX, m.startY, viewport)
    const b = screenToCanvas(point.x, point.y, viewport)
    const box = rectFromPoints(a.x, a.y, b.x, b.y)
    const hit = cards.filter((c) => rectsOverlap(box, c)).map((c) => c.id)
    setSelection([...new Set([...m.baseIds, ...hit])])
  }

  const handlePointerUp = (e) => {
    if (!panRef.current && !marqueeRef.current) return
    panRef.current = null
    marqueeRef.current = null
    setMarqueeRect(null)
    releaseCapture(e)
  }

  // double-click on empty canvas: new note, ready to type
  const handleDoubleClick = (e) => {
    if (e.target !== e.currentTarget) return // the double-click landed on a card
    if (Date.now() - lastCreatedRef.current < 500) return // a tool just made a card
    createCardAt('note', localPoint(e), true)
  }

  const gap = DOT_GAP * viewport.zoom

  return (
    <div
      ref={containerRef}
      className={`canvas absolute inset-0 touch-none overflow-hidden ${
        spacePressed ? 'space-pan' : ''
      }`}
      style={{
        backgroundImage:
          'radial-gradient(circle, rgb(var(--rgb-grid-dot) / var(--grid-dot-alpha)) 1px, transparent 1px)',
        backgroundSize: `${gap}px ${gap}px`,
        backgroundPosition: `${viewport.offsetX}px ${viewport.offsetY}px`,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={handleDoubleClick}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{
          transform: `translate(${viewport.offsetX}px, ${viewport.offsetY}px) scale(${viewport.zoom})`,
        }}
      >
        {/* arrows sit under the cards but move and zoom with them */}
        <EdgesLayer />
        {cards.map((card) => (
          <CardShell key={card.id} card={card} />
        ))}
      </div>

      {marqueeRect && <SelectionBox rect={marqueeRect} />}
    </div>
  )
}