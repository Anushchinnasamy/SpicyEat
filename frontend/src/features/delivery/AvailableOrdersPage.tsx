import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DeliveryLayout } from './DeliveryLayout'
import { Button } from '../../components/buttons/Button'
import { LoadingState, EmptyState } from '../../components/feedback/States'
import { useDeliveryAuthStore } from '../../state/deliveryAuthStore'
import { fetchAvailableOrders, acceptOrder } from '../../api/orders'
import { fetchActiveDelivery } from '../../api/delivery'
import type { Order } from '../../types'

export function AvailableOrdersPage() {
  const partnerId = useDeliveryAuthStore((s) => s.partnerId)
  const partnerName = useDeliveryAuthStore((s) => s.partnerName)
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [hasActive, setHasActive] = useState(false)
  const [accepting, setAccepting] = useState<string | null>(null)
  const navigate = useNavigate()

  function load() {
    fetchAvailableOrders().then((res) => setOrders(res.data))
  }

  useEffect(() => {
    load()
    if (partnerId) {
      fetchActiveDelivery(partnerId).then((res) => setHasActive(!!res.data))
    }
  }, [partnerId])

  async function handleAccept(id: string) {
    if (!partnerId || !partnerName || hasActive) return
    setAccepting(id)
    await acceptOrder(id, partnerId, partnerName)
    setAccepting(null)
    navigate('/delivery/active')
  }

  return (
    <DeliveryLayout title="Available Orders">
      {orders === null && <LoadingState />}

      {orders && hasActive && (
        <p className="mb-4 rounded-xl border border-admin-warning/30 bg-admin-warning/10 px-4 py-3 text-sm text-admin-warning">
          Finish your active delivery before accepting a new one.
        </p>
      )}

      {orders && orders.length === 0 && (
        <EmptyState title="Nothing hit the spot." subtitle="No orders are ready for pickup right now." />
      )}

      {orders && orders.length > 0 && (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-admin-border bg-admin-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-admin-text">{order.id}</p>
                  <p className="text-xs text-admin-text2">
                    {order.address.line1}, {order.address.city} {order.address.pincode}
                  </p>
                </div>
                <span className="font-display text-lg text-admin-orange-bright">₹{order.total}</span>
              </div>
              <p className="mt-2 text-xs text-admin-text2">
                {order.items.length} item{order.items.length > 1 ? 's' : ''} · {order.deliveryOption} delivery
              </p>
              <Button
                type="button"
                disabled={hasActive || accepting === order.id}
                onClick={() => handleAccept(order.id)}
                className="mt-4 w-full justify-center"
              >
                {accepting === order.id ? 'Accepting...' : 'Accept Order →'}
              </Button>
            </div>
          ))}
        </div>
      )}
    </DeliveryLayout>
  )
}
