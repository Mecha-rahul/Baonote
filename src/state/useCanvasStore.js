import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { persistOptions } from '../lib/persistence'
import { zoomAt } from '../lib/coords'
import { DEFAULT_EDGE_STYLE, resolveEdgeStyle } from '../lib/edgeStyle'

const MAX_HISTORY = 100 // how many undo steps we keep
const OFFSET = 24 // how far duplicates/pastes shift, in canvas units

// ---------- helpers (outside the store, pure functions) ----------

// the part of the state that undo/redo restores
const snapshot = (s) => ({ cards: s.cards, edges: s.edges })

// Saves the CURRENT cards + edges as an undo step and clears the redo stack.
// Called inside an action right before it changes them.
const pushHistory = (s) => ({
  past: [...s.past, snapshot(s)].slice(-MAX_HISTORY),
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
  edges: [], // arrows: { id, fromId, toId, style } (style: see lib/edgeStyle.js)
  selectedIds: [],
  selectedEdgeId: null, // one selected arrow (or null)
  connecting: null, // while dragging a new arrow: { fromId, x, y } (x, y = canvas coords)
  editingId: null,
  spacePressed: false,

  clipboard: [], // cards copied with Ctrl+C (kept inside the app)
  pasteCount: 0, // so repeated pastes cascade instead of stacking exactly
  past: [], // undo stack: older { cards, edges } snapshots
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
        future: [snapshot(s), ...s.future],
        cards: previous.cards,
        edges: previous.edges,
        selectedIds: s.selectedIds.filter((id) => previous.cards.some((c) => c.id === id)),
        selectedEdgeId: null,
        connecting: null,
        editingId: null,
        lastTextEditId: null,
      }
    }),

  redo: () =>
    set((s) => {
      if (s.future.length === 0) return s
      const [next, ...rest] = s.future
      return {
        past: [...s.past, snapshot(s)],
        future: rest,
        cards: next.cards,
        edges: next.edges,
        selectedIds: s.selectedIds.filter((id) => next.cards.some((c) => c.id === id)),
        selectedEdgeId: null,
        connecting: null,
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
      selectedEdgeId: null,
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

  // change part of a card's content as ONE undo step
  // (add/remove/toggle a todo item, change code language, ...)
  updateCardContent: (id, patch) =>
    set((s) => ({
      ...pushHistory(s),
      lastTextEditId: null, // so the next typing starts a fresh undo step
      cards: s.cards.map((c) =>
        c.id === id ? { ...c, content: { ...c.content, ...patch } } : c
      ),
    })),

  // typing into a card's content. The first keystroke of a "session"
  // saves an undo step; later keystrokes with the same sessionKey don't.
  typeInCard: (id, patch, sessionKey) =>
    set((s) => ({
      ...(s.lastTextEditId === sessionKey ? {} : pushHistory(s)),
      lastTextEditId: sessionKey,
      cards: s.cards.map((c) =>
        c.id === id ? { ...c, content: { ...c.content, ...patch } } : c
      ),
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

  // deletes the selected cards (and every arrow attached to them) and/or the selected arrow
  deleteSelected: () =>
    set((s) => {
      if (s.selectedIds.length === 0 && !s.selectedEdgeId) return s
      return {
        ...pushHistory(s),
        cards: s.cards.filter((c) => !s.selectedIds.includes(c.id)),
        edges: s.edges.filter(
          (e) =>
            e.id !== s.selectedEdgeId &&
            !s.selectedIds.includes(e.fromId) &&
            !s.selectedIds.includes(e.toId)
        ),
        selectedIds: [],
        selectedEdgeId: null,
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
        selectedEdgeId: null,
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
        selectedEdgeId: null,
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

  // ----- arrows -----
  // pressed on a card with the Line tool: remember where the arrow starts
  startConnect: (fromId, x, y) => set({ connecting: { fromId, x, y } }),

  // pointer moved: update the free end of the preview arrow
  moveConnect: (x, y) =>
    set((s) => (s.connecting ? { connecting: { ...s.connecting, x, y } } : s)),

  // pointer released: connect to `toId` (a card id) or give up (null)
  endConnect: (toId) =>
    set((s) => {
      const c = s.connecting
      if (!c) return s
      const done = { connecting: null }
      const bothExist =
        s.cards.some((card) => card.id === c.fromId) &&
        s.cards.some((card) => card.id === toId)
      if (!toId || toId === c.fromId || !bothExist) return done
      // one arrow per pair of cards (either direction)
      const exists = s.edges.some(
        (e) =>
          (e.fromId === c.fromId && e.toId === toId) ||
          (e.fromId === toId && e.toId === c.fromId)
      )
      if (exists) return done
      const edge = {
        id: crypto.randomUUID(),
        fromId: c.fromId,
        toId,
        style: { ...DEFAULT_EDGE_STYLE },
      }
      return {
        ...done,
        ...pushHistory(s),
        edges: [...s.edges, edge],
        selectedEdgeId: edge.id,
        selectedIds: [],
      }
    }),

  cancelConnect: () => set({ connecting: null }),

  selectEdge: (id) => set({ selectedEdgeId: id, selectedIds: [], editingId: null }),

  // change an arrow's look, e.g. { color: 'red' } or { dash: 'dashed' }. One undo step.
  updateEdgeStyle: (id, patch) =>
    set((s) => {
      const edge = s.edges.find((e) => e.id === id)
      if (!edge) return s
      const current = resolveEdgeStyle(edge)
      // clicking the option that is already active: nothing to do, no undo step
      if (Object.keys(patch).every((k) => current[k] === patch[k])) return s
      return {
        ...pushHistory(s),
        edges: s.edges.map((e) =>
          e.id === id ? { ...e, style: { ...current, ...patch } } : e
        ),
      }
    }),

  // ----- selection -----
  // click: select only this card and bring it to the front (kept from before)
  selectCard: (id) =>
    set((s) => {
      const top = nextZ(s.cards)
      return {
        selectedIds: [id],
        selectedEdgeId: null,
        cards: s.cards.map((c) => (c.id === id ? { ...c, z: top } : c)),
      }
    }),

  // shift-click: add the card to the selection, or remove it if already selected
  toggleSelect: (id) =>
    set((s) => ({
      selectedEdgeId: null,
      selectedIds: s.selectedIds.includes(id)
        ? s.selectedIds.filter((x) => x !== id)
        : [...s.selectedIds, id],
    })),

  // replaces the selection (used by drag-select)
  setSelection: (ids) => set({ selectedIds: ids, selectedEdgeId: null }),

  selectAll: () =>
    set((s) => ({ selectedIds: s.cards.map((c) => c.id), selectedEdgeId: null })),

  clearSelection: () => set({ selectedIds: [], selectedEdgeId: null }),
  }),
    persistOptions
  )
)