import useUiStore from '../state/useUiStore.js'
import BoardTree from '../components/BoardTree.jsx'

/**
 * Floating board tree: 240px wide, only as tall as its content (with a
 * max height and internal scroll). Collapses with a smooth slide
 * animation driven by the sidebar toggle. Dark surface, 1px border,
 * 8px radius, subtle shadow.
 */
export default function Sidebar() {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen)
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen)

  return (
    <>
    {/* phones/tablets: the sidebar overlaps the canvas, so tapping outside closes it */}
    {sidebarOpen && (
      <div
        aria-hidden="true"
        onClick={() => setSidebarOpen(false)}
        className="fixed inset-0 z-10 bg-black/40 lg:hidden"
      />
    )}
    <aside
      aria-label="Boards"
      aria-hidden={!sidebarOpen}
      className={`absolute left-3 top-[calc(60px+env(safe-area-inset-top))] z-20 w-60 max-w-[calc(100vw-1.5rem)] overflow-y-auto rounded-lg border border-border bg-surface shadow-panel transition-[opacity,transform] duration-200 ease-out ${
        sidebarOpen
          ? 'translate-x-0 opacity-100'
          : 'pointer-events-none -translate-x-4 opacity-0'
      } max-h-[calc(100dvh-120px)] p-1.5`}
    >
      <BoardTree />
    </aside>
    </>
  )
}
