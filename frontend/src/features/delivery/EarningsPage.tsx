import { useEffect, useState } from 'react'
import { DeliveryLayout } from './DeliveryLayout'
import { StatCard } from '../../components/admin/StatCard'
import { LoadingState, EmptyState } from '../../components/feedback/States'
import { fetchEarningsList, type RealEarning } from '../../api/delivery'

const WEEK_MS = 7 * 24 * 60 * 60 * 1000

export function EarningsPage() {
  const [earnings, setEarnings] = useState<RealEarning[] | null>(null)

  useEffect(() => {
    fetchEarningsList().then(setEarnings).catch(() => setEarnings([]))
  }, [])

  if (!earnings) {
    return (
      <DeliveryLayout title="Earnings">
        <LoadingState />
      </DeliveryLayout>
    )
  }

  const now = Date.now()
  const todayKey = new Date().toDateString()
  const today = earnings.filter((e) => new Date(e.createdAt).toDateString() === todayKey)
  const week = earnings.filter((e) => now - new Date(e.createdAt).getTime() <= WEEK_MS)
  const total = earnings.reduce((s, e) => s + e.amount, 0)

  return (
    <DeliveryLayout title="Earnings">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Today" value={`₹${today.reduce((s, e) => s + e.amount, 0)}`} accent />
        <StatCard label="This Week" value={`₹${week.reduce((s, e) => s + e.amount, 0)}`} />
        <StatCard label="All Time" value={`₹${total}`} />
      </div>

      <div className="mt-5 rounded-2xl border border-admin-border bg-admin-card p-5">
        <p className="font-bold text-admin-text">Recent Payouts</p>
        {earnings.length === 0 ? (
          <EmptyState title="Nothing hit the spot." subtitle="Complete a delivery to start earning." />
        ) : (
          <div className="mt-3 flex flex-col divide-y divide-admin-border">
            {earnings.slice(0, 20).map((e) => (
              <div key={e.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-semibold text-admin-text">{e.deliveryId.slice(0, 8)}</p>
                  <p className="text-xs text-admin-text2">{new Date(e.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="font-semibold text-admin-success">+₹{e.amount}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DeliveryLayout>
  )
}
