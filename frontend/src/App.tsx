import { useEffect } from 'react'
import { AppRouter } from './app/router'
import { Toaster } from './components/feedback/Toaster'
import { useAuthStore } from './state/authStore'
import { useCartStore } from './state/cartStore'
import { useFavouritesStore } from './state/favouritesStore'

function App() {
  const userId = useAuthStore((s) => s.user?.id)
  const refreshCart = useCartStore((s) => s.refresh)
  const refreshFavourites = useFavouritesStore((s) => s.refresh)

  useEffect(() => {
    if (userId) {
      refreshCart().catch(() => {})
      refreshFavourites().catch(() => {})
    } else {
      useCartStore.setState({ items: [], loaded: true })
      useFavouritesStore.setState({ ids: new Set(), loaded: true })
    }
  }, [userId, refreshCart, refreshFavourites])

  return (
    <>
      <AppRouter />
      <Toaster />
    </>
  )
}

export default App
