import { Link } from 'react-router-dom'

interface PopularItem {
  name: string
  image: string
  orders: number
  price: number
}

// Deterministic little trend bars per row — purely decorative, no fake precision implied.
const TREND_PATTERNS = [
  [3, 5, 4, 7, 6, 8],
  [4, 4, 6, 5, 7, 6],
  [2, 4, 3, 5, 4, 6],
  [5, 3, 4, 3, 5, 4],
  [2, 3, 3, 4, 3, 5],
]

export function PopularItems({ items }: { items: PopularItem[] }) {
  return (
    <div className="rounded-2xl border border-admin-border bg-admin-card p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="font-bold text-admin-text">Popular Items</p>
        <Link to="/admin/menu" className="text-xs font-semibold text-admin-orange-bright hover:text-admin-amber">
          View menu →
        </Link>
      </div>

      <div className="mt-4 flex flex-col gap-1">
        {items.map((item, i) => {
          const bars = TREND_PATTERNS[i % TREND_PATTERNS.length]
          const max = Math.max(...bars)
          return (
            <div
              key={item.name}
              className="group flex items-center gap-3 rounded-xl px-1 py-2 transition-colors duration-150 hover:bg-white/[0.03]"
            >
              <img
                src={item.image}
                alt={item.name}
                className="h-11 w-11 shrink-0 rounded-lg object-cover transition-transform duration-200 group-hover:scale-105"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-admin-text">{item.name}</p>
                <p className="text-xs text-admin-text2">
                  {item.orders} orders · ₹{item.price}
                </p>
              </div>
              <div className="flex h-6 shrink-0 items-end gap-0.5" aria-hidden>
                {bars.map((b, j) => (
                  <span
                    key={j}
                    className="w-1 rounded-sm bg-admin-orange/60"
                    style={{ height: `${(b / max) * 100}%` }}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
