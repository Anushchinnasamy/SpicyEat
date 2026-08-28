import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageShell } from '../../components/layout/PageShell'
import { LoadingState, ErrorState } from '../../components/feedback/States'
import { LinkButton, Button } from '../../components/buttons/Button'
import { fetchOrder, type RealOrder, type RealOrderStatus } from '../../api/realOrder'
import { addToCart } from '../../api/cart'
import { useCartStore } from '../../state/cartStore'
import { useReducedMotion } from '../../hooks/useReducedMotion'

const STATUS_ORDER: RealOrderStatus[] = [
  'PLACED',
  'CONFIRMED',
  'PREPARING',
  'READY_FOR_PICKUP',
  'ASSIGNED',
  'PICKED_UP',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
]

const STATUS_COPY: Record<RealOrderStatus, { headline: string; subtitle: string }> = {
  PLACED: { headline: 'Order Placed!', subtitle: 'Sending this over to the kitchen.' },
  CONFIRMED: { headline: 'Order Confirmed!', subtitle: 'Your cravings are officially in motion.' },
  PREPARING: { headline: 'Preparing Your Order!', subtitle: 'Fresh off the fire, coming right up.' },
  READY_FOR_PICKUP: { headline: 'Ready for Pickup!', subtitle: 'Boxed up and waiting on a rider.' },
  ASSIGNED: { headline: 'Rider Assigned!', subtitle: 'A rider is grabbing your order now.' },
  PICKED_UP: { headline: 'Picked Up!', subtitle: 'Your order is heading your way.' },
  OUT_FOR_DELIVERY: { headline: 'On The Way!', subtitle: 'Almost there. Hang tight.' },
  DELIVERED: { headline: 'Delivered!', subtitle: 'Enjoy. You earned this.' },
  CANCELLED: { headline: 'Order Cancelled', subtitle: 'This order was cancelled.' },
}

export function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<RealOrder | null | undefined>(undefined)
  const [reordering, setReordering] = useState(false)
  const reducedMotion = useReducedMotion()
  const navigate = useNavigate()

  useEffect(() => {
    if (!id) return
    fetchOrder(id)
      .then(setOrder)
      .catch(() => setOrder(null))
  }, [id])

  if (order === undefined) {
    return (
      <PageShell>
        <LoadingState />
      </PageShell>
    )
  }

  if (order === null) {
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

  const status = order.status
  const cancelled = status === 'CANCELLED'
  const statusIndex = STATUS_ORDER.indexOf(status)
  const partnerAssigned = statusIndex >= STATUS_ORDER.indexOf('ASSIGNED')
  const routeProgress = cancelled ? 0 : Math.min(statusIndex / (STATUS_ORDER.length - 1), 1)

  async function handleReorder() {
    if (!order) return
    setReordering(true)
    try {
      for (const item of order.items) {
        await addToCart(
          item.menuItemId,
          item.quantity,
          item.addons.map((a) => a.addonId),
        )
      }
      await useCartStore.getState().refresh()
      navigate('/cart')
    } finally {
      setReordering(false)
    }
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl px-5 py-12 lg:px-10">
        <motion.div
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

        {!cancelled && (
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
              {partnerAssigned ? 'A rider has been assigned to your order.' : 'Waiting on kitchen and rider assignment.'}
            </p>
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-6">
            <div className="rounded-3xl bg-white p-6 ring-1 ring-deep-ink/5">
              <p className="font-display text-lg uppercase">Items</p>
              <ul className="mt-4 flex flex-col gap-3">
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {item.quantity}× {item.itemName}
                      </p>
                      {item.addons.length > 0 && (
                        <p className="truncate text-xs text-muted-ink">
                          {item.addons.map((a) => a.name).join(' · ')}
                        </p>
                      )}
                    </div>
                    <span className="text-sm font-semibold">₹{item.lineTotal}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-between border-t border-deep-ink/10 pt-4 font-display text-lg">
                <span>Total</span>
                <span>₹{order.total}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="outline" onClick={handleReorder} disabled={reordering} className="flex-1 justify-center">
                {reordering ? 'Adding to cart...' : 'Reorder →'}
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
                    {order.deliveryAddress.label} · {order.deliveryAddress.line1}, {order.deliveryAddress.city}{' '}
                    {order.deliveryAddress.postalCode}
                  </p>
                </div>
                {order.cancelReason && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-ink">Cancel reason</p>
                    <p className="mt-1">{order.cancelReason}</p>
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
