import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DeliveryLayout } from './DeliveryLayout'
import { StatCard } from '../../components/admin/StatCard'
import { LoadingState } from '../../components/feedback/States'
import { fetchAvailableDeliveries, fetchActiveDeliveries, fetchEarningsList, type RealDelivery, type RealEarning } from '../../api/delivery'

export function DeliveryDashboardPage() {
  const [available, setAvailable] = useState<RealDelivery[] | null>(null)
  const [active, setActive] = useState<RealDelivery | null>(null)
  const [earnings, setEarnings] = useState<RealEarning[] | null>(null)

  useEffect(() => {
    fetchAvailableDeliveries().then(setAvailable).catch(() => setAvailable([]))
    fetchActiveDeliveries().then((list) => setActive(list[0] ?? null)).catch(() => setActive(null))
    fetchEarningsList().then(setEarnings).catch(() => setEarnings([]))
  }, [])

  const loading = available === null || earnings === null

  const todayKey = new Date().toDateString()
  const todayEarnings = earnings?.filter((e) => new Date(e.createdAt).toDateString() === todayKey) ?? []

  return (
    <DeliveryLayout title="Ready to get spicy?">
      {loading ? (
        <LoadingState />
      ) : (
        <div className="flex flex-col gap-5">
          {active && (
            <Link
              to="/delivery/active"
              className="flex items-center justify-between rounded-2xl border border-admin-orange/25 bg-gradient-to-br from-admin-orange/15 via-admin-card to-admin-card p-5 transition-colors hover:border-admin-orange/50"
            >
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-admin-orange-bright">
                  Active Delivery
                </p>
                <p className="mt-1 font-semibold text-admin-text">{active.id.slice(0, 8)}</p>
                <p className="text-xs text-admin-text2">
                  {active.deliveryAddress?.city ?? 'Unknown'} · ₹{active.orderTotal ?? '—'}
                </p>
              </div>
              <span aria-hidden className="text-2xl">
                🛵
              </span>
            </Link>
          )}

          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Available" value={String(available.length)} accent />
            <StatCard label="Deliveries Today" value={String(todayEarnings.length)} />
            <StatCard label="Earned Today" value={`₹${todayEarnings.reduce((s, e) => s + e.amount, 0)}`} />
          </div>

          <div className="rounded-2xl border border-admin-border bg-admin-card p-5">
            <div className="flex items-center justify-between">
              <p className="font-bold text-admin-text">Nearby Orders</p>
              <Link to="/delivery/available" className="text-xs font-semibold text-admin-orange-bright hover:text-admin-amber">
                View all →
              </Link>
            </div>
            {available.length === 0 ? (
              <p className="mt-4 text-sm text-admin-text2">No orders ready for pickup right now.</p>
            ) : (
              <div className="mt-3 flex flex-col divide-y divide-admin-border">
                {available.slice(0, 3).map((delivery) => (
                  <div key={delivery.id} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <p className="font-semibold text-admin-text">{delivery.id.slice(0, 8)}</p>
                      <p className="text-xs text-admin-text2">
                        {delivery.deliveryAddress?.city ?? 'Unknown'} · {delivery.items?.length ?? 0} items
                      </p>
                    </div>
                    <span className="font-semibold text-admin-text">₹{delivery.orderTotal ?? '—'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </DeliveryLayout>
  )
}
