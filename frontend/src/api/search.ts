import { apiRequest } from './client'
import { foods } from './mock/foods'

export function searchFoods(query: string) {
  const q = query.trim().toLowerCase()
  return apiRequest(() => {
    if (!q) return []
    return foods.filter(
      (f) => f.name.toLowerCase().includes(q) || f.categorySlug.replace('-', ' ').includes(q),
    )
  })
}

export const popularSearches = [
  'Fire Smash Burger',
  'Nashville Hot Chicken',
  'Pepperoni Pizza',
  'Loaded Cheese Fries',
  'Chocolate Lava Cake',
]
