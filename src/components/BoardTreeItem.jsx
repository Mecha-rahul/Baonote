import { Fragment, useState } from 'react'
import { ChevronRight, StickyNote } from 'lucide-react'
import { nodeIcons } from '../data/boardTree.js'

/**
 * One row of the board tree: icon + label + chevron for expandable
 * boards, with hover, active (accent-soft + accent), and keyboard focus
 * states. Children indent below and collapse with expand state.
 */
export default function BoardTreeItem({ node, depth = 0 }) {
  const [open, setOpen] = useState(Boolean(node.defaultOpen))
  const Icon = nodeIcons[node.kind] || StickyNote
  const hasChildren = Boolean(node.children?.length)

  const isActive = Boolean(node.active)
  return (
    <li>
      <button
        type="button"
        aria-current={isActive ? 'true' : undefined}
        aria-expanded={hasChildren ? open : undefined}
        onClick={() => hasChildren && setOpen((v) => !v)}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        className={`flex h-8 w-full items-center gap-2 rounded-lg pr-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent ${
          isActive
            ? 'bg-accent-soft font-medium text-accent hover:bg-accent-soft'
            : 'text-text-muted hover:bg-surface-hover hover:text-text'
        }`}
      >
        <Icon
          size={14}
          strokeWidth={1.75}
          aria-hidden="true"
          className={`shrink-0 ${isActive ? 'text-accent' : 'text-text-muted'}`}
        />
        <span className="truncate">{node.label}</span>
        {hasChildren && (
          <ChevronRight
            size={12}
            strokeWidth={2}
            aria-hidden="true"
            className={`ml-auto shrink-0 text-text-muted transition-transform duration-150 ${
              open ? 'rotate-90' : ''
            }`}
          />
        )}
      </button>
      {hasChildren && open && (
        <ul className="mt-0.5 space-y-0.5">
          {node.children.map((child) => (
            <BoardTreeItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  )
}
