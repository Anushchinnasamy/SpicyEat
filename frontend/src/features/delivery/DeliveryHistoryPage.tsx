import { useEffect, useState } from 'react'
import { DeliveryLayout } from './DeliveryLayout'
import { LoadingState, EmptyState } from '../../components/feedback/States'
import { fetchDeliveryHistory, fetchEarningsList, type RealDelivery, type RealEarning } from '../../api/delivery'

export function DeliveryHistoryPage() {
  const [deliveries, setDeliveries] = useState<RealDelivery[] | null>(null)
  const [earnings, setEarnings] = useState<RealEarning[]>([])

  useEffect(() => {
    fetchDeliveryHistory().then(setDeliveries).catch(() => setDeliveries([]))
    fetchEarningsList().then(setEarnings).catch(() => {})
  }, [])

  const earningByDelivery = new Map(earnings.map((e) => [e.deliveryId, e.amount]))

  return (
    <DeliveryLayout title="Delivery History">
      {deliveries === null && <LoadingState />}
      {deliveries && deliveries.length === 0 && (
        <EmptyState title="Nothing hit the spot." subtitle="Completed deliveries will show up here." />
      )}
      {deliveries && deliveries.length > 0 && (
        <div className="flex flex-col divide-y divide-admin-border rounded-2xl border border-admin-border bg-admin-card">
          {deliveries.map((delivery) => (
            <div key={delivery.id} className="flex items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-admin-text">{delivery.id.slice(0, 8)}</p>
                <p className="text-xs text-admin-text2">
                  {delivery.deliveryAddress?.city ?? 'Unknown'} ·{' '}
                  {delivery.deliveredAt ? new Date(delivery.deliveredAt).toLocaleDateString() : '—'}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  delivery.status === 'DELIVERED'
                    ? 'bg-admin-success/15 text-admin-success'
                    : 'bg-admin-danger/15 text-admin-danger'
                }`}
              >
                {delivery.status === 'DELIVERED' && earningByDelivery.has(delivery.id)
                  ? `+₹${earningByDelivery.get(delivery.id)}`
                  : delivery.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </DeliveryLayout>
  )
}
