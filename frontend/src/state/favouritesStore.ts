import { create } from 'zustand'
import { addFavourite, fetchFavouriteIds, removeFavourite } from '../api/favourites'
import { useAuthStore } from './authStore'
import { toast } from './toastStore'

interface FavouritesState {
  ids: Set<string>
  loaded: boolean
  refresh: () => Promise<void>
  toggle: (menuItemId: string, name: string) => Promise<void>
}

export const useFavouritesStore = create<FavouritesState>()((set, get) => ({
  ids: new Set(),
  loaded: false,

  refresh: async () => {
    const favourites = await fetchFavouriteIds()
    set({ ids: new Set(favourites.map((f) => f.menuItemId)), loaded: true })
  },

  toggle: async (menuItemId, name) => {
    if (!useAuthStore.getState().accessToken) {
      toast.error('Log in to save favourites')
      return
    }
    const isFavourite = get().ids.has(menuItemId)
    try {
      if (isFavourite) {
        await removeFavourite(menuItemId)
        set((s) => {
          const next = new Set(s.ids)
          next.delete(menuItemId)
          return { ids: next }
        })
        toast.success(`${name} removed from favourites`)
      } else {
        await addFavourite(menuItemId)
        set((s) => ({ ids: new Set(s.ids).add(menuItemId) }))
        toast.success(`${name} added to favourites`)
      }
    } catch {
      toast.error('Could not update favourites')
    }
  },
}))
