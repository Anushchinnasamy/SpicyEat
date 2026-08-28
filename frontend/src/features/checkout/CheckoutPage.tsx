import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../../components/layout/PageShell'
import { EditorialHeading } from '../../components/typography/EditorialHeading'
import { EmptyState, LoadingState } from '../../components/feedback/States'
import { LinkButton, Button } from '../../components/buttons/Button'
import { Input } from '../../components/forms/Input'
import { OrderSummary } from '../../components/cart/OrderSummary'
import { useCartStore, cartSubtotal } from '../../state/cartStore'
import { fetchAddresses, createAddress, type AddressResponse } from '../../api/addresses'
import { placeOrder } from '../../api/realOrder'
import { createPayment } from '../../api/payments'
import { PaymentStep } from './PaymentStep'

interface PendingPayment {
  orderId: string
  paymentId: string
  clientSecret: string
  amount: number
}

export function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const clear = useCartStore((s) => s.clear)
  const navigate = useNavigate()

  const [addresses, setAddresses] = useState<AddressResponse[] | null>(null)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [showNewAddress, setShowNewAddress] = useState(false)
  const [label, setLabel] = useState('Home')
  const [line1, setLine1] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [savingAddress, setSavingAddress] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null)

  const subtotal = cartSubtotal(items)

  useEffect(() => {
    fetchAddresses().then((list) => {
      setAddresses(list)
      const preferred = list.find((a) => a.isDefault) ?? list[0]
      setSelectedAddressId(preferred?.id ?? null)
      setShowNewAddress(list.length === 0)
    })
  }, [])

  if (items.length === 0 && !pendingPayment) {
    return (
      <PageShell>
        <EmptyState
          title="This feels a little too healthy."
          subtitle="Your cart is empty. Add something spicy before checking out."
          action={
            <LinkButton to="/menu" className="mt-2">
              Explore Menu →
            </LinkButton>
          }
        />
      </PageShell>
    )
  }

  if (pendingPayment) {
    return (
      <PageShell hideFooter>
        <div className="mx-auto max-w-lg px-5 pb-32 pt-12 lg:px-10">
          <EditorialHeading lines={['Pay for your order.']} size="lg" />
          <div className="mt-10 rounded-2xl bg-white p-6 ring-1 ring-deep-ink/5">
            <PaymentStep
              clientSecret={pendingPayment.clientSecret}
              paymentId={pendingPayment.paymentId}
              amount={pendingPayment.amount}
              onSuccess={handlePaymentSuccess}
            />
          </div>
        </div>
      </PageShell>
    )
  }

  async function handleSaveAddress(e: React.FormEvent) {
    e.preventDefault()
    setSavingAddress(true)
    setError(null)
    try {
      const created = await createAddress({
        label,
        line1,
        city,
        state,
        postalCode,
        isDefault: (addresses?.length ?? 0) === 0,
      })
      setAddresses((prev) => [...(prev ?? []), created])
      setSelectedAddressId(created.id)
      setShowNewAddress(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save that address. Try again.')
    } finally {
      setSavingAddress(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedAddressId) return
    setPlacing(true)
    setError(null)
    try {
      const order = await placeOrder(selectedAddressId)
      const payment = await createPayment(order.id, order.total)
      if (!payment.clientSecret) {
        throw new Error('Payment could not be started. Please try again.')
      }
      setPendingPayment({ orderId: order.id, paymentId: payment.id, clientSecret: payment.clientSecret, amount: order.total })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something got a little too hot. Try again.')
    } finally {
      setPlacing(false)
    }
  }

  async function handlePaymentSuccess() {
    if (!pendingPayment) return
    await clear()
    navigate(`/order-confirmed/${pendingPayment.orderId}`)
  }

  return (
    <PageShell hideFooter>
      <form onSubmit={handleSubmit} className="mx-auto max-w-7xl px-5 pb-32 pt-12 lg:px-10 lg:pb-16">
        <EditorialHeading lines={['Almost there.']} size="lg" />

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-8">
            <section>
              <p className="font-display text-xl uppercase">Delivery Address</p>

              {addresses === null && <LoadingState />}

              {addresses !== null && addresses.length > 0 && !showNewAddress && (
                <div className="mt-4 flex flex-col gap-3">
                  {addresses.map((a) => (
                    <label
                      key={a.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3.5 text-sm transition-colors ${
                        selectedAddressId === a.id ? 'border-sun-orange bg-sun-orange/10' : 'border-deep-ink/15'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        className="mt-1 accent-sun-orange"
                        checked={selectedAddressId === a.id}
                        onChange={() => setSelectedAddressId(a.id)}
                      />
                      <span>
                        <span className="block font-semibold">{a.label}</span>
                        <span className="block text-muted-ink">
                          {a.line1}
                          {a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} {a.postalCode}
                        </span>
                      </span>
                    </label>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowNewAddress(true)}
                    className="self-start text-sm font-semibold text-sun-orange hover:underline"
                  >
                    + Add a new address
                  </button>
                </div>
              )}

              {addresses !== null && showNewAddress && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Input icon="🏷️" required placeholder="Label, e.g. Home" value={label} onChange={(e) => setLabel(e.target.value)} />
                  <Input
                    icon="📍"
                    required
                    placeholder="Address, area"
                    className="sm:col-span-2"
                    value={line1}
                    onChange={(e) => setLine1(e.target.value)}
                  />
                  <Input icon="🏙️" required placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
                  <Input icon="🗺️" required placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
                  <Input
                    icon="🔢"
                    required
                    placeholder="Postal code"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                  />
                  <div className="flex items-center gap-3 sm:col-span-2">
                    <Button type="button" onClick={handleSaveAddress} disabled={savingAddress}>
                      {savingAddress ? 'Saving...' : 'Save Address'}
                    </Button>
                    {addresses.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowNewAddress(false)}
                        className="text-sm font-semibold text-muted-ink hover:underline"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}
            </section>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-2xl bg-white p-6 ring-1 ring-deep-ink/5">
              <p className="font-display text-lg uppercase">
                {items.reduce((n, i) => n + i.quantity, 0)} item{items.length > 1 ? 's' : ''}
              </p>
              <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-ink">
                {items.map((item) => (
                  <li key={item.lineId} className="flex justify-between gap-2">
                    <span className="truncate">
                      {item.quantity}× {item.name}
                    </span>
                    <span className="shrink-0">₹{item.unitPrice * item.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>

            <OrderSummary subtotal={subtotal} deliveryFee={0} discount={0} />

            {error && <p className="text-sm text-chili-red">{error}</p>}

            <Button type="submit" disabled={placing || !selectedAddressId} className="w-full justify-center">
              {placing ? 'Cooking something good...' : 'Place Order'}
              {!placing && <span aria-hidden>→</span>}
            </Button>
            <p className="text-center text-xs text-muted-ink">Payment happens after the order is placed.</p>
          </div>
        </div>
      </form>
    </PageShell>
  )
}
