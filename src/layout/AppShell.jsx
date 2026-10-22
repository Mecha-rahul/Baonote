import { useState } from 'react'
import BoardCanvas from '../components/BoardCanvas.jsx'
import TopBar from './TopBar.jsx'
import Sidebar from './Sidebar.jsx'
import BottomToolbar from './BottomToolbar.jsx'
import ZoomControl from '../components/ZoomControl.jsx'
import ExportButton from '../components/ExportButton.jsx'

/**
 * Full-viewport board view. The canvas fills the screen behind
 * everything; top bar, sidebar, toolbar, zoom control and export all
 * float over it. Zoom/pan offsets live here as placeholder state.
 */
export default function AppShell() {
  const [zoom, setZoom] = useState(1)
  const [offset] = useState({ x: 0, y: 0 })

  return (
    <div className="relative h-screen w-full overflow-hidden bg-canvas text-text">
      <BoardCanvas zoom={zoom} offsetX={offset.x} offsetY={offset.y} />

      <TopBar />
      <Sidebar />

      <BottomToolbar />
      <div className="absolute bottom-4 left-4 z-20">
        <ZoomControl zoom={zoom} onZoomChange={setZoom} />
      </div>
      <div className="absolute bottom-4 right-4 z-20">
        <ExportButton />
      </div>
    </div>
  )
}
