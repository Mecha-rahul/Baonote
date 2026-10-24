import { useEffect, useRef } from 'react'
import { useCanvasStore } from '../../state/useCanvasStore'
import useUiStore from '../../state/useUiStore'
import { screenToCanvas } from '../../lib/coords'
import CardShell from './CardShell'

const DOT_GAP = 24 // px between dots at 100% zoom

export default function Canvas() {
  const containerRef = useRef(null)
  const panRef = useRef(null) // { lastX, lastY } while panning, else null

  const viewport = useCanvasStore((s) => s.viewport)
  const cards = useCanvasStore((s) => s.cards)
  const addCard = useCanvasStore((s) => s.addCard)
  const panBy = useCanvasStore((s) => s.panBy)
  const clearSelection = useCanvasStore((s) => s.clearSelection)

  const activeTool = useUiStore((s) => s.activeTool)
  const setActiveTool = useUiStore((s) => s.setActiveTool)

  // wheel: Ctrl/Cmd = zoom toward cursor, otherwise pan.
  // Listens on window so the browser's page-zoom is blocked everywhere,
  // but only moves the canvas when the mouse is over it.
  useEffect(() => {
    const onWheel = (e) => {
      const zoomGesture = e.ctrlKey || e.metaKey
      if (zoomGesture) e.preventDefault()

      const el = containerRef.current
      if (!el || !el.contains(e.target)) return
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

  // track the Space key (ignored while typing in a card)
  useEffect(() => {
    const typing = () =>
      ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)

    const down = (e) => {
      if (e.code === 'Space' && !typing()) {
        e.preventDefault()
        useCanvasStore.getState().setSpacePressed(true)
      }
    }
    const up = (e) => {
      if (e.code === 'Space') useCanvasStore.getState().setSpacePressed(false)
    }

    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  const handlePointerDown = (e) => {
    const isMiddle = e.button === 1
    if (isMiddle || useCanvasStore.getState().spacePressed) {
      e.preventDefault() // stops the browser's middle-click autoscroll
      panRef.current = { lastX: e.clientX, lastY: e.clientY }
      e.currentTarget.setPointerCapture(e.pointerId)
      return
    }
    if (e.button !== 0) return

    if (activeTool === 'note') {
      const rect = containerRef.current.getBoundingClientRect()
      const p = screenToCanvas(e.clientX - rect.left, e.clientY - rect.top, viewport)
      addCard({
        id: crypto.randomUUID(),
        type: 'note',
        x: p.x,
        y: p.y,
        w: 220,
        h: 140,
        content: { text: '' },
      })
      setActiveTool('select')
    } else {
      clearSelection()
    }
  }

  const handlePointerMove = (e) => {
    if (!panRef.current) return
    panBy(e.clientX - panRef.current.lastX, e.clientY - panRef.current.lastY)
    panRef.current = { lastX: e.clientX, lastY: e.clientY }
  }

  const handlePointerUp = (e) => {
    if (!panRef.current) return
    panRef.current = null
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  const gap = DOT_GAP * viewport.zoom

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 touch-none overflow-hidden"
      style={{
        // replace this color with the dot color you liked from your old BoardCanvas
        backgroundImage:
          'radial-gradient(circle, rgba(255,255,255,0.14) 1px, transparent 1px)',
        backgroundSize: `${gap}px ${gap}px`,
        backgroundPosition: `${viewport.offsetX}px ${viewport.offsetY}px`,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{
          transform: `translate(${viewport.offsetX}px, ${viewport.offsetY}px) scale(${viewport.zoom})`,
        }}
      >
        {cards.map((card) => (
          <CardShell key={card.id} card={card} />
        ))}
      </div>
    </div>
  )
}