import { useEffect, useRef } from 'react'
import { Plus, X } from 'lucide-react'
import { useCanvasStore } from '../../state/useCanvasStore'

// pressing a control inside the card must not start dragging the card
const stop = (e) => e.stopPropagation()
const blurOnEscape = (e) => {
  if (e.key === 'Escape') e.currentTarget.blur()
}

export default function TodoCard({ card }) {
  const updateCardContent = useCanvasStore((s) => s.updateCardContent)
  const typeInCard = useCanvasStore((s) => s.typeInCard)
  const setEditingId = useCanvasStore((s) => s.setEditingId)
  const setSelection = useCanvasStore((s) => s.setSelection)

  // saved data is untrusted: fall back to safe values if the shape is wrong
  const items = Array.isArray(card.content.items) ? card.content.items : []
  const title = card.content.title ?? ''

  const inputRefs = useRef({}) // item id -> its <input>
  const pendingFocus = useRef(null) // item id to focus after the next render

  useEffect(() => {
    if (!pendingFocus.current) return
    inputRefs.current[pendingFocus.current]?.focus()
    pendingFocus.current = null
  }, [items])

  const beginEdit = () => {
    setSelection([card.id])
    setEditingId(card.id)
  }
  const endEdit = () => setEditingId(null) // also ends the typing session for undo

  const addItemAfter = (index) => {
    const item = { id: crypto.randomUUID(), text: '', done: false }
    pendingFocus.current = item.id
    updateCardContent(card.id, {
      items: [...items.slice(0, index + 1), item, ...items.slice(index + 1)],
    })
  }

  const removeItem = (index) => {
    const previous = items[index - 1]
    if (previous) pendingFocus.current = previous.id
    updateCardContent(card.id, { items: items.filter((_, i) => i !== index) })
  }

  const toggleItem = (id) =>
    updateCardContent(card.id, {
      items: items.map((it) => (it.id === id ? { ...it, done: !it.done } : it)),
    })

  const editItem = (id, text) =>
    typeInCard(
      card.id,
      { items: items.map((it) => (it.id === id ? { ...it, text } : it)) },
      `${card.id}:${id}` // each item's typing is its own undo session
    )

  const handleItemKeyDown = (e, item, index) => {
    if (e.key === 'Escape') {
      e.currentTarget.blur()
    } else if (e.key === 'Enter') {
      e.preventDefault()
      // Enter on an empty item finishes the list, Enter on a filled one adds the next
      if (item.text === '') e.currentTarget.blur()
      else addItemAfter(index)
    } else if (e.key === 'Backspace' && item.text === '') {
      e.preventDefault()
      removeItem(index)
    }
  }

  const doneCount = items.filter((it) => it.done).length

  return (
    <div className="flex h-full w-full flex-col p-3">
      <div className="flex items-center gap-2">
        <input
          value={title}
          placeholder="To-do list"
          onChange={(e) => typeInCard(card.id, { title: e.target.value }, `${card.id}:title`)}
          onPointerDown={stop}
          onFocus={beginEdit}
          onBlur={endEdit}
          onKeyDown={blurOnEscape}
          className="min-w-0 flex-1 bg-transparent font-medium outline-none placeholder:opacity-40"
        />
        {items.length > 0 && (
          <span className="shrink-0 text-xs opacity-50">
            {doneCount}/{items.length}
          </span>
        )}
      </div>

      <ul data-scrollable className="mt-2 min-h-0 flex-1 space-y-1 overflow-y-auto">
        {items.map((item, index) => (
          <li key={item.id} className="group flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!item.done}
              onChange={() => toggleItem(item.id)}
              onPointerDown={stop}
              // swap accent color for your token
              className="h-4 w-4 shrink-0 accent-fuchsia-500"
            />
            <input
              ref={(el) => {
                inputRefs.current[item.id] = el
              }}
              value={item.text}
              placeholder="Item"
              onChange={(e) => editItem(item.id, e.target.value)}
              onPointerDown={stop}
              onFocus={beginEdit}
              onBlur={endEdit}
              onKeyDown={(e) => handleItemKeyDown(e, item, index)}
              className={`min-w-0 flex-1 bg-transparent outline-none placeholder:opacity-30 ${
                item.done ? 'line-through opacity-50' : ''
              }`}
            />
            <button
              type="button"
              aria-label="Delete item"
              onPointerDown={stop}
              onClick={() => removeItem(index)}
              className="shrink-0 opacity-0 transition-opacity group-hover:opacity-70"
            >
              <X size={14} />
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onPointerDown={stop}
        onClick={() => addItemAfter(items.length - 1)}
        className="mt-2 flex items-center gap-1 self-start text-xs opacity-60 hover:opacity-100"
      >
        <Plus size={14} /> Add item
      </button>
    </div>
  )
}