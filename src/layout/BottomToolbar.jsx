import { useEffect } from 'react'
import useUiStore from '../state/useUiStore.js'
import { TOOLS, isTextInputTarget } from '../data/tools.js'
import ToolButton from '../components/ToolButton.jsx'
import Divider from '../components/Divider.jsx'

/**
 * Floating, centered pill toolbar with the board tools laid out
 * horizontally: Select, Note, Link, To-do, Line, Board, Add image,
 * Upload, Draw | Trash | Search. Icon tools (not text tabs) with even
 * spacing and dividers between groups. Keyboard shortcuts (V/N/T/L/I/B/D)
 * switch the active tool when no text input is focused.
 */
export default function BottomToolbar() {
  const activeTool = useUiStore((s) => s.activeTool)
  const setActiveTool = useUiStore((s) => s.setActiveTool)

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      if (isTextInputTarget(e.target)) return
      const tool = TOOLS.find((t) => t.key && t.key.toLowerCase() === e.key.toLowerCase())
      if (tool) setActiveTool(tool.id)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [setActiveTool])

  return (
    <div className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2">
      <div
        role="toolbar"
        aria-label="Board tools"
        aria-orientation="horizontal"
        className="flex items-center gap-1 rounded-full border border-border bg-surface px-1.5 py-1.5 shadow-panel"
      >
        {TOOLS.map((tool, i) =>
          tool.divider ? (
            <Divider key={`${tool.id}-${i}`} />
          ) : (
            <ToolButton
              key={tool.id}
              tool={tool}
              active={activeTool === tool.id}
              onClick={() => setActiveTool(tool.id)}
            />
          ),
        )}
      </div>
    </div>
  )
}
