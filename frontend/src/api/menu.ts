import { fetchApi } from './client'
import { toFood, type CategoryResponse, type MenuItemResponse } from './menuMapper'
import type { ApiResult, CategorySlug, Food, SpiceLevel } from '../types'

export interface MenuFilters {
  category?: CategorySlug | 'all'
  vegOnly?: boolean
  maxSpice?: SpiceLevel
}

let categoriesCache: CategoryResponse[] | null = null

async function loadCategories(): Promise<CategoryResponse[]> {
  if (!categoriesCache) {
    categoriesCache = await fetchApi<CategoryResponse[]>('/api/menu/categories')
  }
  return categoriesCache
}

function categoryCodeById(categories: CategoryResponse[], categoryId: string): string {
  return categories.find((c) => c.id === categoryId)?.code ?? 'BURGERS'
}

async function toFoods(items: MenuItemResponse[]): Promise<Food[]> {
  const categories = await loadCategories()
  return items.map((item) => toFood(item, categoryCodeById(categories, item.categoryId)))
}

export async function fetchMenu(filters: MenuFilters = {}): Promise<ApiResult<Food[]>> {
  const categories = await loadCategories()
  const params = new URLSearchParams()
  if (filters.category && filters.category !== 'all') {
    const category = filters.category
    const match = categories.find((c) => slugMatches(c.code, category))
    if (match) params.set('categoryId', match.id)
  }
  const query = params.toString()
  const items = await fetchApi<MenuItemResponse[]>(`/api/menu${query ? `?${query}` : ''}`)
  let foods = await toFoods(items)
  if (filters.vegOnly) {
    foods = foods.filter((f) => f.isVeg)
  }
  if (filters.maxSpice) {
    foods = foods.filter((f) => f.spiceLevel <= filters.maxSpice!)
  }
  return { data: foods }
}

function slugMatches(code: string, slug: CategorySlug): boolean {
  return code.toLowerCase().replace(/_/g, '-') === slug
}

export async function fetchFoodBySlug(slug: string): Promise<ApiResult<Food | undefined>> {
  try {
    const item = await fetchApi<MenuItemResponse>(`/api/menu/slug/${encodeURIComponent(slug)}`)
    const categories = await loadCategories()
    return { data: toFood(item, categoryCodeById(categories, item.categoryId)) }
  } catch {
    return { data: undefined }
  }
}

export async function fetchBestsellers(limit = 4): Promise<ApiResult<Food[]>> {
  const items = await fetchApi<MenuItemResponse[]>('/api/menu')
  const foods = await toFoods(items)
  return { data: foods.filter((f) => f.bestseller).slice(0, limit) }
}

export async function fetchRelated(foodId: string, categorySlug: CategorySlug, limit = 5): Promise<ApiResult<Food[]>> {
  const items = await fetchApi<MenuItemResponse[]>('/api/menu')
  const foods = await toFoods(items)
  return { data: foods.filter((f) => f.categorySlug === categorySlug && f.id !== foodId).slice(0, limit) }
}
