import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DeliveryLayout } from './DeliveryLayout'
import { Button } from '../../components/buttons/Button'
import { LoadingState, EmptyState } from '../../components/feedback/States'
import { toast } from '../../state/toastStore'
import { fetchAvailableDeliveries, fetchActiveDeliveries, acceptDelivery, type RealDelivery } from '../../api/delivery'

export function AvailableOrdersPage() {
  const [deliveries, setDeliveries] = useState<RealDelivery[] | null>(null)
  const [hasActive, setHasActive] = useState(false)
  const [accepting, setAccepting] = useState<string | null>(null)
  const navigate = useNavigate()

  function load() {
    fetchAvailableDeliveries().then(setDeliveries).catch(() => setDeliveries([]))
    fetchActiveDeliveries().then((list) => setHasActive(list.length > 0)).catch(() => {})
  }

  useEffect(load, [])

  async function handleAccept(id: string) {
    if (hasActive) return
    setAccepting(id)
    try {
      await acceptDelivery(id)
      navigate('/delivery/active')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not accept that delivery')
      load()
    } finally {
      setAccepting(null)
    }
  }

  return (
    <DeliveryLayout title="Available Orders">
      {deliveries === null && <LoadingState />}

      {deliveries && hasActive && (
        <p className="mb-4 rounded-xl border border-admin-warning/30 bg-admin-warning/10 px-4 py-3 text-sm text-admin-warning">
          Finish your active delivery before accepting a new one.
        </p>
      )}

      {deliveries && deliveries.length === 0 && (
        <EmptyState title="Nothing hit the spot." subtitle="No orders are ready for pickup right now." />
      )}

      {deliveries && deliveries.length > 0 && (
        <div className="flex flex-col gap-3">
          {deliveries.map((delivery) => (
            <div key={delivery.id} className="rounded-2xl border border-admin-border bg-admin-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-admin-text">{delivery.id.slice(0, 8)}</p>
                  {delivery.deliveryAddress && (
                    <p className="text-xs text-admin-text2">
                      {delivery.deliveryAddress.line1}, {delivery.deliveryAddress.city} {delivery.deliveryAddress.postalCode}
                    </p>
                  )}
                </div>
                <span className="font-display text-lg text-admin-orange-bright">₹{delivery.orderTotal ?? '—'}</span>
              </div>
              <p className="mt-2 text-xs text-admin-text2">
                {delivery.items?.length ?? 0} item{(delivery.items?.length ?? 0) === 1 ? '' : 's'}
              </p>
              <Button
                type="button"
                disabled={hasActive || accepting === delivery.id}
                onClick={() => handleAccept(delivery.id)}
                className="mt-4 w-full justify-center"
              >
                {accepting === delivery.id ? 'Accepting...' : 'Accept Order →'}
              </Button>
            </div>
          ))}
        </div>
      )}
    </DeliveryLayout>
  )
}
