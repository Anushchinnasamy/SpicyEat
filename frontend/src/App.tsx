import { useEffect } from 'react'
import { AppRouter } from './app/router'
import { useAuthStore } from './state/authStore'
import { useCartStore } from './state/cartStore'

function App() {
  const userId = useAuthStore((s) => s.user?.id)
  const refreshCart = useCartStore((s) => s.refresh)

  useEffect(() => {
    if (userId) {
      refreshCart().catch(() => {})
    } else {
      useCartStore.setState({ items: [], loaded: true })
    }
  }, [userId, refreshCart])

  return <AppRouter />
}

export default App
