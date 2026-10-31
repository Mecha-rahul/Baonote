// Edge style options. Old saved edges won't have these fields,
// so withEdgeDefaults() fills the gaps wherever an edge is read.
export const EDGE_DEFAULTS = {
  style: 'straight', // 'straight' | 'curved' | 'elbow'
  pattern: 'solid', // 'solid' | 'dashed' | 'dotted'
  arrow: 'end', // 'none' | 'end' | 'both'
  color: '#9ca3af', // change to match your theme
  width: 2,
}

export const EDGE_STYLES = [
  { value: 'straight', label: 'Straight' },
  { value: 'curved', label: 'Curved' },
  { value: 'elbow', label: 'Elbow' },
]

export const EDGE_PATTERNS = [
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
]

export const EDGE_ARROWS = [
  { value: 'none', label: 'None' },
  { value: 'end', label: 'End' },
  { value: 'both', label: 'Both' },
]

export const EDGE_WIDTHS = [1, 2, 4]

export const withEdgeDefaults = (edge) => ({ ...EDGE_DEFAULTS, ...edge })