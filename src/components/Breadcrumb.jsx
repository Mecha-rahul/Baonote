import { ChevronRight } from 'lucide-react'

/**
 * Breadcrumb trail. Parent segments are muted, the current board is
 * bold in text color; all segments are link-style with hover states.
 */
export default function Breadcrumb() {
  const segments = [
    { id: 'home', label: 'Home' },
    { id: 'prj1', label: 'prj1', current: true },
  ]
  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5">
      {segments.map((seg, i) => (
        <span key={seg.id} className="flex min-w-0 items-center gap-1.5">
          {i > 0 && <ChevronRight size={12} strokeWidth={2} className="shrink-0 text-text-muted" aria-hidden="true" />}
          <button
            type="button"
            aria-current={seg.current ? 'page' : undefined}
            className={`truncate text-sm leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              seg.current
                ? 'font-semibold text-text underline-offset-4 hover:underline'
                : 'text-text-muted hover:text-text'
            }`}
          >
            {seg.label}
          </button>
        </span>
      ))}
    </nav>
  )
}
