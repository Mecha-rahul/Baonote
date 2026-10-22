import { create } from 'zustand'

function getInitialTheme() {
  try {
    return localStorage.getItem('theme') === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

/**
 * Shared UI state: theme (persisted to localStorage, dark is default),
 * sidebar visibility, and the active board tool.
 */
const useUiStore = create((set) => ({
  theme: getInitialTheme(),
  sidebarOpen: typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
  activeTool: 'select',

  toggleTheme: () =>
    set((state) => {
      const theme = state.theme === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem('theme', theme)
      } catch {
        /* persistence unavailable — session-only theme */
      }
      return { theme }
    }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  setActiveTool: (toolId) => set({ activeTool: toolId }),
}))

export default useUiStore
