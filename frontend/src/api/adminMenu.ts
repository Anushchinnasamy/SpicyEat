import { apiRequest } from './client'
import { foods as seedFoods } from './mock/foods'
import type { CategorySlug, Food, SpiceLevel } from '../types'

const MENU_KEY = 'spicyeat-admin-menu'

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function readFoods(): Food[] {
  try {
    const raw = localStorage.getItem(MENU_KEY)
    if (!raw) {
      localStorage.setItem(MENU_KEY, JSON.stringify(seedFoods))
      return seedFoods
    }
    return JSON.parse(raw)
  } catch {
    return seedFoods
  }
}

function writeFoods(foods: Food[]) {
  localStorage.setItem(MENU_KEY, JSON.stringify(foods))
}

export function fetchAdminFoods() {
  return apiRequest(() => readFoods())
}

export interface FoodInput {
  name: string
  tagline: string
  description: string
  categorySlug: CategorySlug
  price: number
  spiceLevel: SpiceLevel
  isVeg: boolean
  bestseller: boolean
  image: string
}

export function createFood(input: FoodInput) {
  return apiRequest(() => {
    const foods = readFoods()
    const food: Food = {
      id: `food-admin-${Date.now()}`,
      slug: slugify(input.name),
      name: input.name,
      tagline: input.tagline,
      description: input.description,
      categorySlug: input.categorySlug,
      price: input.price,
      spiceLevel: input.spiceLevel,
      isVeg: input.isVeg,
      bestseller: input.bestseller,
      rating: 4.5,
      reviewCount: 0,
      images: [input.image || '/images/burgers/gourmet-bacon-cheeseburger-close-up.png'],
    }
    foods.unshift(food)
    writeFoods(foods)
    return food
  })
}

export function updateFood(id: string, input: FoodInput) {
  return apiRequest(() => {
    const foods = readFoods()
    const existing = foods.find((f) => f.id === id)
    if (!existing) return null
    existing.name = input.name
    existing.slug = slugify(input.name)
    existing.tagline = input.tagline
    existing.description = input.description
    existing.categorySlug = input.categorySlug
    existing.price = input.price
    existing.spiceLevel = input.spiceLevel
    existing.isVeg = input.isVeg
    existing.bestseller = input.bestseller
    if (input.image) existing.images = [input.image]
    writeFoods(foods)
    return existing
  })
}

export function deleteFood(id: string) {
  return apiRequest(() => {
    const foods = readFoods().filter((f) => f.id !== id)
    writeFoods(foods)
    return true
  })
}
