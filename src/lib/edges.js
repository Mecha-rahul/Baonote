// Geometry for arrows. All numbers are canvas coordinates.

// Where a line from the card's center toward (tx, ty) crosses the card's border.
// `inside` is true when (tx, ty) is inside the card itself (nothing to draw then).
export function borderPoint(card, tx, ty) {
  const cx = card.x + card.w / 2
  const cy = card.y + card.h / 2
  const dx = tx - cx
  const dy = ty - cy
  if (dx === 0 && dy === 0) return { x: cx, y: cy, inside: true }
  const sx = dx !== 0 ? card.w / 2 / Math.abs(dx) : Infinity
  const sy = dy !== 0 ? card.h / 2 / Math.abs(dy) : Infinity
  const s = Math.min(sx, sy)
  return { x: cx + dx * s, y: cy + dy * s, inside: s >= 1 }
}

// Start and end point of an arrow between two cards, or null if they overlap.
export function edgeLine(from, to) {
  const fromCenter = { x: from.x + from.w / 2, y: from.y + from.h / 2 }
  const toCenter = { x: to.x + to.w / 2, y: to.y + to.h / 2 }
  const a = borderPoint(from, toCenter.x, toCenter.y)
  const b = borderPoint(to, fromCenter.x, fromCenter.y)
  if (a.inside || b.inside) return null
  return { a, b }
}

// The top-most card under a canvas point (or null).
export function cardAt(cards, x, y) {
  let hit = null
  for (const c of cards) {
    const inside = x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h
    if (inside && (!hit || c.z > hit.z)) hit = c
  }
  return hit
}