import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { DeliveryLayout } from './DeliveryLayout'
import { Button } from '../../components/buttons/Button'
import { LoadingState, EmptyState } from '../../components/feedback/States'
import { toast } from '../../state/toastStore'
import { fetchActiveDeliveries, pickupDelivery, startDelivery, completeDelivery, type RealDelivery } from '../../api/delivery'
import { useReducedMotion } from '../../hooks/useReducedMotion'

const STEPS = [
  { key: 'ASSIGNED', label: 'Navigate to SpicyEat' },
  { key: 'PICKED_UP', label: 'Picked up — head out' },
  { key: 'OUT_FOR_DELIVERY', label: 'Navigate to Customer' },
  { key: 'DELIVERED', label: 'Delivered' },
]

export function ActiveDeliveryPage() {
  const [delivery, setDelivery] = useState<RealDelivery | null | undefined>(undefined)
  const [busy, setBusy] = useState(false)
  const reducedMotion = useReducedMotion()

  function load() {
    fetchActiveDeliveries()
      .then((list) => setDelivery(list[0] ?? null))
      .catch(() => setDelivery(null))
  }

  useEffect(load, [])

  async function handleAction(action: (id: string) => Promise<RealDelivery>) {
    if (!delivery) return
    setBusy(true)
    try {
      const updated = await action(delivery.id)
      setDelivery(updated)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update this delivery')
    } finally {
      setBusy(false)
    }
  }

  if (delivery === undefined) {
    return (
      <DeliveryLayout title="Active Delivery">
        <LoadingState />
      </DeliveryLayout>
    )
  }

  if (delivery === null) {
    return (
      <DeliveryLayout title="Active Delivery">
        <EmptyState
          title="Nothing hit the spot."
          subtitle="You don't have an active delivery right now."
          action={
            <Link to="/delivery/available" className="mt-2 text-sm font-semibold text-admin-orange-bright hover:underline">
              Find available orders →
            </Link>
          }
        />
      </DeliveryLayout>
    )
  }

  const stepIndex = STEPS.findIndex((s) => s.key === delivery.status)
  const routeProgress = delivery.status === 'ASSIGNED' ? 0.05 : delivery.status === 'PICKED_UP' ? 0.35 : delivery.status === 'OUT_FOR_DELIVERY' ? 0.75 : 1

  return (
    <DeliveryLayout title="Active Delivery">
      <div className="flex flex-col gap-5">
        <div className="rounded-2xl border border-admin-border bg-admin-card p-5">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-admin-text">{delivery.id.slice(0, 8)}</p>
            <span className="rounded-full bg-admin-orange/15 px-3 py-1 text-xs font-bold text-admin-orange-bright">
              {delivery.status.replace(/_/g, ' ')}
            </span>
          </div>

          <ol className="mt-4 flex items-center gap-1">
            {STEPS.map((step, i) => (
              <li key={step.key} className="flex flex-1 items-center gap-1">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    i <= stepIndex ? 'bg-admin-orange text-white' : 'bg-white/10 text-admin-text2'
                  }`}
                >
                  {i < stepIndex ? '✓' : i + 1}
                </span>
                {i < STEPS.length - 1 && (
                  <span className={`h-0.5 flex-1 ${i < stepIndex ? 'bg-admin-orange' : 'bg-white/10'}`} />
                )}
              </li>
            ))}
          </ol>
          <p className="mt-2 text-xs font-semibold text-admin-text2">{STEPS[Math.max(stepIndex, 0)].label}</p>
        </div>

        <div className="relative h-40 overflow-hidden rounded-2xl border border-white/5 bg-[#0e0e0e]">
          <div
            aria-hidden
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'repeating-linear-gradient(115deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 26px), repeating-linear-gradient(25deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 34px)',
            }}
          />
          <svg viewBox="0 0 300 140" className="absolute inset-0 h-full w-full">
            <path
              d="M 24 108 C 90 108, 110 40, 180 40 S 260 90, 280 30"
              fill="none"
              stroke="#FF6B2C"
              strokeWidth="2"
              strokeDasharray="6 6"
              opacity="0.8"
            />
          </svg>
          <span aria-hidden className="absolute bottom-[18%] left-[6%] text-base">
            🏠
          </span>
          <span aria-hidden className="absolute right-[5%] top-[16%] text-base">
            📍
          </span>
          <motion.span
            aria-hidden
            className="absolute text-lg"
            animate={{ left: `${routeProgress * 90}%`, top: `${28 - routeProgress * 10}%` }}
            transition={{ duration: reducedMotion ? 0 : 0.6 }}
          >
            🛵
          </motion.span>
        </div>

        <div className="rounded-2xl border border-admin-border bg-admin-card p-5">
          <p className="font-bold text-admin-text">Deliver to</p>
          {delivery.deliveryAddress ? (
            <>
              <p className="mt-2 text-sm text-admin-text">{delivery.deliveryAddress.label}</p>
              <p className="text-xs text-admin-text2">
                {delivery.deliveryAddress.line1}, {delivery.deliveryAddress.city} {delivery.deliveryAddress.postalCode}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-admin-text2">Address unavailable</p>
          )}
        </div>

        <div className="rounded-2xl border border-admin-border bg-admin-card p-5">
          <p className="font-bold text-admin-text">Items</p>
          <ul className="mt-3 flex flex-col gap-2">
            {(delivery.items ?? []).map((item, i) => (
              <li key={i} className="flex justify-between text-sm text-admin-text2">
                <span>
                  {item.quantity}× {item.itemName}
                </span>
                <span className="text-admin-text">₹{item.unitPrice * item.quantity}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-admin-border pt-3 font-semibold text-admin-text">
            <span>Total</span>
            <span>₹{delivery.orderTotal ?? '—'}</span>
          </div>
        </div>

        {delivery.status === 'ASSIGNED' && (
          <Button type="button" disabled={busy} onClick={() => handleAction(pickupDelivery)} className="w-full justify-center">
            {busy ? 'Updating...' : 'Mark Picked Up →'}
          </Button>
        )}
        {delivery.status === 'PICKED_UP' && (
          <Button type="button" disabled={busy} onClick={() => handleAction(startDelivery)} className="w-full justify-center">
            {busy ? 'Updating...' : 'Start Delivery →'}
          </Button>
        )}
        {delivery.status === 'OUT_FOR_DELIVERY' && (
          <Button type="button" disabled={busy} onClick={() => handleAction(completeDelivery)} className="w-full justify-center">
            {busy ? 'Updating...' : 'Mark Delivered →'}
          </Button>
        )}
        {delivery.status === 'DELIVERED' && (
          <div className="rounded-2xl border border-admin-success/30 bg-admin-success/10 p-5 text-center">
            <p className="font-bold text-admin-success">Delivered! 🎉</p>
            <Link to="/delivery/available" className="mt-2 inline-block text-sm font-semibold text-admin-orange-bright hover:underline">
              Find your next delivery →
            </Link>
          </div>
        )}
      </div>
    </DeliveryLayout>
  )
}
