// Pure functions that turn two cards into an SVG path.
// Everything here is in CANVAS coordinates (same space as card x, y, w, h).

const center = (c) => ({ x: c.x + c.w / 2, y: c.y + c.h / 2 })

// unit direction pointing OUT of a card side
const DIR = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  top: { x: 0, y: -1 },
  bottom: { x: 0, y: 1 },
}

const isHorizontal = (side) => side === 'left' || side === 'right'

// middle of one side of a card
export const getAnchor = (card, side) => {
  switch (side) {
    case 'left':
      return { x: card.x, y: card.y + card.h / 2 }
    case 'right':
      return { x: card.x + card.w, y: card.y + card.h / 2 }
    case 'top':
      return { x: card.x + card.w / 2, y: card.y }
    default:
      return { x: card.x + card.w / 2, y: card.y + card.h }
  }
}

// which sides should the arrow leave from / arrive at?
// Whichever axis the two cards are further apart on wins.
export const getBestSides = (from, to) => {
  const a = center(from)
  const b = center(to)
  const dx = b.x - a.x
  const dy = b.y - a.y
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? ['right', 'left'] : ['left', 'right']
  }
  return dy >= 0 ? ['bottom', 'top'] : ['top', 'bottom']
}

// start/end are points {x, y}; startSide/endSide say which way the line leaves/enters.
// Returns { d, mid } where d is the SVG path string and mid is the middle of the line
// (handy for labels and the style picker).
export const getEdgePath = (start, end, style, startSide, endSide) => {
  const { x: x1, y: y1 } = start
  const { x: x2, y: y2 } = end

  if (style === 'curved') {
    // pull the curve out of each side; the 40 minimum stops it going flat when cards are close
    const pull = Math.max(40, Math.hypot(x2 - x1, y2 - y1) / 2.5)
    const d1 = DIR[startSide]
    const d2 = DIR[endSide]
    const c1 = { x: x1 + d1.x * pull, y: y1 + d1.y * pull }
    const c2 = { x: x2 + d2.x * pull, y: y2 + d2.y * pull }
    return {
      d: `M ${x1} ${y1} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${x2} ${y2}`,
      // point at t = 0.5 on a cubic Bezier
      mid: {
        x: (x1 + 3 * c1.x + 3 * c2.x + x2) / 8,
        y: (y1 + 3 * c1.y + 3 * c2.y + y2) / 8,
      },
    }
  }

  if (style === 'elbow') {
    const bothH = isHorizontal(startSide) && isHorizontal(endSide)
    const bothV = !isHorizontal(startSide) && !isHorizontal(endSide)
    if (bothH) {
      const midX = (x1 + x2) / 2
      return {
        d: `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`,
        mid: { x: midX, y: (y1 + y2) / 2 },
      }
    }
    if (bothV) {
      const midY = (y1 + y2) / 2
      return {
        d: `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`,
        mid: { x: (x1 + x2) / 2, y: midY },
      }
    }
    // mixed axes (can happen while dragging a preview): one bend
    const corner = isHorizontal(startSide) ? { x: x2, y: y1 } : { x: x1, y: y2 }
    return {
      d: `M ${x1} ${y1} L ${corner.x} ${corner.y} L ${x2} ${y2}`,
      mid: corner,
    }
  }

  // straight (default)
  return {
    d: `M ${x1} ${y1} L ${x2} ${y2}`,
    mid: { x: (x1 + x2) / 2, y: (y1 + y2) / 2 },
  }
}

// convenience: everything you need to draw one edge between two cards
export const getEdgeGeometry = (fromCard, toCard, style) => {
  const [startSide, endSide] = getBestSides(fromCard, toCard)
  const start = getAnchor(fromCard, startSide)
  const end = getAnchor(toCard, endSide)
  return { ...getEdgePath(start, end, style, startSide, endSide), start, end }
}