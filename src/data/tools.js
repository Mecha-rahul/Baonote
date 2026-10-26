import {
  MousePointer2,
  StickyNote,
  Link2,
  ListTodo,
  Code,
  ArrowUpRight,
  LayoutGrid,
  ImagePlus,
  Upload,
  Pencil,
  Trash2,
  Search,
} from 'lucide-react'

/** Bottom toolbar tools (horizontal, in display order). `key` = shortcut. */
export const TOOLS = [
  { id: 'select', label: 'Select', key: 'V', icon: MousePointer2 },
  { id: 'note', label: 'Note', key: 'N', icon: StickyNote },
  { id: 'link', label: 'Link', key: 'L', icon: Link2 },
  { id: 'todo', label: 'To-do', key: 'T', icon: ListTodo },
  { id: 'code', label: 'Code', key: 'C', icon: Code },
  { id: 'line', label: 'Line', key: 'A', icon: ArrowUpRight },
  { id: 'board', label: 'Board', key: 'B', icon: LayoutGrid },
  { id: 'add-image', label: 'Add image', key: 'I', icon: ImagePlus },
  { id: 'upload', label: 'Upload', key: 'U', icon: Upload },
  { id: 'draw', label: 'Draw', key: 'D', icon: Pencil },
  { id: 'divider', divider: true },
  { id: 'trash', label: 'Trash', key: 'X', icon: Trash2 },
  { id: 'divider2', divider: true },
  { id: 'search', label: 'Search', key: 'S', icon: Search },
]

export function isTextInputTarget(target) {
  if (!target || typeof target.tagName !== 'string') return false
  const tag = target.tagName.toLowerCase()
  return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable
}