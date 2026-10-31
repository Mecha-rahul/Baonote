// Style options for arrows (edges).
//
// An edge is stored like this:
//   { id, fromId, toId, style: { shape, color, width, dash, startArrow, endArrow } }
//
// Old saved edges have no `style`, so ALWAYS read it through resolveEdgeStyle(edge):
// it fills anything missing with the defaults and ignores invalid values.
// To add a new option later (e.g. `label`): add a default below,
// add a check in sanitizeEdgeStyle, then use it in EdgesLayer. No migration needed.

// colors are stored by NAME, not hex, so the theme can decide the shade later
export const EDGE_COLORS = {
  default: '#9ca3af',
  red: '#ef4444',
  yellow: '#eab308',
  blue: '#3b82f6',
}

// straight line | arc (one gentle bend) | curve (S-shape) | elbow (right angles, rounded corners)
export const EDGE_SHAPES = ['straight', 'arc', 'curve', 'elbow']

export const EDGE_WIDTHS = [2, 4]
export const EDGE_DASHES = ['solid', 'dashed', 'dotted']
export const EDGE_ARROWS = ['none', 'arrow']

export const DEFAULT_EDGE_STYLE = {
  shape: 'straight',
  color: 'default',
  width: 2,
  dash: 'solid',
  startArrow: 'none',
  endArrow: 'arrow',
}

// keeps only the valid fields of a style object (anything else is dropped)
export function sanitizeEdgeStyle(style) {
  const out = {}
  if (!style || typeof style !== 'object') return out
  if (EDGE_SHAPES.includes(style.shape)) out.shape = style.shape
  if (Object.hasOwn(EDGE_COLORS, style.color)) out.color = style.color
  if (Number.isFinite(style.width) && style.width >= 1 && style.width <= 12) {
    out.width = style.width
  }
  if (EDGE_DASHES.includes(style.dash)) out.dash = style.dash
  if (EDGE_ARROWS.includes(style.startArrow)) out.startArrow = style.startArrow
  if (EDGE_ARROWS.includes(style.endArrow)) out.endArrow = style.endArrow
  return out
}

// the full style of an edge: defaults + whatever valid values it has saved
export function resolveEdgeStyle(edge) {
  return { ...DEFAULT_EDGE_STYLE, ...sanitizeEdgeStyle(edge && edge.style) }
}

// SVG props that draw the solid / dashed / dotted look for a given width
export function dashProps(dash, width) {
  if (dash === 'dashed') {
    return { strokeDasharray: `${width * 4} ${width * 3}`, strokeLinecap: 'butt' }
  }
  if (dash === 'dotted') {
    // zero-length dashes with round caps become dots
    return { strokeDasharray: `0.1 ${width * 2.5}`, strokeLinecap: 'round' }
  }
  return { strokeLinecap: 'butt' }
}