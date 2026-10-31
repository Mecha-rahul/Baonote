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

// Where an arrow leaves / enters when it uses the MIDDLE OF A SIDE (curve and elbow shapes):
// the sides that face each other, along whichever axis the cards are further apart on.
function sideAnchors(from, to) {
  const fc = { x: from.x + from.w / 2, y: from.y + from.h / 2 }
  const tc = { x: to.x + to.w / 2, y: to.y + to.h / 2 }
  const dx = tc.x - fc.x
  const dy = tc.y - fc.y
  const horizontal = Math.abs(dx) >= Math.abs(dy)
  if (horizontal) {
    return {
      horizontal,
      p: { x: dx > 0 ? from.x + from.w : from.x, y: fc.y },
      q: { x: dx > 0 ? to.x : to.x + to.w, y: tc.y },
      // false when the cards overlap along this axis (the sides would cross)
      ok: dx > 0 ? from.x + from.w < to.x : to.x + to.w < from.x,
    }
  }
  return {
    horizontal,
    p: { x: fc.x, y: dy > 0 ? from.y + from.h : from.y },
    q: { x: tc.x, y: dy > 0 ? to.y : to.y + to.h },
    ok: dy > 0 ? from.y + from.h < to.y : to.y + to.h < from.y,
  }
}

// Straight segments with rounded corners. `r` is the corner radius.
function roundedPolyline(pts, r) {
  let d = `M ${pts[0].x} ${pts[0].y}`
  for (let i = 1; i < pts.length - 1; i++) {
    const prev = pts[i - 1]
    const c = pts[i]
    const next = pts[i + 1]
    const d1 = Math.hypot(prev.x - c.x, prev.y - c.y)
    const d2 = Math.hypot(next.x - c.x, next.y - c.y)
    if (d1 === 0 || d2 === 0) {
      d += ` L ${c.x} ${c.y}` // flat corner (cards line up exactly), nothing to round
      continue
    }
    const rr = Math.min(r, d1 / 2, d2 / 2)
    const s = { x: c.x + ((prev.x - c.x) / d1) * rr, y: c.y + ((prev.y - c.y) / d1) * rr }
    const e = { x: c.x + ((next.x - c.x) / d2) * rr, y: c.y + ((next.y - c.y) / d2) * rr }
    d += ` L ${s.x} ${s.y} Q ${c.x} ${c.y} ${e.x} ${e.y}`
  }
  const last = pts[pts.length - 1]
  return `${d} L ${last.x} ${last.y}`
}

// The SVG path (`d` string) of an arrow between two cards, or null if they overlap.
// shape: 'straight' | 'arc' | 'curve' | 'elbow'
export function edgePath(from, to, shape = 'straight') {
  const base = edgeLine(from, to)
  if (!base) return null
  const { a, b } = base
  const straight = `M ${a.x} ${a.y} L ${b.x} ${b.y}`

  if (shape === 'arc') {
    // one gentle bend: a control point pushed sideways from the middle of the line
    const bend = 0.2
    const cx = (a.x + b.x) / 2 - (b.y - a.y) * bend
    const cy = (a.y + b.y) / 2 + (b.x - a.x) * bend
    return `M ${a.x} ${a.y} Q ${cx} ${cy} ${b.x} ${b.y}`
  }

  if (shape === 'curve' || shape === 'elbow') {
    const { horizontal, p, q, ok } = sideAnchors(from, to)
    if (!ok) return straight // cards too close for a nice curve: fall back to a straight line

    if (shape === 'curve') {
      return horizontal
        ? `M ${p.x} ${p.y} C ${(p.x + q.x) / 2} ${p.y} ${(p.x + q.x) / 2} ${q.y} ${q.x} ${q.y}`
        : `M ${p.x} ${p.y} C ${p.x} ${(p.y + q.y) / 2} ${q.x} ${(p.y + q.y) / 2} ${q.x} ${q.y}`
    }

    // elbow: out, across the middle, in
    const pts = horizontal
      ? [p, { x: (p.x + q.x) / 2, y: p.y }, { x: (p.x + q.x) / 2, y: q.y }, q]
      : [p, { x: p.x, y: (p.y + q.y) / 2 }, { x: q.x, y: (p.y + q.y) / 2 }, q]
    return roundedPolyline(pts, 12)
  }

  return straight
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