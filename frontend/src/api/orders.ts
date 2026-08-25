import { apiRequest } from './client'
import { cartSubtotal } from '../state/cartStore'
import type { CartLineItem, DeliveryOption, Order, OrderAddress, OrderStatus, PaymentMethod } from '../types'

const ORDERS_KEY = 'spicyeat-orders'

function readOrders(): Order[] {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) ?? '[]')
  } catch {
    return []
  }
}

function writeOrders(orders: Order[]) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders))
}

const DELIVERY_FEES: Record<DeliveryOption, number> = {
  standard: 40,
  express: 79,
}

const ETA_MINUTES: Record<DeliveryOption, number> = {
  standard: 35,
  express: 20,
}

export interface PlaceOrderInput {
  items: CartLineItem[]
  address: OrderAddress
  deliveryOption: DeliveryOption
  paymentMethod: PaymentMethod
  couponCode?: string
  specialInstructions?: string
  discount: number
}

export function placeOrder(input: PlaceOrderInput) {
  return apiRequest(() => {
    const subtotal = cartSubtotal(input.items)
    const deliveryFee = DELIVERY_FEES[input.deliveryOption]
    const total = Math.max(subtotal + deliveryFee - input.discount, 0)

    const order: Order = {
      id: `SE${Date.now().toString().slice(-8)}`,
      items: input.items,
      subtotal,
      deliveryFee,
      discount: input.discount,
      total,
      address: input.address,
      deliveryOption: input.deliveryOption,
      paymentMethod: input.paymentMethod,
      couponCode: input.couponCode,
      specialInstructions: input.specialInstructions,
      status: 'CONFIRMED',
      placedAt: new Date().toISOString(),
      etaMinutes: ETA_MINUTES[input.deliveryOption],
    }

    const orders = readOrders()
    orders.unshift(order)
    writeOrders(orders)
    return order
  }, 900)
}

export function fetchOrder(id: string) {
  return apiRequest(() => readOrders().find((o) => o.id === id) ?? null)
}

export function fetchOrders() {
  return apiRequest(() => readOrders())
}

export function updateOrderStatus(id: string, status: OrderStatus) {
  return apiRequest(() => {
    const orders = readOrders()
    const order = orders.find((o) => o.id === id)
    if (order) {
      order.status = status
      writeOrders(orders)
    }
    return order ?? null
  }, 300)
}

export interface OrderEditInput {
  address: OrderAddress
  deliveryOption: DeliveryOption
  paymentMethod: PaymentMethod
}

export function updateOrder(id: string, input: OrderEditInput) {
  return apiRequest(() => {
    const orders = readOrders()
    const order = orders.find((o) => o.id === id)
    if (order) {
      order.address = input.address
      order.deliveryOption = input.deliveryOption
      order.paymentMethod = input.paymentMethod
      order.deliveryFee = DELIVERY_FEES[input.deliveryOption]
      order.total = Math.max(order.subtotal + order.deliveryFee - order.discount, 0)
      order.etaMinutes = ETA_MINUTES[input.deliveryOption]
      writeOrders(orders)
    }
    return order ?? null
  }, 300)
}

export function deleteOrder(id: string) {
  return apiRequest(() => {
    writeOrders(readOrders().filter((o) => o.id !== id))
    return true
  }, 300)
}

// --- Delivery partner actions ---

export function fetchAvailableOrders() {
  return apiRequest(() => readOrders().filter((o) => o.status === 'READY' && !o.assignedPartnerId))
}

export function fetchPartnerOrders(partnerId: string) {
  return apiRequest(() => readOrders().filter((o) => o.assignedPartnerId === partnerId))
}

export function acceptOrder(id: string, partnerId: string, partnerName: string) {
  return apiRequest(() => {
    const orders = readOrders()
    const order = orders.find((o) => o.id === id)
    if (order && !order.assignedPartnerId) {
      order.assignedPartnerId = partnerId
      order.assignedPartnerName = partnerName
      order.status = 'ASSIGNED'
      writeOrders(orders)
    }
    return order ?? null
  }, 300)
}

export function markPickedUp(id: string) {
  return updateOrderStatus(id, 'OUT_FOR_DELIVERY')
}

export function markDelivered(id: string) {
  return updateOrderStatus(id, 'DELIVERED')
}
