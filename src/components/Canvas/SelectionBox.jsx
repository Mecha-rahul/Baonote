export default function SelectionBox({ rect }) {
  return (
    <div
      // swap the colors for your tokens
      className="pointer-events-none absolute rounded-sm border border-fuchsia-500 bg-fuchsia-500/10"
      style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
    />
  )
}