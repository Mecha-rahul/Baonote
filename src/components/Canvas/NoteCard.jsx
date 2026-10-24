import { useEffect, useRef } from 'react';
import { useCanvasStore } from '../../state/useCanvasStore';

export default function NoteCard({ card }) {
  const editing = useCanvasStore((s) => s.editingId === card.id);
  const setEditingId = useCanvasStore((s) => s.setEditingId);
  const updateCardText = useCanvasStore((s) => s.updateCardText);
  const textRef = useRef(null);

  useEffect(() => {
    if (editing) textRef.current?.focus();
  }, [editing]);

  if (editing) {
    return (
      <textarea
        ref={textRef}
        value={card.content.text}
        onChange={(e) => updateCardText(card.id, e.target.value)}
        onBlur={() => setEditingId(null)}
        onKeyDown={(e) => e.key === 'Escape' && e.currentTarget.blur()}
        onPointerDown={(e) => e.stopPropagation()} // typing/selecting text must not drag the card
        className="h-full w-full resize-none bg-transparent p-3 outline-none"
      />
    );
  }

  return (
    <div className="h-full w-full select-none whitespace-pre-wrap p-3">
      {card.content.text || <span className="opacity-40">Double-click to type</span>}
    </div>
  );
}