import { fetchApi } from './client'

export interface CartItemAddonResponse {
  id: string
  addonId: string
  name: string
  price: number
}

export interface CartItemResponse {
  id: string
  menuItemId: string
  itemName: string
  unitPrice: number
  quantity: number
  addons: CartItemAddonResponse[]
  lineTotal: number
}

export interface CartResponse {
  userId: string
  items: CartItemResponse[]
  subtotal: number
}

export function getCart(): Promise<CartResponse> {
  return fetchApi<CartResponse>('/api/cart')
}

export function addToCart(menuItemId: string, quantity: number, addonIds: string[] = []): Promise<CartResponse> {
  return fetchApi<CartResponse>('/api/cart/items', {
    method: 'POST',
    body: JSON.stringify({ menuItemId, quantity, addonIds }),
  })
}

export function updateCartItem(cartItemId: string, quantity: number): Promise<CartResponse> {
  return fetchApi<CartResponse>(`/api/cart/items/${cartItemId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  })
}

export function removeCartItem(cartItemId: string): Promise<CartResponse> {
  return fetchApi<CartResponse>(`/api/cart/items/${cartItemId}`, { method: 'DELETE' })
}

export function clearCartOnServer(): Promise<void> {
  return fetchApi<void>('/api/cart', { method: 'DELETE' })
}
