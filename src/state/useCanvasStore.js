import {create} from "zustand"
import { zoomAt } from "../lib/coords"

export const useCanvasStore = create((set) => ({
  viewport: { zoom: 1, offsetX: 0, offsetY: 0 },
  cards: [],
  selectedIds: [],
  editingId: null,
  spacePressed: false,

  setSpacePressed: (value) => set({ spacePressed: value }),
  setEditingId: (id) => set({ editingId: id }),

  panBy : (dx,dy) => set((s) => ({
    viewport : {
    ...s.viewport,
    offsetX : s.viewport.offsetX + dx , 
    offsetY : s.viewport.offsetY + dy ,
    }
  })),

  zoomAtPoint : ( MouseX , MouseY , newZoom) => set((s) => ({
     viewport: zoomAt(s.viewport, MouseX, MouseY, newZoom)
  })),

  addCard: (card) =>
  set((s) => ({
    cards: [...s.cards, { ...card, z: s.cards.length + 1 }],
    selectedIds: [card.id],
  })),

  moveCardBy: (id, dx, dy) =>
  set((s) => ({
    cards: s.cards.map((c) =>
      c.id === id ? { ...c, x: c.x + dx, y: c.y + dy } : c
    ),
  })),

  updateCardText: (id, text) =>
  set((s) => ({
    cards: s.cards.map((c) =>
      c.id === id ? { ...c, content: { ...c.content, text } } : c
    ),
  })),
  selectCard: (id) =>
  set((s) => {
    const top = Math.max(0, ...s.cards.map((c) => c.z)) + 1;
    return {
      selectedIds: [id],
      cards: s.cards.map((c) => (c.id === id ? { ...c, z: top } : c)),
    };
  }),
  clearSelection: () => set({ selectedIds: [] }),

  deleteSelected: () =>
    set((s) => ({
      cards: s.cards.filter((c) => !s.selectedIds.includes(c.id)),
      selectedIds: [],
    })),

}))