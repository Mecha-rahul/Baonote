import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { persistOptions } from '../lib/persistence'
import { zoomAt } from '../lib/coords'

const MAX_HISTORY = 100 // how many undo steps we keep
const OFFSET = 24 // how far duplicates/pastes shift, in canvas units

// ---------- helpers (outside the store, pure functions) ----------

// Saves the CURRENT cards as an undo step and clears the redo stack.
// Called inside an action right before it changes the cards.
const pushHistory = (s) => ({
  past: [...s.past, s.cards].slice(-MAX_HISTORY),
  future: [],
})

// a z value above every existing card
const nextZ = (cards) => Math.max(0, ...cards.map((c) => c.z)) + 1

// copies of cards with fresh ids, shifted, stacked on top (keeps their relative order)
const cloneCards = (list, existing, offset) => {
  let z = nextZ(existing)
  return [...list]
    .sort((a, b) => a.z - b.z)
    .map((c) => ({
      ...c,
      id: crypto.randomUUID(),
      x: c.x + offset,
      y: c.y + offset,
      z: z++,
    }))
}

// moves the selected cards to the top (or bottom) of the stack and renumbers z as 1..n.
// Cards whose z didn't change keep the same object, so memo can skip them.
const reorder = (cards, selectedIds, toFront) => {
  const byZ = [...cards].sort((a, b) => a.z - b.z)
  const picked = byZ.filter((c) => selectedIds.includes(c.id))
  const rest = byZ.filter((c) => !selectedIds.includes(c.id))
  const ordered = toFront ? [...rest, ...picked] : [...picked, ...rest]
  const newZ = new Map(ordered.map((c, i) => [c.id, i + 1]))
  return cards.map((c) =>
    newZ.get(c.id) === c.z ? c : { ...c, z: newZ.get(c.id) }
  )
}

// ---------- the store ----------

export const useCanvasStore = create(
  persist(
    (set) => ({
  viewport: { zoom: 1, offsetX: 0, offsetY: 0 },
  cards: [],
  selectedIds: [],
  editingId: null,
  spacePressed: false,

  clipboard: [], // cards copied with Ctrl+C (kept inside the app)
  pasteCount: 0, // so repeated pastes cascade instead of stacking exactly
  past: [], // undo stack: older versions of `cards`
  future: [], // redo stack
  lastTextEditId: null, // so a whole typing session is ONE undo step

  // ----- view -----
  setSpacePressed: (value) => set({ spacePressed: value }),

  setEditingId: (id) => set({ editingId: id, lastTextEditId: null }),

  panBy: (dx, dy) =>
    set((s) => ({
      viewport: {
        ...s.viewport,
        offsetX: s.viewport.offsetX + dx,
        offsetY: s.viewport.offsetY + dy,
      },
    })),

  zoomAtPoint: (mouseX, mouseY, newZoom) =>
    set((s) => ({ viewport: zoomAt(s.viewport, mouseX, mouseY, newZoom) })),

  // ----- history -----
  // Call this ONCE when a drag or resize starts moving, so the whole gesture is one undo step.
  saveHistory: () => set((s) => pushHistory(s)),

  undo: () =>
    set((s) => {
      if (s.past.length === 0) return s // returning the same state = nothing happens
      const previous = s.past[s.past.length - 1]
      return {
        past: s.past.slice(0, -1),
        future: [s.cards, ...s.future],
        cards: previous,
        selectedIds: s.selectedIds.filter((id) => previous.some((c) => c.id === id)),
        editingId: null,
        lastTextEditId: null,
      }
    }),

  redo: () =>
    set((s) => {
      if (s.future.length === 0) return s
      const [next, ...rest] = s.future
      return {
        past: [...s.past, s.cards],
        future: rest,
        cards: next,
        selectedIds: s.selectedIds.filter((id) => next.some((c) => c.id === id)),
        editingId: null,
        lastTextEditId: null,
      }
    }),

  // ----- cards -----
  addCard: (card) =>
    set((s) => ({
      ...pushHistory(s),
      cards: [...s.cards, { ...card, z: nextZ(s.cards) }],
      selectedIds: [card.id],
    })),

  // moves one card (kept from before)
  moveCardBy: (id, dx, dy) =>
    set((s) => ({
      cards: s.cards.map((c) =>
        c.id === id ? { ...c, x: c.x + dx, y: c.y + dy } : c
      ),
    })),

  // moves every selected card together (used when dragging a group)
  moveSelectedBy: (dx, dy) =>
    set((s) => ({
      cards: s.cards.map((c) =>
        s.selectedIds.includes(c.id) ? { ...c, x: c.x + dx, y: c.y + dy } : c
      ),
    })),

  // changes any fields of one card, e.g. { x, y, w, h } while resizing
  updateCard: (id, patch) =>
    set((s) => ({
      cards: s.cards.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    })),

  updateCardText: (id, text) =>
    set((s) => ({
      // only the FIRST keystroke of an editing session saves an undo step
      ...(s.lastTextEditId === id ? {} : pushHistory(s)),
      lastTextEditId: id,
      cards: s.cards.map((c) =>
        c.id === id ? { ...c, content: { ...c.content, text } } : c
      ),
    })),

  deleteSelected: () =>
    set((s) => {
      if (s.selectedIds.length === 0) return s
      return {
        ...pushHistory(s),
        cards: s.cards.filter((c) => !s.selectedIds.includes(c.id)),
        selectedIds: [],
        editingId: null,
      }
    }),

  duplicateSelected: () =>
    set((s) => {
      const picked = s.cards.filter((c) => s.selectedIds.includes(c.id))
      if (picked.length === 0) return s
      const copies = cloneCards(picked, s.cards, OFFSET)
      return {
        ...pushHistory(s),
        cards: [...s.cards, ...copies],
        selectedIds: copies.map((c) => c.id),
      }
    }),

  copySelected: () =>
    set((s) => {
      const picked = s.cards.filter((c) => s.selectedIds.includes(c.id))
      if (picked.length === 0) return s
      return { clipboard: picked, pasteCount: 0 }
    }),

  paste: () =>
    set((s) => {
      if (s.clipboard.length === 0) return s
      const count = s.pasteCount + 1
      const copies = cloneCards(s.clipboard, s.cards, OFFSET * count)
      return {
        ...pushHistory(s),
        cards: [...s.cards, ...copies],
        selectedIds: copies.map((c) => c.id),
        pasteCount: count,
      }
    }),

  bringToFront: () =>
    set((s) =>
      s.selectedIds.length === 0
        ? s
        : { ...pushHistory(s), cards: reorder(s.cards, s.selectedIds, true) }
    ),

  sendToBack: () =>
    set((s) =>
      s.selectedIds.length === 0
        ? s
        : { ...pushHistory(s), cards: reorder(s.cards, s.selectedIds, false) }
    ),

  // ----- selection -----
  // click: select only this card and bring it to the front (kept from before)
  selectCard: (id) =>
    set((s) => {
      const top = nextZ(s.cards)
      return {
        selectedIds: [id],
        cards: s.cards.map((c) => (c.id === id ? { ...c, z: top } : c)),
      }
    }),

  // shift-click: add the card to the selection, or remove it if already selected
  toggleSelect: (id) =>
    set((s) => ({
      selectedIds: s.selectedIds.includes(id)
        ? s.selectedIds.filter((x) => x !== id)
        : [...s.selectedIds, id],
    })),

  // replaces the selection (used by drag-select)
  setSelection: (ids) => set({ selectedIds: ids }),

  selectAll: () => set((s) => ({ selectedIds: s.cards.map((c) => c.id) })),

  clearSelection: () => set({ selectedIds: [] }),
  }),
    persistOptions
  )
)