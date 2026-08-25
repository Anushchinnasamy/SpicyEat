import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { DeliveryLayout } from './DeliveryLayout'
import { Button } from '../../components/buttons/Button'
import { LoadingState, EmptyState } from '../../components/feedback/States'
import { useDeliveryAuthStore } from '../../state/deliveryAuthStore'
import { fetchActiveDelivery } from '../../api/delivery'
import { markPickedUp, markDelivered } from '../../api/orders'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import type { Order } from '../../types'

const STEPS = [
  { key: 'ASSIGNED', label: 'Navigate to SpicyEat' },
  { key: 'OUT_FOR_DELIVERY', label: 'Navigate to Customer' },
  { key: 'DELIVERED', label: 'Delivered' },
]

export function ActiveDeliveryPage() {
  const partnerId = useDeliveryAuthStore((s) => s.partnerId)
  const [order, setOrder] = useState<Order | null | undefined>(undefined)
  const [busy, setBusy] = useState(false)
  const reducedMotion = useReducedMotion()

  function load() {
    if (!partnerId) return
    fetchActiveDelivery(partnerId).then((res) => setOrder(res.data))
  }

  useEffect(load, [partnerId])

  async function handlePickedUp() {
    if (!order) return
    setBusy(true)
    await markPickedUp(order.id)
    setBusy(false)
    load()
  }

  async function handleDelivered() {
    if (!order) return
    setBusy(true)
    await markDelivered(order.id)
    setBusy(false)
    // Don't refetch via fetchActiveDelivery — it excludes DELIVERED orders.
    // Update locally so the completion state renders instead of "no active delivery".
    setOrder((prev) => (prev ? { ...prev, status: 'DELIVERED' } : prev))
  }

  if (order === undefined) {
    return (
      <DeliveryLayout title="Active Delivery">
        <LoadingState />
      </DeliveryLayout>
    )
  }

  if (order === null) {
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

  const stepIndex = STEPS.findIndex((s) => s.key === order.status)
  const routeProgress = order.status === 'ASSIGNED' ? 0.15 : order.status === 'OUT_FOR_DELIVERY' ? 0.75 : 1

  return (
    <DeliveryLayout title="Active Delivery">
      <div className="flex flex-col gap-5">
        <div className="rounded-2xl border border-admin-border bg-admin-card p-5">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-admin-text">{order.id}</p>
            <span className="rounded-full bg-admin-orange/15 px-3 py-1 text-xs font-bold text-admin-orange-bright">
              {order.status.replace(/_/g, ' ')}
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
          <p className="mt-2 text-sm text-admin-text">{order.address.name}</p>
          <p className="text-xs text-admin-text2">
            {order.address.line1}, {order.address.city} {order.address.pincode}
          </p>
          <a
            href={`tel:${order.address.phone}`}
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/5 px-4 py-2 text-xs font-bold text-admin-text transition-colors hover:bg-white/10"
          >
            📞 Call Customer
          </a>
        </div>

        <div className="rounded-2xl border border-admin-border bg-admin-card p-5">
          <p className="font-bold text-admin-text">Items</p>
          <ul className="mt-3 flex flex-col gap-2">
            {order.items.map((item) => (
              <li key={item.lineId} className="flex justify-between text-sm text-admin-text2">
                <span>
                  {item.quantity}× {item.name}
                </span>
                <span className="text-admin-text">₹{item.unitPrice * item.quantity}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-admin-border pt-3 font-semibold text-admin-text">
            <span>Total</span>
            <span>₹{order.total}</span>
          </div>
        </div>

        {order.status === 'ASSIGNED' && (
          <Button type="button" disabled={busy} onClick={handlePickedUp} className="w-full justify-center">
            {busy ? 'Updating...' : 'Mark Picked Up →'}
          </Button>
        )}
        {order.status === 'OUT_FOR_DELIVERY' && (
          <Button type="button" disabled={busy} onClick={handleDelivered} className="w-full justify-center">
            {busy ? 'Updating...' : 'Mark Delivered →'}
          </Button>
        )}
        {order.status === 'DELIVERED' && (
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
