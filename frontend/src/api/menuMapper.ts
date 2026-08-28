import type { CategorySlug, Food, SpiceLevel } from '../types'

// Real menu-service uses named enums and UUID category refs; the frontend still
// works in terms of the old mock's slug/1-4 vocabulary, so this is the seam
// between the two until the UI is updated to talk in backend terms directly.
export const SPICE_LEVEL_FROM_BACKEND: Record<string, SpiceLevel> = {
  MILD: 1,
  MEDIUM: 2,
  HOT: 3,
  EXTRA_HOT: 4,
}

export const SPICE_LEVEL_TO_BACKEND: Record<SpiceLevel, string> = {
  1: 'MILD',
  2: 'MEDIUM',
  3: 'HOT',
  4: 'EXTRA_HOT',
}

const CATEGORY_CODE_TO_SLUG: Record<string, CategorySlug> = {
  BURGERS: 'burgers',
  FRIED_CHICKEN: 'fried-chicken',
  PIZZA: 'pizza',
  WRAPS_ROLLS: 'wraps-rolls',
  LOADED: 'loaded',
  PASTA: 'pasta',
  SIDES: 'sides',
  DESSERTS: 'desserts',
}

const CATEGORY_SLUG_TO_CODE: Record<CategorySlug, string> = {
  burgers: 'BURGERS',
  'fried-chicken': 'FRIED_CHICKEN',
  pizza: 'PIZZA',
  'wraps-rolls': 'WRAPS_ROLLS',
  loaded: 'LOADED',
  pasta: 'PASTA',
  sides: 'SIDES',
  desserts: 'DESSERTS',
}

export function categoryCodeFromSlug(slug: CategorySlug): string {
  return CATEGORY_SLUG_TO_CODE[slug]
}

export interface MenuItemResponse {
  id: string
  categoryId: string
  name: string
  slug: string
  description: string
  price: number
  spiceLevel: string
  vegetarian: boolean
  available: boolean
  featured: boolean
  imageUrl: string | null
  displayOrder: number
}

export interface CategoryResponse {
  id: string
  code: string
  name: string
  displayOrder: number
}

export function categorySlugFromCode(code: string): CategorySlug {
  const slug = CATEGORY_CODE_TO_SLUG[code]
  if (!slug) throw new Error(`Unknown category code from backend: ${code}`)
  return slug
}

export function toFood(item: MenuItemResponse, categoryCode: string): Food {
  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    tagline: '',
    description: item.description,
    categorySlug: categorySlugFromCode(categoryCode),
    price: item.price,
    spiceLevel: SPICE_LEVEL_FROM_BACKEND[item.spiceLevel] ?? 1,
    isVeg: item.vegetarian,
    rating: 4.5,
    reviewCount: 0,
    bestseller: item.featured,
    images: item.imageUrl ? [item.imageUrl] : [],
  }
}
