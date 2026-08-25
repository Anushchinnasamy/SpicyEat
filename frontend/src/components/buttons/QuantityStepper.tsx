interface Props {
  quantity: number
  onChange: (next: number) => void
  min?: number
}

export function QuantityStepper({ quantity, onChange, min = 1 }: Props) {
  return (
    <div className="inline-flex items-center gap-4 rounded-full border border-deep-ink/15 px-2 py-1.5">
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(min - 1, quantity - 1))}
        className="flex h-8 w-8 items-center justify-center rounded-full text-lg font-semibold hover:bg-deep-ink/5 disabled:opacity-30"
        disabled={quantity <= min}
      >
        &minus;
      </button>
      <span className="w-4 text-center font-semibold tabular-nums">{quantity}</span>
      <button
        type="button"
        aria-label="Increase quantity"
        onClick={() => onChange(quantity + 1)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-lg font-semibold hover:bg-deep-ink/5"
      >
        +
      </button>
    </div>
  )
}
