import { useState } from 'react'
import { login, register, requestPasswordReset, type LoginPayload, type RegisterPayload, type ForgotPasswordPayload } from '../../api/auth'
import { useAuthStore } from '../../state/authStore'

export function useAuth() {
  const setUser = useAuthStore((s) => s.setUser)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function setErrorEmpty() {
    setError(null)
  }

  async function doLogin(payload: LoginPayload) {
    setLoading(true)
    setError(null)
    try {
      const res = await login(payload)
      setUser(res.data)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something got a little too hot. Try again.')
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something got a little too hot. Try again.')
      return false
    } finally {
      setLoading(false)
    }
  }

  async function doRequestReset(payload: ForgotPasswordPayload) {
    setLoading(true)
    setError(null)
    try {
      await requestPasswordReset(payload)
      return true
    } catch (err) {
      // Backend should reliably return HTTP 202, but if network or other failure happens:
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      return false
    } finally {
      setLoading(false)
    }
  }

  return { login: doLogin, register: doRegister, requestReset: doRequestReset, loading, error, setErrorEmpty }
}
