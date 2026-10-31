import { useCanvasStore } from '../../state/useCanvasStore'
import { borderPoint, edgePath } from '../../lib/edges'
import { EDGE_COLORS, resolveEdgeStyle, dashProps } from '../../lib/edgeStyle'

// placeholder color, swap for a design token later
const ACCENT = '#d946ef'

// one arrow head per color. orient="auto-start-reverse" makes the SAME
// marker point outward at BOTH ends of a line (markerStart and markerEnd).
function Marker({ id, color }) {
  return (
    <marker
      id={id}
      viewBox="0 0 10 10"
      refX="9"
      refY="5"
      markerWidth="6"
      markerHeight="6"
      orient="auto-start-reverse"
    >
      <path d="M0 0 L10 5 L0 10 z" fill={color} />
    </marker>
  )
}

export default function EdgesLayer() {
  const cards = useCanvasStore((s) => s.cards)
  const edges = useCanvasStore((s) => s.edges)
  const selectedEdgeId = useCanvasStore((s) => s.selectedEdgeId)
  const connecting = useCanvasStore((s) => s.connecting)
  const selectEdge = useCanvasStore((s) => s.selectEdge)

  const byId = new Map(cards.map((c) => [c.id, c]))

  // only define arrow heads for the colors that are actually in use
  const usedColors = new Set(edges.map((e) => resolveEdgeStyle(e).color))

  // the dashed preview while you drag from a card
  let preview = null
  if (connecting) {
    const from = byId.get(connecting.fromId)
    if (from) {
      const a = borderPoint(from, connecting.x, connecting.y)
      if (!a.inside) preview = { a, b: { x: connecting.x, y: connecting.y } }
    }
  }

  return (
    // sits inside the world layer, so it pans and zooms with the cards
    <svg
      className="absolute left-0 top-0 overflow-visible"
      width="1"
      height="1"
      style={{ pointerEvents: 'none' }}
    >
      <defs>
        {[...usedColors].map((name) => (
          <Marker key={name} id={`baonote-arrow-${name}`} color={EDGE_COLORS[name]} />
        ))}
        <Marker id="baonote-arrow-preview" color={ACCENT} />
      </defs>

      {edges.map((edge) => {
        const from = byId.get(edge.fromId)
        const to = byId.get(edge.toId)
        if (!from || !to) return null
        const style = resolveEdgeStyle(edge)
        const d = edgePath(from, to, style.shape)
        if (!d) return null

        const selected = edge.id === selectedEdgeId
        const marker = `url(#baonote-arrow-${style.color})`

        return (
          <g key={edge.id}>
            {/* selection glow: a wider soft line UNDER the arrow (the arrow keeps its own color) */}
            {selected && (
              <path
                d={d}
                fill="none"
                stroke={ACCENT}
                strokeOpacity={0.35}
                strokeWidth={style.width + 8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            <path
              d={d}
              fill="none"
              stroke={EDGE_COLORS[style.color]}
              strokeWidth={style.width}
              strokeLinejoin="round"
              {...dashProps(style.dash, style.width)}
              markerStart={style.startArrow === 'arrow' ? marker : undefined}
              markerEnd={style.endArrow === 'arrow' ? marker : undefined}
            />
            {/* wide invisible line so thin arrows are easy to click */}
            <path
              d={d}
              fill="none"
              stroke="transparent"
              strokeWidth={Math.max(14, style.width + 10)}
              pointerEvents="stroke"
              style={{ cursor: 'pointer' }}
              onPointerDown={(e) => {
                e.stopPropagation() // don't let the canvas start a marquee
                selectEdge(edge.id)
              }}
            />
          </g>
        )
      })}

      {preview && (
        <line
          x1={preview.a.x}
          y1={preview.a.y}
          x2={preview.b.x}
          y2={preview.b.y}
          stroke={ACCENT}
          strokeWidth={2}
          strokeDasharray="6 4"
          markerEnd="url(#baonote-arrow-preview)"
        />
      )}
    </svg>
  )
}