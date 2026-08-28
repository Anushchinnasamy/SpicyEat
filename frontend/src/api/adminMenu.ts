import { fetchApi } from './client'
import {
  categoryCodeFromSlug,
  categorySlugFromCode,
  SPICE_LEVEL_TO_BACKEND,
  toFood,
  type CategoryResponse,
  type MenuItemResponse,
} from './menuMapper'
import type { CategorySlug, Food, SpiceLevel } from '../types'

async function loadCategories(): Promise<CategoryResponse[]> {
  return fetchApi<CategoryResponse[]>('/api/menu/categories')
}

function categoryIdFor(categories: CategoryResponse[], slug: CategorySlug): string {
  const code = categoryCodeFromSlug(slug)
  const match = categories.find((c) => c.code === code)
  if (!match) throw new Error(`No category found for ${slug}`)
  return match.id
}

export async function fetchAdminFoods(): Promise<{ data: Food[] }> {
  const [categories, items] = await Promise.all([
    loadCategories(),
    fetchApi<MenuItemResponse[]>('/api/menu'),
  ])
  const categoryById = new Map(categories.map((c) => [c.id, c.code]))
  const foods = items.map((item) => toFood(item, categoryById.get(item.categoryId) ?? 'BURGERS'))
  return { data: foods }
}

export interface FoodInput {
  name: string
  description: string
  categorySlug: CategorySlug
  price: number
  spiceLevel: SpiceLevel
  isVeg: boolean
  image: string
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function toMenuItemRequest(input: FoodInput) {
  const categories = await loadCategories()
  return {
    categoryId: categoryIdFor(categories, input.categorySlug),
    name: input.name,
    slug: slugify(input.name),
    description: input.description,
    price: input.price,
    spiceLevel: SPICE_LEVEL_TO_BACKEND[input.spiceLevel],
    vegetarian: input.isVeg,
    imageUrl: input.image || null,
    displayOrder: 0,
  }
}

export async function createFood(input: FoodInput): Promise<Food> {
  const body = await toMenuItemRequest(input)
  const item = await fetchApi<MenuItemResponse>('/api/menu', { method: 'POST', body: JSON.stringify(body) })
  return toFood(item, categoryCodeFromSlug(input.categorySlug))
}

export async function updateFood(id: string, input: FoodInput): Promise<Food> {
  const body = await toMenuItemRequest(input)
  const item = await fetchApi<MenuItemResponse>(`/api/menu/${id}`, { method: 'PUT', body: JSON.stringify(body) })
  return toFood(item, categoryCodeFromSlug(input.categorySlug))
}

export async function deleteFood(id: string): Promise<void> {
  await fetchApi<void>(`/api/menu/${id}`, { method: 'DELETE' })
}

export { categorySlugFromCode }
