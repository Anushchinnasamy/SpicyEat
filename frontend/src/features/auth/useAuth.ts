import { useState } from 'react'
import { login, register, type LoginPayload, type RegisterPayload } from '../../api/auth'
import { useAuthStore } from '../../state/authStore'

export function useAuth() {
  const setUser = useAuthStore((s) => s.setUser)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function doLogin(payload: LoginPayload) {
    setLoading(true)
    setError(null)
    try {
      const res = await login(payload)
      setUser(res.data)
      return true
    } catch {
      setError('Something got a little too hot. Try again.')
      return false
    } finally {
      setLoading(false)
    }
  }

  async function doRegister(payload: RegisterPayload) {
    setLoading(true)
    setError(null)
    try {
      const res = await register(payload)
      setUser(res.data)
      return true
    } catch {
      setError('Something got a little too hot. Try again.')
      return false
    } finally {
      setLoading(false)
    }
  }

  return { login: doLogin, register: doRegister, loading, error }
}
