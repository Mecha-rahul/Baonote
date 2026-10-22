/**
 * CSS-only tooltip. Shows on hover and keyboard focus, positioned above
 * (side="top") or below (side="bottom") the wrapped element. `hint`
 * renders as a small mono kbd badge, e.g. the keyboard shortcut.
 */
export default function Tooltip({ label, hint = '', side = 'top', children }) {
  const position =
    side === 'top'
      ? 'bottom-full left-1/2 mb-2 -translate-x-1/2'
      : 'top-full left-1/2 mt-2 -translate-x-1/2'
  return (
    <span className="group/tip relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute ${position} z-50 flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-border bg-surface px-2 py-1 text-xs text-text opacity-0 shadow-pop transition-opacity duration-100 group-hover/tip:opacity-100 group-focus-within/tip:opacity-100`}
      >
        {label}
        {hint ? (
          <kbd className="rounded border border-border bg-canvas px-1 py-px font-mono text-[10px] uppercase text-text-muted">
            {hint}
          </kbd>
        ) : null}
      </span>
    </span>
  )
}
