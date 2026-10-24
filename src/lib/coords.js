export const MIN_ZOOM = 0.1
export const MAX_ZOOM = 4

export const clampZoom = (z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z))

// converts a screen position (relative to the canvas) to a position on the board
export function screenToCanvas(sx, sy, viewport) {
  return {
    x: (sx - viewport.offsetX) / viewport.zoom,
    y: (sy - viewport.offsetY) / viewport.zoom,
  }
}

// returns a new viewport with the new zoom, keeping the point under the mouse fixed
export function zoomAt(viewport, mouseX, mouseY, newZoom) {
  if (!Number.isFinite(newZoom)) return viewport // ignore bad input
  const zoom = clampZoom(newZoom)
  const world = screenToCanvas(mouseX, mouseY, viewport)

  return {
    zoom,
    offsetX: mouseX - world.x * zoom,
    offsetY: mouseY - world.y * zoom,
  }
}