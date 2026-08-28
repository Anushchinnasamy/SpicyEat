import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PageShell } from '../../components/layout/PageShell'
import { EditorialHeading } from '../../components/typography/EditorialHeading'
import { LinkButton } from '../../components/buttons/Button'
import { LoadingState, ErrorState } from '../../components/feedback/States'
import { fetchOrder, type RealOrder } from '../../api/realOrder'

export function OrderConfirmedPage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<RealOrder | null | undefined>(undefined)

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

  return (
    <PageShell>
      <div className="mx-auto max-w-2xl px-5 py-16 text-center">
        <span className="text-5xl" aria-hidden>
          🎉
        </span>
        <EditorialHeading align="center" size="lg" lines={['Order', 'Confirmed!']} accentLine={1} className="mt-4" />
        <p className="mt-4 text-muted-ink">Your cravings are officially in motion.</p>

        <div className="mt-10 rounded-3xl bg-white p-6 text-left ring-1 ring-deep-ink/5 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-deep-ink/10 pb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-ink">Order ID</p>
              <p className="font-display text-lg">{order.id}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-ink">Status</p>
              <p className="font-display text-lg text-sun-orange">{order.status}</p>
            </div>
          </div>

          <ul className="mt-4 flex flex-col gap-2 border-b border-deep-ink/10 pb-4 text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-2 text-muted-ink">
                <span className="truncate">
                  {item.quantity}× {item.itemName}
                </span>
                <span className="shrink-0 text-deep-ink">₹{item.lineTotal}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-col gap-2 border-b border-deep-ink/10 pb-4 text-sm">
            <div className="flex justify-between text-muted-ink">
              <span>Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-herb-green">
                <span>Savings</span>
                <span>-₹{order.discount}</span>
              </div>
            )}
            <div className="flex justify-between text-muted-ink">
              <span>Delivery fee</span>
              <span>₹{order.deliveryFee}</span>
            </div>
            <div className="flex justify-between font-display text-lg text-deep-ink">
              <span>Total</span>
              <span>₹{order.total}</span>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-ink">Deliver to</p>
            <p className="mt-1 text-sm">
              {order.deliveryAddress.label} · {order.deliveryAddress.line1}, {order.deliveryAddress.city}{' '}
              {order.deliveryAddress.postalCode}
            </p>
          </div>
        </div>

        <LinkButton to={`/orders/${order.id}`} className="mt-8">
          View Order →
        </LinkButton>
      </div>
    </PageShell>
  )
}
