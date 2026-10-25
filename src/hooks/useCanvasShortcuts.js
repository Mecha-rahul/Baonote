
import { useEffect } from 'react'
import { useCanvasStore } from '../state/useCanvasStore'

const isTyping = () => {
  const el = document.activeElement
  return (
    !!el &&
    (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
  )
}

export default function useCanvasShortcuts() {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (isTyping()) return

      const s = useCanvasStore.getState()
      const mod = e.ctrlKey || e.metaKey
      const key = (e.key || '').toLowerCase()

      // hold Space to pan
      if (e.code === 'Space') {
        e.preventDefault()
        s.setSpacePressed(true)
        return
      }

      if (key === 'delete' || key === 'backspace') {
        e.preventDefault()
        s.deleteSelected()
        return
      }

      if (key === 'escape') {
        s.clearSelection()
        return
      }

      if (!mod) return

      switch (key) {
        case 'a':
          e.preventDefault()
          s.selectAll()
          break
        case 'd':
          e.preventDefault() // otherwise the browser bookmarks the page
          s.duplicateSelected()
          break
        case 'c':
          s.copySelected()
          break
        case 'v':
          s.paste()
          break
        case 'z':
          e.preventDefault()
          if (e.shiftKey) s.redo()
          else s.undo()
          break
        case 'y':
          e.preventDefault()
          s.redo()
          break
        case ']':
          e.preventDefault()
          s.bringToFront()
          break
        case '[':
          e.preventDefault()
          s.sendToBack()
          break
        default:
          break
      }
    }

    const onKeyUp = (e) => {
      if (e.code === 'Space') useCanvasStore.getState().setSpacePressed(false)
    }

    // if the window loses focus while Space is held, don't get stuck in pan mode
    const onBlur = () => useCanvasStore.getState().setSpacePressed(false)

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [])
}