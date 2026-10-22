import { Sun, Moon } from 'lucide-react'
import useUiStore from '../state/useUiStore.js'

/**
 * Sliding dark/light switch. Moon sits on the left, sun on the right.
 * Clicking slides the knob: left = dark, right = light. The choice
 * persists to localStorage.
 */
export default function ThemeToggle() {
  const theme = useUiStore((s) => s.theme)
  const toggleTheme = useUiStore((s) => s.toggleTheme)
  const next = theme === 'dark' ? 'light' : 'dark'
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${next} theme`}
      onClick={toggleTheme}
      className="relative h-9 w-16 rounded-full border border-border bg-surface transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent hover:bg-surface-hover active:scale-95"
    >
      {/* sliding knob: left = dark, right = light */}
      <span
        aria-hidden="true"
        className={`absolute inset-y-1 left-1 h-7 w-7 rounded-full border border-border bg-surface-hover transition-transform duration-200 ease-out ${
          isDark ? 'translate-x-0' : 'translate-x-6'
        }`}
      />
      <span className="relative z-10 flex h-full w-full items-center justify-between px-2.5">
        <Moon
          size={14}
          strokeWidth={1.75}
          aria-hidden="true"
          className={isDark ? 'text-text' : 'text-text-muted opacity-40'}
        />
        <Sun
          size={14}
          strokeWidth={1.75}
          aria-hidden="true"
          className={isDark ? 'text-text-muted opacity-40' : 'text-text'}
        />
      </span>
    </button>
  )
}
