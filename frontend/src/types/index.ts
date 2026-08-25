export type SpiceLevel = 1 | 2 | 3 | 4

export const SPICE_LABELS: Record<SpiceLevel, { label: string; hint: string }> = {
  1: { label: 'Mild', hint: 'A little heat' },
  2: { label: 'Hot', hint: 'Getting serious' },
  3: { label: 'Fire', hint: 'No mercy' },
  4: { label: 'Insane', hint: 'Call your mom' },
}

export type CategorySlug =
  | 'burgers'
  | 'fried-chicken'
  | 'pizza'
  | 'wraps-rolls'
  | 'loaded'
  | 'pasta'
  | 'sides'
  | 'desserts'

export interface Category {
  slug: CategorySlug
  name: string
  image: string
  itemCount: number
}

export interface SizeOption {
  id: string
  label: string
  price: number
}

export interface AddOn {
  id: string
  name: string
  price: number
}

export interface Food {
  id: string
  slug: string
  name: string
  tagline: string
  description: string
  categorySlug: CategorySlug
  price: number
  spiceLevel: SpiceLevel
  isVeg: boolean
  rating: number
  reviewCount: number
  bestseller: boolean
  images: string[]
  sizes?: SizeOption[]
  addOns?: AddOn[]
}

export interface CartLineItem {
  lineId: string
  foodId: string
  name: string
  image: string
  unitPrice: number
  quantity: number
  spiceLevel: SpiceLevel
  sizeLabel?: string
  addOnNames: string[]
}

export interface User {
  id: string
  name: string
  email: string
}

export type PaymentMethod = 'card' | 'upi' | 'cod'
export type DeliveryOption = 'standard' | 'express'

export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'ASSIGNED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'

export interface OrderAddress {
  name: string
  phone: string
  line1: string
  city: string
  pincode: string
}

export interface Order {
  id: string
  items: CartLineItem[]
  subtotal: number
  deliveryFee: number
  discount: number
  total: number
  address: OrderAddress
  deliveryOption: DeliveryOption
  paymentMethod: PaymentMethod
  couponCode?: string
  specialInstructions?: string
  status: OrderStatus
  placedAt: string
  etaMinutes: number
  assignedPartnerId?: string
  assignedPartnerName?: string
}

export interface ApiResult<T> {
  data: T
}
