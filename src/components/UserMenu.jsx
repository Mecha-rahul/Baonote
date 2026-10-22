import { useEffect, useRef, useState } from 'react'
import { EllipsisVertical, Settings, LogOut } from 'lucide-react'

const MENU_ITEMS = [
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'logout', label: 'Log out', icon: LogOut },
]

/**
 * "More" menu button (three dots, not a hamburger) with a small
 * placeholder dropdown: Profile, Settings, Log out. Closes on outside
 * click and Escape. Items are placeholders only.
 */
export default function UserMenu() {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onPointerDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="More options"
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition-[background-color,color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent hover:bg-surface-hover hover:text-text active:scale-95"
      >
        <EllipsisVertical size={18} strokeWidth={1.75} aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-10 z-50 w-44 rounded-lg border border-border bg-surface p-1 shadow-pop"
        >
          {MENU_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm text-text-muted transition-colors hover:bg-surface-hover hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Icon size={14} strokeWidth={1.75} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
