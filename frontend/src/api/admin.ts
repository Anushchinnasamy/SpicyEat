import { apiRequest } from './client'
import { fetchOrders } from './orders'
import { foods } from './mock/foods'

export interface AdminCustomer {
  id: string
  name: string
  email: string
  orders: number
  totalSpend: number
  joined: string
}

export interface DeliveryPartner {
  id: string
  name: string
  vehicle: string
  rating: number
  deliveries: number
  status: 'online' | 'offline' | 'on-delivery'
}

const SEED_CUSTOMERS: AdminCustomer[] = [
  { id: 'c1', name: 'Anush Chinnasamy', email: 'anush@spicyeat.com', orders: 14, totalSpend: 4820, joined: '2026-03-12' },
  { id: 'c2', name: 'Priya Menon', email: 'priya.menon@gmail.com', orders: 22, totalSpend: 7140, joined: '2026-01-08' },
  { id: 'c3', name: 'Rahul Verma', email: 'rahul.v@outlook.com', orders: 6, totalSpend: 1980, joined: '2026-06-02' },
  { id: 'c4', name: 'Sneha Iyer', email: 'sneha.iyer@yahoo.com', orders: 31, totalSpend: 9860, joined: '2025-11-20' },
  { id: 'c5', name: 'Karthik Raja', email: 'karthik.raja@gmail.com', orders: 3, totalSpend: 890, joined: '2026-07-30' },
]

const SEED_PARTNERS: DeliveryPartner[] = [
  { id: 'd1', name: 'Arjun Kumar', vehicle: 'Bike · TN 07 AB 1234', rating: 4.8, deliveries: 412, status: 'on-delivery' },
  { id: 'd2', name: 'Vishal Singh', vehicle: 'Scooter · TN 09 CD 5678', rating: 4.6, deliveries: 298, status: 'online' },
  { id: 'd3', name: 'Deepak Nair', vehicle: 'Bike · TN 22 EF 9012', rating: 4.9, deliveries: 587, status: 'offline' },
  { id: 'd4', name: 'Manoj Pillai', vehicle: 'Bike · TN 11 GH 3456', rating: 4.7, deliveries: 231, status: 'online' },
]

const CUSTOMERS_KEY = 'spicyeat-admin-customers'
const PARTNERS_KEY = 'spicyeat-admin-partners'

function readStore<T>(key: string, seed: T[]): T[] {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(seed))
      return seed
    }
    return JSON.parse(raw)
  } catch {
    return seed
  }
}

function writeStore<T>(key: string, value: T[]) {
  localStorage.setItem(key, JSON.stringify(value))
}

// --- Customers ---

export function fetchCustomers() {
  return apiRequest(() => readStore(CUSTOMERS_KEY, SEED_CUSTOMERS))
}

export interface CustomerInput {
  name: string
  email: string
}

export function createCustomer(input: CustomerInput) {
  return apiRequest(() => {
    const customers = readStore(CUSTOMERS_KEY, SEED_CUSTOMERS)
    const customer: AdminCustomer = {
      id: `c-${Date.now()}`,
      name: input.name,
      email: input.email,
      orders: 0,
      totalSpend: 0,
      joined: new Date().toISOString().slice(0, 10),
    }
    customers.unshift(customer)
    writeStore(CUSTOMERS_KEY, customers)
    return customer
  })
}

export function updateCustomer(id: string, input: CustomerInput) {
  return apiRequest(() => {
    const customers = readStore(CUSTOMERS_KEY, SEED_CUSTOMERS)
    const existing = customers.find((c) => c.id === id)
    if (!existing) return null
    existing.name = input.name
    existing.email = input.email
    writeStore(CUSTOMERS_KEY, customers)
    return existing
  })
}

export function deleteCustomer(id: string) {
  return apiRequest(() => {
    const customers = readStore(CUSTOMERS_KEY, SEED_CUSTOMERS).filter((c) => c.id !== id)
    writeStore(CUSTOMERS_KEY, customers)
    return true
  })
}

// --- Delivery Partners ---

export function fetchDeliveryPartners() {
  return apiRequest(() => readStore(PARTNERS_KEY, SEED_PARTNERS))
}

export interface DeliveryPartnerInput {
  name: string
  vehicle: string
  rating: number
  status: DeliveryPartner['status']
}

export function createDeliveryPartner(input: DeliveryPartnerInput) {
  return apiRequest(() => {
    const partners = readStore(PARTNERS_KEY, SEED_PARTNERS)
    const partner: DeliveryPartner = {
      id: `d-${Date.now()}`,
      name: input.name,
      vehicle: input.vehicle,
      rating: input.rating,
      status: input.status,
      deliveries: 0,
    }
    partners.unshift(partner)
    writeStore(PARTNERS_KEY, partners)
    return partner
  })
}

export function updateDeliveryPartner(id: string, input: DeliveryPartnerInput) {
  return apiRequest(() => {
    const partners = readStore(PARTNERS_KEY, SEED_PARTNERS)
    const existing = partners.find((p) => p.id === id)
    if (!existing) return null
    existing.name = input.name
    existing.vehicle = input.vehicle
    existing.rating = input.rating
    existing.status = input.status
    writeStore(PARTNERS_KEY, partners)
    return existing
  })
}

export function deleteDeliveryPartner(id: string) {
  return apiRequest(() => {
    const partners = readStore(PARTNERS_KEY, SEED_PARTNERS).filter((p) => p.id !== id)
    writeStore(PARTNERS_KEY, partners)
    return true
  })
}

// --- Dashboard ---

export interface DashboardMetrics {
  ordersToday: number
  revenueToday: number
  activeOrders: number
  prepQueue: number
  activeDeliveries: number
  customers: number
  popularItems: { name: string; image: string; orders: number; price: number }[]
}

export async function fetchDashboardMetrics(): Promise<{ data: DashboardMetrics }> {
  const { data: orders } = await fetchOrders()
  const today = new Date().toDateString()
  const ordersToday = orders.filter((o) => new Date(o.placedAt).toDateString() === today)
  const active = orders.filter((o) => o.status !== 'DELIVERED')
  const customers = readStore(CUSTOMERS_KEY, SEED_CUSTOMERS)

  return apiRequest(
    () => ({
      ordersToday: ordersToday.length,
      revenueToday: ordersToday.reduce((sum, o) => sum + o.total, 0),
      activeOrders: active.length,
      prepQueue: orders.filter((o) => o.status === 'CONFIRMED' || o.status === 'PREPARING').length,
      activeDeliveries: orders.filter((o) => o.status === 'ASSIGNED' || o.status === 'OUT_FOR_DELIVERY').length,
      customers: customers.length,
      popularItems: foods
        .filter((f) => f.bestseller)
        .slice(0, 5)
        .map((f, i) => ({ name: f.name, image: f.images[0], orders: 148 - i * 21, price: f.price })),
    }),
    250,
  )
}
