import { apiRequest } from './client'
import { foods } from './mock/foods'
import type { CategorySlug, SpiceLevel } from '../types'

export interface MenuFilters {
  category?: CategorySlug | 'all'
  vegOnly?: boolean
  maxSpice?: SpiceLevel
}

export function fetchMenu(filters: MenuFilters = {}) {
  return apiRequest(() => {
    let items = foods
    if (filters.category && filters.category !== 'all') {
      items = items.filter((f) => f.categorySlug === filters.category)
    }
    if (filters.vegOnly) {
      items = items.filter((f) => f.isVeg)
    }
    if (filters.maxSpice) {
      items = items.filter((f) => f.spiceLevel <= filters.maxSpice!)
    }
    return items
  })
}

export function fetchFoodBySlug(slug: string) {
  return apiRequest(() => foods.find((f) => f.slug === slug))
}

export function fetchBestsellers(limit = 4) {
  return apiRequest(() => foods.filter((f) => f.bestseller).slice(0, limit))
}

export function fetchRelated(foodId: string, categorySlug: CategorySlug, limit = 5) {
  return apiRequest(() =>
    foods.filter((f) => f.categorySlug === categorySlug && f.id !== foodId).slice(0, limit),
  )
}
