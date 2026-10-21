import type { Frame } from '@/components/Video'

// The Nothing phone render (Figma "Frame 2147226846"), cropped to its own
// alpha bounds with the display punched through to transparent, measured
// off the 1381x2865 PNG. A recording of the 414x916 screen fills the hole.
export const nothingPhone: Frame = {
  src: '/images/essential-apps-mobile/phone.webp',
  width: 1381,
  height: 2865,
  screen: { x: 72, y: 58, width: 1236, height: 2747, radius: 74 },
}
