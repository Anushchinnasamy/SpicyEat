import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AddOn, CartLineItem, Food, SizeOption, SpiceLevel } from '../types'

interface AddToCartInput {
  food: Food
  quantity: number
  size?: SizeOption
  addOns?: AddOn[]
  spiceLevel: SpiceLevel
}

interface CartState {
  items: CartLineItem[]
  addItem: (input: AddToCartInput) => void
  addLineItems: (items: CartLineItem[]) => void
  removeItem: (lineId: string) => void
  setQuantity: (lineId: string, quantity: number) => void
  clear: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: ({ food, quantity, size, addOns = [], spiceLevel }) => {
        const unitPrice = food.price + (size?.price ?? 0) + addOns.reduce((sum, a) => sum + a.price, 0)
        const lineId = `${food.id}-${size?.id ?? 'default'}-${addOns.map((a) => a.id).join('_')}-${Date.now()}`
        set({
          items: [
            ...get().items,
            {
              lineId,
              foodId: food.id,
              name: food.name,
              image: food.images[0],
              unitPrice,
              quantity,
              spiceLevel,
              sizeLabel: size?.label,
              addOnNames: addOns.map((a) => a.name),
            },
          ],
        })
      },
      addLineItems: (items) =>
        set({
          items: [
            ...get().items,
            ...items.map((item, i) => ({ ...item, lineId: `reorder-${Date.now()}-${i}` })),
          ],
        }),
      removeItem: (lineId) => set({ items: get().items.filter((i) => i.lineId !== lineId) }),
      setQuantity: (lineId, quantity) =>
        set({
          items:
            quantity <= 0
              ? get().items.filter((i) => i.lineId !== lineId)
              : get().items.map((i) => (i.lineId === lineId ? { ...i, quantity } : i)),
        }),
      clear: () => set({ items: [] }),
    }),
    { name: 'spicyeat-cart' },
  ),
)

export function cartItemCount(items: CartLineItem[]) {
  return items.reduce((sum, i) => sum + i.quantity, 0)
}

export function cartSubtotal(items: CartLineItem[]) {
  return items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
}
