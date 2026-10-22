import Tooltip from './Tooltip.jsx'

/**
 * 36x36 icon button with 8px radius, consistent icon sizing and stroke,
 * hover/focus-visible/active/disabled states, tooltip, and aria-label.
 *
 * Variants:
 *  - ghost: transparent until hover (for use inside surface containers)
 *  - solid: surface background + 1px border (for floating over the canvas)
 */
export default function IconBtn({
  label,
  hint = '',
  icon: Icon,
  onClick,
  side = 'top',
  variant = 'ghost',
  disabled = false,
  className = '',
  ...rest
}) {
  const variants = {
    ghost: 'border-transparent text-text-muted hover:bg-surface-hover hover:text-text',
    solid: 'border-border bg-surface text-text-muted hover:bg-surface-hover hover:text-text',
  }
  return (
    <Tooltip label={label} hint={hint} side={side}>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-[background-color,border-color,color,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-40 active:scale-95 ${variants[variant]} ${className}`}
        {...rest}
      >
        <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
      </button>
    </Tooltip>
  )
}
