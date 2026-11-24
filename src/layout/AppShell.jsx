import { useEffect } from 'react'
import Canvas from '../components/Canvas/canvas.jsx'
import TopBar from './TopBar.jsx'
import Sidebar from './Sidebar.jsx'
import BottomToolbar from './BottomToolbar.jsx'
import ZoomControl from '../components/ZoomControl.jsx'
import ExportButton from '../components/ExportButton.jsx'
import EdgeStylePanel from '../components/Canvas/EdgeStylePanel.jsx'
import { useCanvasStore } from '../state/useCanvasStore'
import useUiStore from '../state/useUiStore.js'

/**
 * Full-viewport board view. The canvas fills the screen behind
 * everything; top bar, sidebar, toolbar, zoom control and export all
 * float over it. Viewport state (zoom/pan) lives in useCanvasStore.
 */
export default function AppShell() {
  const zoom = useCanvasStore((s) => s.viewport.zoom)
  const zoomAtPoint = useCanvasStore((s) => s.zoomAtPoint)
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen)

  // sidebar: open on desktop, closed on phones/tablets. Re-evaluate when the
  // window crosses the lg breakpoint (rotate a tablet, resize a window).
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const onChange = (e) => setSidebarOpen(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [setSidebarOpen])

  // buttons have no mouse position, so zoom around the screen center.
  // `next` can be a number or a function like (z) => z + 0.1
  const handleZoomChange = (next) => {
    const current = useCanvasStore.getState().viewport.zoom
    const newZoom = typeof next === 'function' ? next(current) : next
    if (!Number.isFinite(newZoom)) return
    zoomAtPoint(window.innerWidth / 2, window.innerHeight / 2, newZoom)
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-canvas text-text">
      <Canvas />

      <TopBar />
      <Sidebar />

      <BottomToolbar />
      <EdgeStylePanel />
      <div className="absolute bottom-[calc(5.25rem+env(safe-area-inset-bottom))] left-3 z-20 lg:bottom-4 lg:left-4">
        <ZoomControl zoom={zoom} onZoomChange={handleZoomChange} />
      </div>
      <div className="absolute bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-3 z-20 lg:bottom-4 lg:right-4">
        <ExportButton />
      </div>
    </div>
  )
}