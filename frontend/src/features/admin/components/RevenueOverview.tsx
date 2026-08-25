import { buildSmoothPath, type Point } from './chartUtils'
import type { Order } from '../../../types'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function dayIndex(date: Date) {
  // Monday-first index (0 = Mon ... 6 = Sun)
  return (date.getDay() + 6) % 7
}

function last7Days() {
  const days: Date[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d)
  }
  return days
}

export function RevenueOverview({ orders }: { orders: Order[] }) {
  const days = last7Days()
  const revenueByDay = days.map((d) => {
    const key = d.toDateString()
    return orders.filter((o) => new Date(o.placedAt).toDateString() === key).reduce((sum, o) => sum + o.total, 0)
  })

  const total = revenueByDay.reduce((a, b) => a + b, 0)
  const max = Math.max(...revenueByDay, 1)

  const width = 300
  const height = 110
  const padding = 8
  const points: Point[] = revenueByDay.map((v, i) => ({
    x: padding + (i * (width - padding * 2)) / (revenueByDay.length - 1),
    y: height - padding - (v / max) * (height - padding * 2),
  }))

  const linePath = buildSmoothPath(points)
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`

  return (
    <div className="rounded-2xl border border-admin-border bg-admin-card p-5 sm:p-6">
      <p className="font-bold text-admin-text">Revenue Overview</p>
      <p className="mt-2 text-2xl font-bold text-admin-text">₹{total.toLocaleString()}</p>
      <p className="text-xs font-medium text-admin-text2">Last 7 days</p>

      {total === 0 ? (
        <div className="mt-6 flex h-28 items-center justify-center text-sm text-admin-text2">
          No revenue yet this week.
        </div>
      ) : (
        <>
          <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 w-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF6B2C" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#FF6B2C" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#revenueGradient)" />
            <path d={linePath} fill="none" stroke="#FF7A3D" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <div className="mt-2 flex justify-between text-[10px] font-semibold uppercase tracking-wide text-admin-muted">
            {DAY_LABELS.map((label, i) => (
              <span key={label} className={dayIndex(new Date()) === i ? 'text-admin-orange-bright' : ''}>
                {label}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
