// default size and starting content for each card type
export const CARD_DEFAULTS = {
  note: { w: 220, h: 140, content: () => ({ text: '' }) },
  todo: { w: 240, h: 200, content: () => ({ title: '', items: [] }) },
  code: { w: 360, h: 200, content: () => ({ language: 'javascript', code: '' }) },
  link: { w: 260, h: 110, content: () => ({ url: '', title: '' }) },
}

// true if a toolbar tool id creates a card (note, todo, code, link)
export const isCardTool = (toolId) => toolId in CARD_DEFAULTS

// builds a new card centered on a point of the board (canvas units)
export function buildCard(type, centerX, centerY) {
  const d = CARD_DEFAULTS[type]
  return {
    id: crypto.randomUUID(),
    type,
    x: centerX - d.w / 2,
    y: centerY - d.h / 2,
    w: d.w,
    h: d.h,
    content: d.content(),
  }
}