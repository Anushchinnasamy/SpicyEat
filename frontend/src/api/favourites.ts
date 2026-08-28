import { fetchApi } from './client'

export function fetchFavouriteIds(): Promise<{ menuItemId: string }[]> {
  return fetchApi<{ menuItemId: string }[]>('/api/users/me/favourites')
}

export function addFavourite(menuItemId: string): Promise<void> {
  return fetchApi<void>(`/api/users/me/favourites/${menuItemId}`, { method: 'POST' })
}

export function removeFavourite(menuItemId: string): Promise<void> {
  return fetchApi<void>(`/api/users/me/favourites/${menuItemId}`, { method: 'DELETE' })
}
