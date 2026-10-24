import { memo, useRef } from 'react';
import { useCanvasStore } from '../../state/useCanvasStore';
import NoteCard from './NoteCard';

function CardShell({ card }) {
  const dragRef = useRef(null);
  const selected = useCanvasStore((s) => s.selectedIds.includes(card.id));
  const selectCard = useCanvasStore((s) => s.selectCard);
  const moveCardBy = useCanvasStore((s) => s.moveCardBy);
  const setEditingId = useCanvasStore((s) => s.setEditingId);

  const handlePointerDown = (e) => {
    // middle click or Space held: don't drag the card, let the canvas pan
    if (e.button !== 0 || useCanvasStore.getState().spacePressed) return;
    e.stopPropagation(); // so the canvas doesn't treat this as "click on empty space"
    selectCard(card.id);
    dragRef.current = { lastX: e.clientX, lastY: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current) return;
    const { zoom } = useCanvasStore.getState().viewport;
    moveCardBy(
      card.id,
      (e.clientX - dragRef.current.lastX) / zoom,
      (e.clientY - dragRef.current.lastY) / zoom
    );
    dragRef.current = { lastX: e.clientX, lastY: e.clientY };
  };

  const handlePointerUp = (e) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={() => setEditingId(card.id)}
      className={`absolute rounded-lg border bg-white/5 text-sm shadow-lg backdrop-blur
        ${selected ? 'border-fuchsia-500 ring-2 ring-fuchsia-500/40' : 'border-white/10'}`}
      style={{ left: card.x, top: card.y, width: card.w, height: card.h, zIndex: card.z }}
    >
      {card.type === 'note' && <NoteCard card={card} />}
    </div>
  );
}

export default memo(CardShell);