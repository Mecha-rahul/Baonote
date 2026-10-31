import { useCanvasStore } from '../../state/useCanvasStore'
import Tooltip from '../Tooltip.jsx'
import {
  EDGE_COLORS,
  EDGE_SHAPES,
  EDGE_WIDTHS,
  EDGE_DASHES,
  resolveEdgeStyle,
  dashProps,
} from '../../lib/edgeStyle'

const SHAPE_LABELS = { straight: 'Straight', arc: 'Arc', curve: 'Curve', elbow: 'Elbow' }
// little icons, drawn in an 18x18 box
const SHAPE_ICONS = {
  straight: 'M3 15 L15 3',
  arc: 'M3 14 Q9 1 15 14',
  curve: 'M3 14 C9 14 9 4 15 4',
  elbow: 'M3 14 H8 Q9 14 9 13 V5 Q9 4 10 4 H15',
}
const WIDTH_LABELS = { 2: 'Medium', 4: 'Thick' }
const DASH_LABELS = { solid: 'Solid', dashed: 'Dashed', dotted: 'Dotted' }

// small square button used for width / dash / arrow choices
function OptionBtn({ label, active, onClick, children }) {
  return (
    <Tooltip label={label}>
      <button
        type="button"
        aria-label={label}
        aria-pressed={active}
        onClick={onClick}
        className={`inline-flex h-6 w-6 items-center justify-center rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
          active
            ? 'border-accent bg-accent-soft text-text'
            : 'border-transparent text-text-muted hover:bg-surface-hover hover:text-text'
        }`}
      >
        {children}
      </button>
    </Tooltip>
  )
}

function Sep() {
  return <div className="mx-0.5 h-4 w-px bg-border" aria-hidden="true" />
}

/**
 * Floating panel that appears above the toolbar while an arrow is selected.
 * Every change goes through updateEdgeStyle, so it is one undo step each.
 */
export default function EdgeStylePanel() {
  const edge = useCanvasStore((s) => s.edges.find((e) => e.id === s.selectedEdgeId))
  const updateEdgeStyle = useCanvasStore((s) => s.updateEdgeStyle)

  if (!edge) return null

  const style = resolveEdgeStyle(edge)
  const set = (patch) => updateEdgeStyle(edge.id, patch)

  return (
    <div className="absolute bottom-20 left-1/2 z-30 -translate-x-1/2">
      <div
        role="toolbar"
        aria-label="Arrow style"
        className="flex items-center gap-0.5 rounded-xl border border-border bg-surface px-1.5 py-1 shadow-panel"
      >
        {/* color */}
        <div className="flex items-center gap-1.5 px-1">
          {Object.entries(EDGE_COLORS).map(([name, hex]) => (
            <Tooltip key={name} label={name[0].toUpperCase() + name.slice(1)}>
              <button
                type="button"
                aria-label={`Color ${name}`}
                aria-pressed={style.color === name}
                onClick={() => set({ color: name })}
                className={`h-4 w-4 rounded-full border border-black/10 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  style.color === name ? 'ring-2 ring-accent ring-offset-1 ring-offset-surface' : ''
                }`}
                style={{ backgroundColor: hex }}
              />
            </Tooltip>
          ))}
        </div>

        <Sep />

        {/* shape: straight / arc / curve / elbow */}
        {EDGE_SHAPES.map((sh) => (
          <OptionBtn
            key={sh}
            label={SHAPE_LABELS[sh]}
            active={style.shape === sh}
            onClick={() => set({ shape: sh })}
          >
            <svg width="14" height="14" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path
                d={SHAPE_ICONS[sh]}
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </OptionBtn>
        ))}

        <Sep />

        {/* thickness */}
        {EDGE_WIDTHS.map((w) => (
          <OptionBtn
            key={w}
            label={WIDTH_LABELS[w]}
            active={style.width === w}
            onClick={() => set({ width: w })}
          >
            <svg width="14" height="14" viewBox="0 0 18 18" aria-hidden="true">
              <line
                x1="3"
                y1="9"
                x2="15"
                y2="9"
                stroke="currentColor"
                strokeWidth={w}
                strokeLinecap="round"
              />
            </svg>
          </OptionBtn>
        ))}

        <Sep />

        {/* solid / dashed / dotted */}
        {EDGE_DASHES.map((d) => (
          <OptionBtn
            key={d}
            label={DASH_LABELS[d]}
            active={style.dash === d}
            onClick={() => set({ dash: d })}
          >
            <svg width="14" height="14" viewBox="0 0 18 18" aria-hidden="true">
              <line
                x1="2"
                y1="9"
                x2="16"
                y2="9"
                stroke="currentColor"
                strokeWidth="2"
                {...dashProps(d, 2)}
              />
            </svg>
          </OptionBtn>
        ))}

        <Sep />

        {/* arrow heads: each end toggles on / off */}
        <OptionBtn
          label="Arrow at start"
          active={style.startArrow === 'arrow'}
          onClick={() => set({ startArrow: style.startArrow === 'arrow' ? 'none' : 'arrow' })}
        >
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M3 9h12M7 5L3 9l4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </OptionBtn>
        <OptionBtn
          label="Arrow at end"
          active={style.endArrow === 'arrow'}
          onClick={() => set({ endArrow: style.endArrow === 'arrow' ? 'none' : 'arrow' })}
        >
          <svg width="14" height="14" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M3 9h12M11 5l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </OptionBtn>
      </div>
    </div>
  )
}