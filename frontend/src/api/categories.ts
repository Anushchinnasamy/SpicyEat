import { apiRequest } from './client'
import { categories } from './mock/foods'
import type { CategorySlug } from '../types'

export function fetchCategories() {
  return apiRequest(() => categories)
}

export function getCategoryBySlug(slug: CategorySlug) {
  return categories.find((c) => c.slug === slug)
}
