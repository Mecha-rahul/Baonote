import Canvas from '../components/Canvas/canvas.jsx'
import TopBar from './TopBar.jsx'
import Sidebar from './Sidebar.jsx'
import BottomToolbar from './BottomToolbar.jsx'
import ZoomControl from '../components/ZoomControl.jsx'
import ExportButton from '../components/ExportButton.jsx'
import EdgeStylePanel from '../components/Canvas/EdgeStylePanel.jsx'
import { useCanvasStore } from '../state/useCanvasStore'

/**
 * Full-viewport board view. The canvas fills the screen behind
 * everything; top bar, sidebar, toolbar, zoom control and export all
 * float over it. Viewport state (zoom/pan) lives in useCanvasStore.
 */
export default function AppShell() {
  const zoom = useCanvasStore((s) => s.viewport.zoom)
  const zoomAtPoint = useCanvasStore((s) => s.zoomAtPoint)

  // buttons have no mouse position, so zoom around the screen center.
  // `next` can be a number or a function like (z) => z + 0.1
  const handleZoomChange = (next) => {
    const current = useCanvasStore.getState().viewport.zoom
    const newZoom = typeof next === 'function' ? next(current) : next
    if (!Number.isFinite(newZoom)) return
    zoomAtPoint(window.innerWidth / 2, window.innerHeight / 2, newZoom)
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-canvas text-text">
      <Canvas />

      <TopBar />
      <Sidebar />

      <BottomToolbar />
      <EdgeStylePanel />
      <div className="absolute bottom-4 left-4 z-20">
        <ZoomControl zoom={zoom} onZoomChange={handleZoomChange} />
      </div>
      <div className="absolute bottom-4 right-4 z-20">
        <ExportButton />
      </div>
    </div>
  )
}