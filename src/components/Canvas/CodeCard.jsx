import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { useCanvasStore } from '../../state/useCanvasStore'

const LANGUAGES = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
  { id: 'c', label: 'C' },
  { id: 'cpp', label: 'C++' },
  { id: 'csharp', label: 'C#' },
  { id: 'go', label: 'Go' },
  { id: 'rust', label: 'Rust' },
  { id: 'html', label: 'HTML' },
  { id: 'css', label: 'CSS' },
  { id: 'json', label: 'JSON' },
  { id: 'bash', label: 'Bash' },
  { id: 'sql', label: 'SQL' },
  { id: 'text', label: 'Plain text' },
]

const stop = (e) => e.stopPropagation() // controls must not drag the card

export default function CodeCard({ card }) {
  const updateCardContent = useCanvasStore((s) => s.updateCardContent)
  const typeInCard = useCanvasStore((s) => s.typeInCard)
  const setEditingId = useCanvasStore((s) => s.setEditingId)
  const setSelection = useCanvasStore((s) => s.setSelection)

  const language = card.content.language ?? 'text'
  const code = card.content.code ?? ''

  const [copied, setCopied] = useState(false)
  const timerRef = useRef(null)
  useEffect(() => () => clearTimeout(timerRef.current), [])

  const beginEdit = () => {
    setSelection([card.id])
    setEditingId(card.id)
  }
  const endEdit = () => setEditingId(null)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setCopied(false), 1200)
    } catch {
      /* clipboard blocked by the browser: nothing to do */
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.currentTarget.blur() // Escape leaves the box (Tab is used for indenting)
      return
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      const el = e.currentTarget
      const start = el.selectionStart
      const end = el.selectionEnd
      typeInCard(card.id, { code: code.slice(0, start) + '  ' + code.slice(end) })
      // React moves the caret to the end after re-rendering, so put it back
      requestAnimationFrame(() => {
        el.selectionStart = el.selectionEnd = start + 2
      })
    }
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5">
        <select
          value={language}
          onChange={(e) => updateCardContent(card.id, { language: e.target.value })}
          onPointerDown={stop}
          className="bg-transparent text-xs opacity-70 outline-none"
        >
          {LANGUAGES.map((l) => (
            <option key={l.id} value={l.id} className="bg-canvas text-text">
              {l.label}
            </option>
          ))}
        </select>

        <button
          type="button"
          aria-label="Copy code"
          onPointerDown={stop}
          onClick={copy}
          className="flex items-center gap-1 text-xs opacity-60 hover:opacity-100"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <textarea
        data-scrollable
        value={code}
        placeholder="Paste or type code..."
        wrap="off"
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        onChange={(e) => typeInCard(card.id, { code: e.target.value })}
        onPointerDown={stop}
        onFocus={beginEdit}
        onBlur={endEdit}
        onKeyDown={handleKeyDown}
        className="min-h-0 flex-1 resize-none overflow-auto whitespace-pre bg-transparent p-3 font-mono text-xs leading-relaxed outline-none placeholder:opacity-40"
      />
    </div>
  )
}