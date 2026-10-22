import { UserRound } from 'lucide-react'
import Tooltip from './Tooltip.jsx'

/** Circular avatar placeholder with a neutral surface and border. */
export default function UserAvatar() {
  return (
    <Tooltip label="Account">
      <button
        type="button"
        aria-label="Account"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-text-muted transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent hover:bg-surface-hover hover:text-text active:scale-95"
      >
        <UserRound size={16} strokeWidth={1.75} aria-hidden="true" />
      </button>
    </Tooltip>
  )
}
