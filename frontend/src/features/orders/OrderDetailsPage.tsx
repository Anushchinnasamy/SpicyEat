import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageShell } from '../../components/layout/PageShell'
import { OrderTimeline } from '../../components/order/OrderTimeline'
import { LoadingState, ErrorState } from '../../components/feedback/States'
import { LinkButton, Button } from '../../components/buttons/Button'
import { fetchOrder } from '../../api/orders'
import { useCartStore } from '../../state/cartStore'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import type { Order, OrderStatus, PaymentMethod } from '../../types'

const STATUS_ORDER: OrderStatus[] = [
  'PLACED',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'ASSIGNED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
]

const STATUS_COPY: Record<OrderStatus, { headline: string; subtitle: string }> = {
  PLACED: { headline: 'Order Placed!', subtitle: 'Sending this over to the kitchen.' },
  CONFIRMED: { headline: 'Order Confirmed!', subtitle: 'Your cravings are officially in motion.' },
  PREPARING: { headline: 'Preparing Your Order!', subtitle: 'Fresh off the fire, coming right up.' },
  READY: { headline: 'Ready for Pickup!', subtitle: 'Boxed up and waiting on a rider.' },
  ASSIGNED: { headline: 'Rider Assigned!', subtitle: 'A rider is grabbing your order now.' },
  OUT_FOR_DELIVERY: { headline: 'On The Way!', subtitle: 'Almost there. Hang tight.' },
  DELIVERED: { headline: 'Delivered!', subtitle: 'Enjoy. You earned this.' },
}

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  card: 'Card',
  upi: 'UPI',
  cod: 'Cash on delivery',
}

const DELIVERY_PARTNER = { name: 'Arjun Kumar', rating: 4.8, vehicle: 'Bike · TN 07 AB 1234', phone: '+919876500000' }

/** Advances the mock order through its lifecycle every few seconds — this frontend has no live backend push. */
function useSimulatedStatus(initial: OrderStatus | undefined) {
  const [status, setStatus] = useState<OrderStatus | undefined>(initial)

  useEffect(() => {
    setStatus(initial)
  }, [initial])

  useEffect(() => {
    if (!status || status === 'DELIVERED') return
    const timer = setInterval(() => {
      setStatus((current) => {
        if (!current) return current
        const idx = STATUS_ORDER.indexOf(current)
        return idx >= STATUS_ORDER.length - 1 ? current : STATUS_ORDER[idx + 1]
      })
    }, 6000)
    return () => clearInterval(timer)
  }, [status])

  return status
}

export function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null | undefined>(undefined)
  const status = useSimulatedStatus(order?.status)
  const reducedMotion = useReducedMotion()
  const addLineItems = useCartStore((s) => s.addLineItems)
  const navigate = useNavigate()

  useEffect(() => {
    if (!id) return
    fetchOrder(id).then((res) => setOrder(res.data))
  }, [id])

  if (order === undefined) {
    return (
      <PageShell>
        <LoadingState />
      </PageShell>
    )
  }

  if (order === null || !status) {
    return (
      <PageShell>
        <ErrorState
          title="Something got a little too hot."
          subtitle="We couldn't find that order."
          action={
            <LinkButton to="/menu" className="mt-2">
              Back to Menu →
            </LinkButton>
          }
        />
      </PageShell>
    )
  }

  const statusIndex = STATUS_ORDER.indexOf(status)
  const partnerAssigned = statusIndex >= STATUS_ORDER.indexOf('ASSIGNED')
  const routeProgress = Math.min(statusIndex / (STATUS_ORDER.length - 1), 1)

  function handleReorder() {
    addLineItems(order!.items)
    navigate('/cart')
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl px-5 py-12 lg:px-10">
        <motion.div
          key={status}
          initial={reducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-xs font-bold uppercase tracking-wide text-muted-ink">Order {order.id}</p>
          <h1 className="mt-1 font-display text-4xl uppercase leading-tight sm:text-5xl">
            {STATUS_COPY[status].headline}
          </h1>
          <p className="mt-2 text-muted-ink">{STATUS_COPY[status].subtitle}</p>
        </motion.div>

        <div className="mt-10 rounded-3xl bg-white p-6 ring-1 ring-deep-ink/5 sm:p-8">
          <OrderTimeline status={status} />
        </div>

        <div className="relative mt-6 overflow-hidden rounded-3xl bg-deep-ink p-8 text-warm-canvas">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide text-warm-canvas/60">
            <span>🏠 SpicyEat Kitchen</span>
            <span>Your address 📍</span>
          </div>
          <div className="relative mt-6 h-1 rounded-full bg-warm-canvas/15">
            <div
              className="h-1 rounded-full bg-sun-orange transition-all duration-700"
              style={{ width: `${routeProgress * 100}%` }}
            />
            <motion.span
              aria-hidden
              className="absolute -top-3 text-xl"
              animate={{ left: `${routeProgress * 100}%` }}
              transition={{ duration: reducedMotion ? 0 : 0.7 }}
              style={{ transform: 'translateX(-50%)' }}
            >
              🛵
            </motion.span>
          </div>
          <p className="mt-6 text-sm text-warm-canvas/70">
            ETA <span className="font-semibold text-warm-canvas">{order.etaMinutes} mins</span> from order placed
          </p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-6">
            <div className="rounded-3xl bg-white p-6 ring-1 ring-deep-ink/5">
              <p className="font-display text-lg uppercase">Delivery Partner</p>
              {partnerAssigned ? (
                <div className="mt-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-soft-lavender/40 text-lg">
                      🛵
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{DELIVERY_PARTNER.name}</p>
                      <p className="text-xs text-muted-ink">
                        ⭐ {DELIVERY_PARTNER.rating} · {DELIVERY_PARTNER.vehicle}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`tel:${DELIVERY_PARTNER.phone}`}
                    className="flex h-10 items-center rounded-full bg-deep-ink px-4 text-xs font-bold text-warm-canvas transition-colors hover:bg-chili-red"
                  >
                    Call Rider
                  </a>
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-ink">We're assigning a rider — check back in a moment.</p>
              )}
            </div>

            <div className="rounded-3xl bg-white p-6 ring-1 ring-deep-ink/5">
              <p className="font-display text-lg uppercase">Items</p>
              <ul className="mt-4 flex flex-col gap-3">
                {order.items.map((item) => (
                  <li key={item.lineId} className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="h-14 w-14 rounded-xl object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {item.quantity}× {item.name}
                      </p>
                      {(item.sizeLabel || item.addOnNames.length > 0) && (
                        <p className="truncate text-xs text-muted-ink">
                          {[item.sizeLabel, ...item.addOnNames].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-semibold">₹{item.unitPrice * item.quantity}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-between border-t border-deep-ink/10 pt-4 font-display text-lg">
                <span>Total</span>
                <span>₹{order.total}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" onClick={handleReorder} className="flex-1 justify-center">
                Reorder →
              </Button>
              <a
                href="mailto:support@spicyeat.com"
                className="flex flex-1 items-center justify-center rounded-full border border-deep-ink/15 px-6 py-3.5 text-sm font-semibold transition-colors hover:border-deep-ink/40"
              >
                Get Help
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-3xl bg-white p-6 ring-1 ring-deep-ink/5">
              <p className="font-display text-lg uppercase">Delivery Details</p>
              <div className="mt-4 flex flex-col gap-3 text-sm">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-ink">Address</p>
                  <p className="mt-1">
                    {order.address.name} · {order.address.line1}, {order.address.city} {order.address.pincode}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-ink">Payment</p>
                  <p className="mt-1">{PAYMENT_LABELS[order.paymentMethod]}</p>
                </div>
                {order.specialInstructions && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-ink">Instructions</p>
                    <p className="mt-1">{order.specialInstructions}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
