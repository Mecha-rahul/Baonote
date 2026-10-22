/**
 * Full-screen canvas with a faint dot grid. Grid size and offset are
 * driven by props so pan/zoom can move it later. Purely visual — no
 * interaction logic is implemented.
 */
export default function BoardCanvas({ zoom = 1, offsetX = 0, offsetY = 0 }) {
  const gridSize = Math.round(24 * zoom)
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0"
      style={{
        backgroundImage:
          'radial-gradient(rgb(var(--rgb-border) / var(--grid-dot-alpha)) 1px, transparent 1px)',
        backgroundSize: `${gridSize}px ${gridSize}px`,
        backgroundPosition: `${offsetX}px ${offsetY}px`,
      }}
    />
  )
}
