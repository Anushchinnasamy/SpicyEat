import { QuantityStepper } from '../buttons/QuantityStepper'
import type { CartLineItem } from '../../types'

interface Props {
  item: CartLineItem
  onQuantityChange: (quantity: number) => void
  onRemove: () => void
}

export function CartItemRow({ item, onQuantityChange, onRemove }: Props) {
  const customization = [item.sizeLabel, ...item.addOnNames].filter(Boolean).join(' · ')

  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-deep-ink/5">
      <img src={item.image} alt={item.name} className="h-20 w-20 shrink-0 rounded-xl object-cover" />
      <div className="min-w-0 flex-1">
        <p className="font-display text-lg uppercase leading-tight">{item.name}</p>
        {customization && <p className="truncate text-xs text-muted-ink">{customization}</p>}
        <p className="mt-1 font-semibold">₹{item.unitPrice * item.quantity}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <QuantityStepper quantity={item.quantity} onChange={onQuantityChange} />
        <button onClick={onRemove} className="text-xs font-semibold text-chili-red hover:underline">
          Remove
        </button>
      </div>
    </div>
  )
}
