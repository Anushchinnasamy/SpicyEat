interface Props {
  subtotal: number
  deliveryFee?: number
  discount?: number
}

export function OrderSummary({ subtotal, deliveryFee = 40, discount = 0 }: Props) {
  const total = subtotal + deliveryFee - discount

  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-deep-ink/5">
      <p className="font-display text-xl uppercase">Order Summary</p>
      <div className="mt-4 flex flex-col gap-2 text-sm">
        <div className="flex justify-between text-muted-ink">
          <span>Subtotal</span>
          <span>₹{subtotal}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-herb-green">
            <span>Savings</span>
            <span>-₹{discount}</span>
          </div>
        )}
        <div className="flex justify-between text-muted-ink">
          <span>Delivery fee</span>
          <span>₹{deliveryFee}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-deep-ink/10 pt-3 font-display text-lg">
          <span>Total</span>
          <span>₹{total}</span>
        </div>
      </div>
    </div>
  )
}
