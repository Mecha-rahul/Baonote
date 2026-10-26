import { useCanvasStore } from '../../state/useCanvasStore'
import { borderPoint, edgeLine } from '../../lib/edges'

// placeholder colors, swap for design tokens later
const COLOR = '#9ca3af'
const COLOR_SELECTED = '#d946ef'

function Marker({ id, color }) {
  return (
    <marker
      id={id}
      viewBox="0 0 10 10"
      refX="9"
      refY="5"
      markerWidth="7"
      markerHeight="7"
      orient="auto"
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
        <Marker id="baonote-arrow" color={COLOR} />
        <Marker id="baonote-arrow-selected" color={COLOR_SELECTED} />
      </defs>

      {edges.map((edge) => {
        const from = byId.get(edge.fromId)
        const to = byId.get(edge.toId)
        if (!from || !to) return null
        const line = edgeLine(from, to)
        if (!line) return null
        const selected = edge.id === selectedEdgeId
        return (
          <g key={edge.id}>
            <line
              x1={line.a.x}
              y1={line.a.y}
              x2={line.b.x}
              y2={line.b.y}
              stroke={selected ? COLOR_SELECTED : COLOR}
              strokeWidth={2}
              markerEnd={`url(#${selected ? 'baonote-arrow-selected' : 'baonote-arrow'})`}
            />
            {/* wide invisible line so thin arrows are easy to click */}
            <line
              x1={line.a.x}
              y1={line.a.y}
              x2={line.b.x}
              y2={line.b.y}
              stroke="transparent"
              strokeWidth={14}
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
          stroke={COLOR_SELECTED}
          strokeWidth={2}
          strokeDasharray="6 4"
          markerEnd="url(#baonote-arrow-selected)"
        />
      )}
    </svg>
  )
}