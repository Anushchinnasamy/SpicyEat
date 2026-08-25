import { useEffect, useState } from 'react'
import { DeliveryLayout } from './DeliveryLayout'
import { LoadingState, EmptyState } from '../../components/feedback/States'
import { useDeliveryAuthStore } from '../../state/deliveryAuthStore'
import { fetchDeliveryHistory } from '../../api/delivery'
import type { Order } from '../../types'

export function DeliveryHistoryPage() {
  const partnerId = useDeliveryAuthStore((s) => s.partnerId)
  const [orders, setOrders] = useState<Order[] | null>(null)

  useEffect(() => {
    if (!partnerId) return
    fetchDeliveryHistory(partnerId).then((res) => setOrders(res.data))
  }, [partnerId])

  return (
    <DeliveryLayout title="Delivery History">
      {orders === null && <LoadingState />}
      {orders && orders.length === 0 && (
        <EmptyState title="Nothing hit the spot." subtitle="Completed deliveries will show up here." />
      )}
      {orders && orders.length > 0 && (
        <div className="flex flex-col divide-y divide-admin-border rounded-2xl border border-admin-border bg-admin-card">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-admin-text">{order.id}</p>
                <p className="text-xs text-admin-text2">
                  {order.address.city} · {new Date(order.placedAt).toLocaleDateString()}
                </p>
              </div>
              <span className="rounded-full bg-admin-success/15 px-3 py-1 text-xs font-bold text-admin-success">
                ₹{Math.round(order.deliveryFee * 0.8)}
              </span>
            </div>
          ))}
        </div>
      )}
    </DeliveryLayout>
  )
}
