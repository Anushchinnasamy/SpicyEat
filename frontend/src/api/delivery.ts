import { fetchApi } from './client'

export type DeliveryStatus = 'UNASSIGNED' | 'ASSIGNED' | 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED'

export interface DeliveryAddress {
  label: string
  line1: string
  line2: string | null
  city: string
  state: string
  postalCode: string
}

export interface DeliveryOrderItem {
  itemName: string
  quantity: number
  unitPrice: number
}

export interface RealDelivery {
  id: string
  orderId: string
  status: DeliveryStatus
  partnerId: string | null
  assignedAt: string | null
  pickedUpAt: string | null
  deliveredAt: string | null
  createdAt: string
  updatedAt: string
  deliveryAddress: DeliveryAddress | null
  items: DeliveryOrderItem[] | null
  orderTotal: number | null
}

export interface RealEarning {
  id: string
  deliveryId: string
  amount: number
  createdAt: string
}

export function fetchAvailableDeliveries(): Promise<RealDelivery[]> {
  return fetchApi<RealDelivery[]>('/api/delivery/available')
}

export function fetchActiveDeliveries(): Promise<RealDelivery[]> {
  return fetchApi<RealDelivery[]>('/api/delivery/active')
}

export function fetchDeliveryHistory(): Promise<RealDelivery[]> {
  return fetchApi<RealDelivery[]>('/api/delivery/history')
}

export function fetchEarningsList(): Promise<RealEarning[]> {
  return fetchApi<RealEarning[]>('/api/delivery/earnings')
}

export function acceptDelivery(id: string): Promise<RealDelivery> {
  return fetchApi<RealDelivery>(`/api/delivery/${id}/accept`, { method: 'POST' })
}

export function pickupDelivery(id: string): Promise<RealDelivery> {
  return fetchApi<RealDelivery>(`/api/delivery/${id}/pickup`, { method: 'POST' })
}

export function startDelivery(id: string): Promise<RealDelivery> {
  return fetchApi<RealDelivery>(`/api/delivery/${id}/start`, { method: 'POST' })
}

export function completeDelivery(id: string): Promise<RealDelivery> {
  return fetchApi<RealDelivery>(`/api/delivery/${id}/complete`, { method: 'POST' })
}
