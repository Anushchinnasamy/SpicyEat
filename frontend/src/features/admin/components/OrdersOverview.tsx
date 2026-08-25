import type { Order } from '../../../types'

const SEGMENT_COLOR = {
  Delivered: '#4ADE80',
  Preparing: '#FF6B2C',
  'On the way': '#60A5FA',
  New: '#FBBF24',
}

export function OrdersOverview({ orders }: { orders: Order[] }) {
  const total = orders.length

  const segments = [
    { label: 'Delivered' as const, count: orders.filter((o) => o.status === 'DELIVERED').length },
    { label: 'Preparing' as const, count: orders.filter((o) => o.status === 'PREPARING' || o.status === 'READY').length },
    {
      label: 'On the way' as const,
      count: orders.filter((o) => o.status === 'ASSIGNED' || o.status === 'OUT_FOR_DELIVERY').length,
    },
    { label: 'New' as const, count: orders.filter((o) => o.status === 'PLACED' || o.status === 'CONFIRMED').length },
  ]

  const r = 46
  const circumference = 2 * Math.PI * r
  let offset = 0

  return (
    <div className="rounded-2xl border border-admin-border bg-admin-card p-5 sm:p-6">
      <p className="font-bold text-admin-text">Orders Overview</p>

      {total === 0 ? (
        <div className="mt-6 flex h-40 items-center justify-center text-sm text-admin-text2">No orders yet.</div>
      ) : (
        <div className="mt-4 flex flex-col items-center gap-5 sm:flex-row sm:items-center">
          <svg viewBox="0 0 120 120" className="h-32 w-32 shrink-0 -rotate-90">
            <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
            {segments.map((seg) => {
              if (seg.count === 0) return null
              const pct = seg.count / total
              const dash = pct * circumference
              const circle = (
                <circle
                  key={seg.label}
                  cx="60"
                  cy="60"
                  r={r}
                  fill="none"
                  stroke={SEGMENT_COLOR[seg.label]}
                  strokeWidth="14"
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                />
              )
              offset += dash
              return circle
            })}
          </svg>

          <div className="flex flex-1 flex-col gap-2">
            <div className="mb-1">
              <p className="text-2xl font-bold text-admin-text">{total}</p>
              <p className="text-xs text-admin-text2">Total Orders</p>
            </div>
            {segments.map((seg) => (
              <div key={seg.label} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-admin-text2">
                  <span
                    aria-hidden
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: SEGMENT_COLOR[seg.label] }}
                  />
                  {seg.label}
                </span>
                <span className="font-semibold text-admin-text">
                  {seg.count} ({total ? Math.round((seg.count / total) * 100) : 0}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
