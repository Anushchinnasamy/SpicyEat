import { fetchApi } from './client'

export type RealOrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'

export interface RealAddressSnapshot {
  label: string
  line1: string
  line2: string | null
  city: string
  state: string
  postalCode: string
}

export interface RealOrderItem {
  id: string
  menuItemId: string
  itemName: string
  unitPrice: number
  quantity: number
  lineTotal: number
  addons: { id: string; addonId: string; name: string; price: number }[]
}

export interface RealOrder {
  id: string
  userId: string
  status: RealOrderStatus
  deliveryAddress: RealAddressSnapshot
  items: RealOrderItem[]
  subtotal: number
  discount: number
  deliveryFee: number
  tax: number
  total: number
  cancelReason: string | null
  createdAt: string
  updatedAt: string
}

export function placeOrder(addressId: string): Promise<RealOrder> {
  return fetchApi<RealOrder>('/api/orders', {
    method: 'POST',
    body: JSON.stringify({ addressId }),
  })
}

export function fetchOrder(id: string): Promise<RealOrder> {
  return fetchApi<RealOrder>(`/api/orders/${id}`)
}

export function fetchOrders(): Promise<RealOrder[]> {
  return fetchApi<RealOrder[]>('/api/orders')
}

export function cancelOrder(id: string, reason?: string): Promise<RealOrder> {
  return fetchApi<RealOrder>(`/api/orders/${id}/cancel`, {
    method: 'POST',
    body: reason ? JSON.stringify({ reason }) : undefined,
  })
}
