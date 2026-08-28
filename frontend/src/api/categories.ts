import { fetchApi } from './client'
import { categorySlugFromCode, type CategoryResponse, type MenuItemResponse } from './menuMapper'
import type { ApiResult, Category, CategorySlug } from '../types'

// menu-service doesn't store a display image per category (that's a purely
// cosmetic frontend concern), so this is a small local lookup keyed by slug.
const CATEGORY_IMAGES: Record<CategorySlug, string> = {
  burgers: '/images/burgers/gourmet-bacon-cheeseburger-close-up.png',
  'fried-chicken': '/images/chicken-fingers/spicyeat-crispy-chicken-feast.png',
  pizza: '/images/pizza/stretchy-pepperoni-pizza-delight.png',
  'wraps-rolls': '/images/wraps/grilled-chicken-wraps-with-fresh-filling.png',
  loaded: '/images/pasta/loaded.png',
  pasta: '/images/pasta/creamy-chicken-alfredo-pasta-bowl.png',
  sides: '/images/sides/rustic-golden-fries-with-ketchup.png',
  desserts: '/images/desserts/molten-chocolate-lava-cake-delight.png',
}

export async function fetchCategories(): Promise<ApiResult<Category[]>> {
  const [categories, items] = await Promise.all([
    fetchApi<CategoryResponse[]>('/api/menu/categories'),
    fetchApi<MenuItemResponse[]>('/api/menu'),
  ])

  const data: Category[] = categories
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((c) => {
      const slug = categorySlugFromCode(c.code)
      return {
        slug,
        name: c.name,
        image: CATEGORY_IMAGES[slug],
        itemCount: items.filter((i) => i.categoryId === c.id).length,
      }
    })

  return { data }
}

export async function getCategoryBySlug(slug: CategorySlug): Promise<Category | undefined> {
  const { data } = await fetchCategories()
  return data.find((c) => c.slug === slug)
}
