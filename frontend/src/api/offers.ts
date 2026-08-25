import { apiRequest } from './client'

export interface Offer {
  code: string
  title: string
  description: string
  terms: string
  accent: 'orange' | 'lavender' | 'dark'
}

export const offers: Offer[] = [
  {
    code: 'SPICY40',
    title: '20% Off',
    description: 'On your entire order, no minimum spend.',
    terms: 'Max discount ₹150. Valid once per account.',
    accent: 'orange',
  },
  {
    code: 'FREESHIP',
    title: 'Free Delivery',
    description: 'Zero delivery fee on your next order.',
    terms: 'Valid on orders above ₹199.',
    accent: 'lavender',
  },
  {
    code: 'COMBO20',
    title: 'Combo Deals',
    description: 'Bundle a main with sides or a drink and save.',
    terms: 'Applies automatically at checkout on eligible combos.',
    accent: 'dark',
  },
  {
    code: 'WELCOME50',
    title: 'First Order',
    description: 'Half off your very first SpicyEat order.',
    terms: 'New accounts only. Max discount ₹150.',
    accent: 'orange',
  },
  {
    code: 'WEEKENDHEAT',
    title: 'Weekend Heat',
    description: 'Extra spicy savings, Friday through Sunday.',
    terms: 'Valid Fri-Sun. Cannot be combined with other codes.',
    accent: 'lavender',
  },
]

export function fetchOffers() {
  return apiRequest(() => offers)
}
