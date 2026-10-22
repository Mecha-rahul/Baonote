import { Folder, StickyNote } from 'lucide-react'

/**
 * Mock board tree. `kind` picks the row icon: 'board' for expandable
 * containers, 'note' for leaves. `defaultOpen` only applies to boards.
 */
export const boardTree = [
  {
    id: 'projects',
    label: 'Projects',
    kind: 'board',
    defaultOpen: true,
    children: [
      {
        id: 'prj1',
        label: 'prj1',
        kind: 'board',
        active: true,
        defaultOpen: true,
        children: [
          { id: 'sub-board', label: 'sub-board', kind: 'note' },
          { id: 'api-notes', label: 'api-notes', kind: 'note' },
        ],
      },
    ],
  },
  {
    id: 'sandbox',
    label: 'Sandbox',
    kind: 'board',
    defaultOpen: true,
    children: [{ id: 'scratch', label: 'scratchpad', kind: 'note' }],
  },
  { id: 'interview-prep', label: 'Interview prep', kind: 'note' },
  {
    id: 'templates',
    label: 'Templates',
    kind: 'board',
    children: [{ id: 'starter-note', label: 'Starter note', kind: 'note' }],
  },
]

export const nodeIcons = {
  board: Folder,
  note: StickyNote,
}
