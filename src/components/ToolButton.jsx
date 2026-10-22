import Tooltip from './Tooltip.jsx'

/**
 * One toolbar tool button: 36x36 icon with name + mono shortcut hint
 * in the tooltip. Active tool uses accent-soft background with accent
 * icon color (no blue anywhere).
 */
export default function ToolButton({ tool, active, onClick }) {
  const Icon = tool.icon
  return (
    <Tooltip label={tool.label} hint={tool.key}>
      <button
        type="button"
        onClick={onClick}
        aria-label={tool.label}
        aria-pressed={active}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-[background-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent active:scale-95 ${
          active
            ? 'bg-accent-soft text-accent hover:bg-accent-soft'
            : 'text-text-muted hover:bg-surface-hover hover:text-text'
        }`}
      >
        <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
      </button>
    </Tooltip>
  )
}
