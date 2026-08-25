import { apiRequest } from './client'
import { foods } from './mock/foods'
import { dessertImages, friedChickenImages, loadedImages, sidesImages } from './mock/images'
import type { Food } from '../types'

export interface Collection {
  slug: string
  name: string
  tagline: string
  image: string
  filter: (food: Food) => boolean
}

export const collections: Collection[] = [
  {
    slug: 'fire-mode',
    name: 'Fire Mode',
    tagline: 'No mercy. Spice level 3+.',
    image: friedChickenImages[0],
    filter: (f) => f.spiceLevel >= 3,
  },
  {
    slug: 'late-night-cravings',
    name: 'Late Night Cravings',
    tagline: 'Loaded, cheesy, built for 2am.',
    image: loadedImages[0],
    filter: (f) => f.categorySlug === 'loaded' || f.categorySlug === 'desserts',
  },
  {
    slug: 'cheese-pull',
    name: 'Cheese Pull',
    tagline: 'Melt mode, guaranteed.',
    image: friedChickenImages[1],
    filter: (f) => /cheese/i.test(f.name) || /cheese/i.test(f.description),
  },
  {
    slug: 'chicken-lovers',
    name: 'Chicken Lovers',
    tagline: 'Crispy, fired, and fried.',
    image: friedChickenImages[2],
    filter: (f) => f.categorySlug === 'fried-chicken' || /chicken/i.test(f.name),
  },
  {
    slug: 'under-299',
    name: 'Under ₹299',
    tagline: 'Good choices, easy on the wallet.',
    image: sidesImages[0],
    filter: (f) => f.price < 299,
  },
  {
    slug: 'best-sellers',
    name: 'Best Sellers',
    tagline: "Can't get enough.",
    image: dessertImages[0],
    filter: (f) => f.bestseller,
  },
]

export function getCollection(slug: string) {
  return collections.find((c) => c.slug === slug)
}

export function fetchCollections() {
  return apiRequest(() => collections)
}

export function fetchCollectionFoods(slug: string) {
  return apiRequest(() => {
    const collection = getCollection(slug)
    return collection ? foods.filter(collection.filter) : []
  })
}
