import { createJSONStorage } from 'zustand/middleware'
import { clampZoom } from './coords'

const STORAGE_KEY = 'baonote-board'
const SAVE_DELAY = 500 // ms of quiet before we write

// A localStorage wrapper that waits until changes stop before writing,
// and writes immediately if the tab is hidden or closed.
function createDebouncedStorage(delay) {
  let timer = null
  let pending = null // { name, value } waiting to be written

  const flush = () => {
    if (!pending) return
    clearTimeout(timer)
    timer = null
    try {
      localStorage.setItem(pending.name, pending.value)
    } catch (err) {
      // storage full or blocked (private mode): the app keeps working, it just won't save
      console.warn('Baonote: could not save the board', err)
    }
    pending = null
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') flush()
    })
  }

  return {
    getItem: (name) => {
      try {
        return localStorage.getItem(name)
      } catch {
        return null
      }
    },
    setItem: (name, value) => {
      pending = { name, value }
      clearTimeout(timer)
      timer = setTimeout(flush, delay)
    },
    removeItem: (name) => {
      try {
        localStorage.removeItem(name)
      } catch {
        /* nothing to do */
      }
    },
  }
}

const isNum = (n) => Number.isFinite(n) // false for NaN, null, undefined, strings

// keeps only the parts of the saved data that have the right shape
function sanitize(persisted) {
  const out = {}

  if (persisted && Array.isArray(persisted.cards)) {
    out.cards = persisted.cards.filter(
      (c) =>
        c &&
        typeof c.id === 'string' &&
        typeof c.type === 'string' &&
        isNum(c.x) &&
        isNum(c.y) &&
        isNum(c.w) &&
        isNum(c.h) &&
        isNum(c.z) &&
        c.content &&
        typeof c.content === 'object'
    )
  }

  // arrows: both ends must be real cards that survived the filter above
  if (persisted && Array.isArray(persisted.edges)) {
    const cardIds = new Set((out.cards || []).map((c) => c.id))
    out.edges = persisted.edges.filter(
      (e) =>
        e &&
        typeof e.id === 'string' &&
        typeof e.fromId === 'string' &&
        typeof e.toId === 'string' &&
        e.fromId !== e.toId &&
        cardIds.has(e.fromId) &&
        cardIds.has(e.toId)
    )
  }

  const v = persisted && persisted.viewport
  if (v && isNum(v.zoom) && isNum(v.offsetX) && isNum(v.offsetY)) {
    out.viewport = { zoom: clampZoom(v.zoom), offsetX: v.offsetX, offsetY: v.offsetY }
  }

  return out
}

// passed to Zustand's persist() in useCanvasStore.js
export const persistOptions = {
  name: STORAGE_KEY,
  version: 1, // bump this (and add a `migrate`) if the card shape ever changes
  storage: createJSONStorage(() => createDebouncedStorage(SAVE_DELAY)),
  // save ONLY these things (not history, selection, clipboard, or editing state)
  partialize: (state) => ({
    cards: state.cards,
    edges: state.edges,
    viewport: state.viewport,
  }),
  // merge what we loaded into the store's defaults, after cleaning it
  merge: (persisted, current) => ({ ...current, ...sanitize(persisted) }),
}