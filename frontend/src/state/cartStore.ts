import { create } from 'zustand'
import { addToCart, clearCartOnServer, getCart, removeCartItem, updateCartItem, type CartItemResponse } from '../api/cart'
import { fetchApi } from '../api/client'
import { SPICE_LEVEL_FROM_BACKEND, type MenuItemResponse } from '../api/menuMapper'
import { useAuthStore } from './authStore'
import { toast } from './toastStore'
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
  loaded: boolean
  refresh: () => Promise<void>
  addItem: (input: AddToCartInput) => Promise<void>
  removeItem: (lineId: string) => Promise<void>
  setQuantity: (lineId: string, quantity: number) => Promise<void>
  clear: () => Promise<void>
}

// Cart items only carry menuItemId + name server-side; image and spice level
// are display-only concerns owned by menu-service, so they're looked up here
// from a full menu fetch rather than duplicated into the cart's own schema.
let menuCache: Map<string, MenuItemResponse> | null = null
async function loadMenuCache(): Promise<Map<string, MenuItemResponse>> {
  if (!menuCache) {
    const items = await fetchApi<MenuItemResponse[]>('/api/menu')
    menuCache = new Map(items.map((i) => [i.id, i]))
  }
  return menuCache
}

async function toLineItems(items: CartItemResponse[]): Promise<CartLineItem[]> {
  const menu = await loadMenuCache()
  return items.map((item) => {
    const menuItem = menu.get(item.menuItemId)
    return {
      lineId: item.id,
      foodId: item.menuItemId,
      name: item.itemName,
      image: menuItem?.imageUrl ?? '',
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      spiceLevel: (menuItem ? SPICE_LEVEL_FROM_BACKEND[menuItem.spiceLevel] : undefined) ?? 1,
      addOnNames: item.addons.map((a) => a.name),
    }
  })
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],
  loaded: false,

  refresh: async () => {
    const cart = await getCart()
    set({ items: await toLineItems(cart.items), loaded: true })
  },

  addItem: async ({ food, quantity, addOns = [] }) => {
    if (!useAuthStore.getState().accessToken) {
      toast.error('Log in to add items to your cart')
      return
    }
    try {
      const cart = await addToCart(
        food.id,
        quantity,
        addOns.map((a) => a.id),
      )
      set({ items: await toLineItems(cart.items), loaded: true })
      toast.success(`${food.name} added to cart`)
    } catch {
      toast.error('Could not add item to cart')
    }
  },

  removeItem: async (lineId) => {
    const cart = await removeCartItem(lineId)
    set({ items: await toLineItems(cart.items), loaded: true })
  },

  setQuantity: async (lineId, quantity) => {
    if (quantity <= 0) {
      await get().removeItem(lineId)
      return
    }
    const cart = await updateCartItem(lineId, quantity)
    set({ items: await toLineItems(cart.items), loaded: true })
  },

  clear: async () => {
    await clearCartOnServer()
    set({ items: [], loaded: true })
  },
}))

export function cartItemCount(items: CartLineItem[]) {
  return items.reduce((sum, i) => sum + i.quantity, 0)
}

export function cartSubtotal(items: CartLineItem[]) {
  return items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
}
