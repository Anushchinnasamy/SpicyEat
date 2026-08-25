import { AdminLayout } from './AdminLayout'
import { categories } from '../../api/mock/foods'

const WEEKLY_REVENUE = [
  { day: 'Mon', value: 12400 },
  { day: 'Tue', value: 15800 },
  { day: 'Wed', value: 14100 },
  { day: 'Thu', value: 18900 },
  { day: 'Fri', value: 24600 },
  { day: 'Sat', value: 31200 },
  { day: 'Sun', value: 27400 },
]

const CATEGORY_SHARE = categories.map((c, i) => ({
  name: c.name,
  share: [24, 19, 16, 12, 10, 8, 6, 5][i] ?? 5,
}))

export function AnalyticsPage() {
  const maxRevenue = Math.max(...WEEKLY_REVENUE.map((d) => d.value))

  return (
    <AdminLayout title="Analytics">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl border border-admin-border bg-admin-card p-6">
          <p className="font-bold text-admin-text">Revenue, last 7 days</p>
          <div className="mt-6 flex h-52 gap-3">
            {WEEKLY_REVENUE.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 flex-col items-center justify-end">
                  <span className="mb-1 text-xs font-semibold text-admin-text2">₹{(d.value / 1000).toFixed(1)}k</span>
                  <div
                    className="w-full rounded-t-lg bg-admin-orange transition-all"
                    style={{ height: `${(d.value / maxRevenue) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-semibold uppercase text-admin-text2">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-admin-border bg-admin-card p-6">
          <p className="font-bold text-admin-text">Sales by Category</p>
          <div className="mt-6 flex flex-col gap-4">
            {CATEGORY_SHARE.map((c) => (
              <div key={c.name}>
                <div className="mb-1 flex justify-between text-xs font-semibold text-admin-text">
                  <span>{c.name}</span>
                  <span className="text-admin-text2">{c.share}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-admin-orange" style={{ width: `${c.share * 4}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
