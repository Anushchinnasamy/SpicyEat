import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { DeliveryLayout } from './DeliveryLayout'
import { StatCard } from '../../components/admin/StatCard'
import { LoadingState } from '../../components/feedback/States'
import { useDeliveryAuthStore } from '../../state/deliveryAuthStore'
import { fetchAvailableOrders } from '../../api/orders'
import { fetchActiveDelivery, fetchEarnings, type EarningsSummary } from '../../api/delivery'
import type { Order } from '../../types'

export function DeliveryDashboardPage() {
  const partnerId = useDeliveryAuthStore((s) => s.partnerId)
  const [available, setAvailable] = useState<Order[] | null>(null)
  const [active, setActive] = useState<Order | null>(null)
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null)

  useEffect(() => {
    if (!partnerId) return
    fetchAvailableOrders().then((res) => setAvailable(res.data))
    fetchActiveDelivery(partnerId).then((res) => setActive(res.data))
    fetchEarnings(partnerId).then((res) => setEarnings(res.data))
  }, [partnerId])

  const loading = available === null || earnings === null

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
                <p className="mt-1 font-semibold text-admin-text">{active.id}</p>
                <p className="text-xs text-admin-text2">{active.address.name} · ₹{active.total}</p>
              </div>
              <span aria-hidden className="text-2xl">
                🛵
              </span>
            </Link>
          )}

          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Available" value={String(available.length)} accent />
            <StatCard label="Deliveries Today" value={String(earnings.deliveriesToday)} />
            <StatCard label="Earned Today" value={`₹${earnings.today}`} />
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
                {available.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <p className="font-semibold text-admin-text">{order.id}</p>
                      <p className="text-xs text-admin-text2">
                        {order.address.city} · {order.items.length} items
                      </p>
                    </div>
                    <span className="font-semibold text-admin-text">₹{order.total}</span>
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
