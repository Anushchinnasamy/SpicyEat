import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from '../../components/layout/PageShell'
import { EditorialHeading } from '../../components/typography/EditorialHeading'
import { EmptyState } from '../../components/feedback/States'
import { LinkButton, Button } from '../../components/buttons/Button'
import { Input } from '../../components/forms/Input'
import { OptionCard } from '../../components/checkout/OptionCard'
import { OrderSummary } from '../../components/cart/OrderSummary'
import { useCartStore, cartSubtotal } from '../../state/cartStore'
import { placeOrder } from '../../api/orders'
import type { DeliveryOption, PaymentMethod } from '../../types'

const DELIVERY_FEES: Record<DeliveryOption, number> = { standard: 40, express: 79 }

const COUPONS: Record<string, { label: string; compute: (subtotal: number, deliveryFee: number) => number }> = {
  SPICY40: { label: '40% off, up to ₹150', compute: (subtotal) => Math.min(Math.round(subtotal * 0.4), 150) },
  FREESHIP: { label: 'Free delivery', compute: (_subtotal, deliveryFee) => deliveryFee },
}

export function CheckoutPage() {
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clear)
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [line1, setLine1] = useState('')
  const [city, setCity] = useState('')
  const [pincode, setPincode] = useState('')
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>('standard')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [instructions, setInstructions] = useState('')
  const [placing, setPlacing] = useState(false)

  const subtotal = cartSubtotal(items)
  const deliveryFee = DELIVERY_FEES[deliveryOption]
  const discount = appliedCoupon ? COUPONS[appliedCoupon].compute(subtotal, deliveryFee) : 0

  if (items.length === 0) {
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

  function applyCoupon() {
    const code = couponInput.trim().toUpperCase()
    if (!code) return
    if (COUPONS[code]) {
      setAppliedCoupon(code)
      setCouponError(null)
    } else {
      setAppliedCoupon(null)
      setCouponError('That code isn’t valid. Try again.')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPlacing(true)
    const res = await placeOrder({
      items,
      address: { name, phone, line1, city, pincode },
      deliveryOption,
      paymentMethod,
      couponCode: appliedCoupon ?? undefined,
      specialInstructions: instructions || undefined,
      discount,
    })
    clearCart()
    navigate(`/order-confirmed/${res.data.id}`)
  }

  return (
    <PageShell hideFooter>
      <form onSubmit={handleSubmit} className="mx-auto max-w-7xl px-5 pb-32 pt-12 lg:px-10 lg:pb-16">
        <EditorialHeading lines={['Almost there.']} size="lg" />

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-8">
            <section>
              <p className="font-display text-xl uppercase">Delivery Address</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Input icon="👤" required placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
                <Input
                  icon="📱"
                  required
                  type="tel"
                  placeholder="Phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Input
                  icon="📍"
                  required
                  placeholder="Address, area"
                  className="sm:col-span-2"
                  value={line1}
                  onChange={(e) => setLine1(e.target.value)}
                />
                <Input icon="🏙️" required placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
                <Input
                  icon="🔢"
                  required
                  placeholder="Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                />
              </div>
            </section>

            <section>
              <p className="font-display text-xl uppercase">Delivery Option</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <OptionCard
                  icon="🛵"
                  title="Standard"
                  subtitle="35-45 min · ₹40"
                  selected={deliveryOption === 'standard'}
                  onSelect={() => setDeliveryOption('standard')}
                />
                <OptionCard
                  icon="⚡"
                  title="Express"
                  subtitle="15-25 min · ₹79"
                  selected={deliveryOption === 'express'}
                  onSelect={() => setDeliveryOption('express')}
                />
              </div>
            </section>

            <section>
              <p className="font-display text-xl uppercase">Payment</p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <OptionCard
                  icon="💳"
                  title="Card"
                  subtitle="Credit or debit"
                  selected={paymentMethod === 'card'}
                  onSelect={() => setPaymentMethod('card')}
                />
                <OptionCard
                  icon="📲"
                  title="UPI"
                  subtitle="Pay by any app"
                  selected={paymentMethod === 'upi'}
                  onSelect={() => setPaymentMethod('upi')}
                />
                <OptionCard
                  icon="💵"
                  title="Cash"
                  subtitle="Pay on delivery"
                  selected={paymentMethod === 'cod'}
                  onSelect={() => setPaymentMethod('cod')}
                />
              </div>
            </section>

            <section>
              <p className="font-display text-xl uppercase">Coupon</p>
              <div className="mt-4 flex gap-3">
                <Input
                  icon="🎟️"
                  placeholder="Enter code, e.g. SPICY40"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="uppercase"
                />
                <Button type="button" variant="outline" onClick={applyCoupon}>
                  Apply
                </Button>
              </div>
              {appliedCoupon && (
                <p className="mt-2 text-sm font-semibold text-herb-green">
                  {appliedCoupon} applied — {COUPONS[appliedCoupon].label}
                </p>
              )}
              {couponError && <p className="mt-2 text-sm text-chili-red">{couponError}</p>}
            </section>

            <section>
              <p className="font-display text-xl uppercase">Special Instructions</p>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Extra napkins, no onions, leave at the door..."
                rows={3}
                className="mt-4 w-full rounded-2xl border border-deep-ink/15 bg-white/60 px-4 py-3.5 text-sm outline-none placeholder:text-muted-ink/60 focus-within:border-sun-orange"
              />
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

            <OrderSummary subtotal={subtotal} deliveryFee={deliveryFee} discount={discount} />

            <Button type="submit" disabled={placing} className="w-full justify-center">
              {placing ? 'Cooking something good...' : 'Place Order'}
              {!placing && <span aria-hidden>→</span>}
            </Button>
            <p className="text-center text-xs text-muted-ink">Secure payment. Zero drama.</p>
          </div>
        </div>
      </form>
    </PageShell>
  )
}
