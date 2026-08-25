import { apiRequest } from './client'
import { fetchPartnerOrders } from './orders'
import type { Order } from '../types'

export async function fetchActiveDelivery(partnerId: string): Promise<{ data: Order | null }> {
  const { data: orders } = await fetchPartnerOrders(partnerId)
  const active = orders.find((o) => o.status === 'ASSIGNED' || o.status === 'OUT_FOR_DELIVERY') ?? null
  return apiRequest(() => active, 150)
}

export async function fetchDeliveryHistory(partnerId: string): Promise<{ data: Order[] }> {
  const { data: orders } = await fetchPartnerOrders(partnerId)
  const delivered = orders
    .filter((o) => o.status === 'DELIVERED')
    .sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime())
  return apiRequest(() => delivered, 150)
}

export interface EarningsSummary {
  today: number
  week: number
  total: number
  deliveriesToday: number
  breakdown: { orderId: string; date: string; fee: number }[]
}

const RIDER_SHARE = 0.8

export async function fetchEarnings(partnerId: string): Promise<{ data: EarningsSummary }> {
  const { data: delivered } = await fetchDeliveryHistory(partnerId)
  const now = Date.now()
  const todayKey = new Date().toDateString()
  const weekMs = 7 * 24 * 60 * 60 * 1000

  const earn = (o: Order) => Math.round(o.deliveryFee * RIDER_SHARE)

  const today = delivered.filter((o) => new Date(o.placedAt).toDateString() === todayKey)
  const week = delivered.filter((o) => now - new Date(o.placedAt).getTime() <= weekMs)

  return apiRequest(
    () => ({
      today: today.reduce((s, o) => s + earn(o), 0),
      week: week.reduce((s, o) => s + earn(o), 0),
      total: delivered.reduce((s, o) => s + earn(o), 0),
      deliveriesToday: today.length,
      breakdown: delivered.slice(0, 20).map((o) => ({ orderId: o.id, date: o.placedAt, fee: earn(o) })),
    }),
    150,
  )
}
