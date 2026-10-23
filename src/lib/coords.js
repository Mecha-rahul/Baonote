export const MAX_ZOOM = 0.1 ;
export const MIN_ZOOM = 0.4;

export const clampZoom = (z) => {Math.min(MAX_ZOOM , Math.max(z,MIN_ZOOM))} 


//converting screen positions to canvas postions board
export function screenToCanvas(sx , sy , viewport){
  return{
    x : ( sx - viewport.offsetX) / viewport.zoom ,
    y : ( sy - viewport.offsetY) / viewport.zoom ,
  };
}

//new zoom 
export function zoomAt(viewport , mouseX , mouseY , newZoom){
  const zoom = clampZoom(newZoom)
  const world = screenToCanvas(mouseX , mouseY , viewport)

  return{
    zoom , 
    offsetX : mouseX - world.x * zoom ,
    offsetY : mouseY - world.y * zoom ,
  };
}