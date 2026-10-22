import { Minus, Plus } from 'lucide-react'

const MIN_ZOOM = 0.1
const MAX_ZOOM = 4
const STEP = 0.1

const clamp = (value) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value))
const snap = (value) => Math.round(value * 100) / 100

/**
 * Bottom-left zoom control: minus button, mono percentage, plus button.
 * Clicking the percentage resets to 100%. Zoom is clamped to
 * 10%–400% and steps by 10%. State is owned by the parent for now.
 */
export default function ZoomControl({ zoom, onZoomChange }) {
  const percent = Math.round(zoom * 100)
  const setPercent = (next) => onZoomChange(snap(clamp(next / 100)))

  return (
    <div
      className="flex items-center gap-0.5 rounded-lg border border-border bg-surface p-1 shadow-panel"
      role="group"
      aria-label="Zoom"
    >
      <button
        type="button"
        onClick={() => setPercent(Math.max(MIN_ZOOM * 100, percent - STEP * 100))}
        aria-label="Zoom out 10%"
        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-text-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent hover:bg-surface-hover hover:text-text active:scale-95 disabled:pointer-events-none disabled:opacity-40"
        disabled={percent <= 10}
      >
        <Minus size={14} strokeWidth={1.75} aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={() => setPercent(100)}
        aria-label="Reset zoom to 100%"
        className="min-w-[3.25rem] rounded-lg px-1 py-1 text-center font-mono text-xs text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent hover:bg-surface-hover active:scale-95"
      >
        {percent}%
      </button>

      <button
        type="button"
        onClick={() => setPercent(Math.min(MAX_ZOOM * 100, percent + STEP * 100))}
        aria-label="Zoom in 10%"
        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-text-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent hover:bg-surface-hover hover:text-text active:scale-95 disabled:pointer-events-none disabled:opacity-40"
        disabled={percent >= 400}
      >
        <Plus size={14} strokeWidth={1.75} aria-hidden="true" />
      </button>
    </div>
  )
}
