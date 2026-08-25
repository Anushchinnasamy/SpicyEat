import { useEffect, useState } from 'react'
import { DeliveryLayout } from './DeliveryLayout'
import { StatCard } from '../../components/admin/StatCard'
import { LoadingState, EmptyState } from '../../components/feedback/States'
import { useDeliveryAuthStore } from '../../state/deliveryAuthStore'
import { fetchEarnings, type EarningsSummary } from '../../api/delivery'

export function EarningsPage() {
  const partnerId = useDeliveryAuthStore((s) => s.partnerId)
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null)

  useEffect(() => {
    if (!partnerId) return
    fetchEarnings(partnerId).then((res) => setEarnings(res.data))
  }, [partnerId])

  if (!earnings) {
    return (
      <DeliveryLayout title="Earnings">
        <LoadingState />
      </DeliveryLayout>
    )
  }

  return (
    <DeliveryLayout title="Earnings">
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Today" value={`₹${earnings.today}`} accent />
        <StatCard label="This Week" value={`₹${earnings.week}`} />
        <StatCard label="All Time" value={`₹${earnings.total}`} />
      </div>

      <div className="mt-5 rounded-2xl border border-admin-border bg-admin-card p-5">
        <p className="font-bold text-admin-text">Recent Payouts</p>
        {earnings.breakdown.length === 0 ? (
          <EmptyState title="Nothing hit the spot." subtitle="Complete a delivery to start earning." />
        ) : (
          <div className="mt-3 flex flex-col divide-y divide-admin-border">
            {earnings.breakdown.map((b) => (
              <div key={b.orderId} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <p className="font-semibold text-admin-text">{b.orderId}</p>
                  <p className="text-xs text-admin-text2">{new Date(b.date).toLocaleDateString()}</p>
                </div>
                <span className="font-semibold text-admin-success">+₹{b.fee}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DeliveryLayout>
  )
}
