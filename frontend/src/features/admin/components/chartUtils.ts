export interface Point {
  x: number
  y: number
}

/** Simple smooth cubic-bezier path through points (control points at 1/3 & 2/3 of each x-span). */
export function buildSmoothPath(points: Point[]): string {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`

  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i]
    const p1 = points[i + 1]
    const cx1 = p0.x + (p1.x - p0.x) / 3
    const cx2 = p0.x + ((p1.x - p0.x) * 2) / 3
    d += ` C ${cx1} ${p0.y}, ${cx2} ${p1.y}, ${p1.x} ${p1.y}`
  }
  return d
}
