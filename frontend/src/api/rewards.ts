import { apiRequest } from './client'

export interface CoinTransaction {
  label: string
  coins: number
  date: string
}

export interface RedeemableReward {
  title: string
  cost: number
  desc: string
}

export interface RewardsSummary {
  balance: number
  nextMilestone: number
  history: CoinTransaction[]
  redeemable: RedeemableReward[]
}

const MOCK_REWARDS: RewardsSummary = {
  balance: 340,
  nextMilestone: 500,
  history: [
    { label: 'Order SE83920145', coins: 26, date: '2026-08-21' },
    { label: 'Order SE12938475', coins: 18, date: '2026-08-14' },
    { label: 'Welcome bonus', coins: 100, date: '2026-08-01' },
    { label: 'Order SE29384756', coins: 22, date: '2026-07-27' },
  ],
  redeemable: [
    { title: 'Free Fries', cost: 150, desc: 'Redeem for a free side of classic fries.' },
    { title: '₹100 Off', cost: 300, desc: 'Flat ₹100 off your next order.' },
    { title: 'Free Dessert', cost: 250, desc: 'Any dessert on the house.' },
    { title: 'Free Delivery x3', cost: 200, desc: 'Zero delivery fee on your next 3 orders.' },
  ],
}

export function fetchRewardsSummary() {
  return apiRequest(() => MOCK_REWARDS)
}
