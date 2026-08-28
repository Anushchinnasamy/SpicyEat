import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '../../components/forms/Input'
import { Button } from '../../components/buttons/Button'
import { login } from '../../api/auth'
import { useAuthStore } from '../../state/authStore'

export function DeliveryLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { data: user } = await login({ email, password })
      if (user.role !== 'DELIVERY_PARTNER') {
        useAuthStore.getState().logout()
        setError('That account is not registered as a delivery partner.')
        return
      }
      navigate('/delivery')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F1115] px-5">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex items-center gap-1.5 font-display text-lg uppercase tracking-tight">
          <span aria-hidden>🌶️</span>
          Spicy<span className="text-sun-orange">Eat</span>
          <span className="ml-1 rounded bg-deep-ink px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-warm-canvas">
            Rider
          </span>
        </div>
        <p className="mt-1 text-sm text-muted-ink">Delivery partner access.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <Input
            icon="✉️"
            type="email"
            required
            placeholder="rider@spicyeat.com"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            icon="🔒"
            type="password"
            required
            minLength={8}
            maxLength={100}
            placeholder="Password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-chili-red">{error}</p>}
          <Button type="submit" disabled={loading} className="mt-2 w-full justify-center">
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-ink">
          Requires an account with the DELIVERY_PARTNER role —{' '}
          <a href="/login" className="font-semibold text-sun-orange hover:underline">
            go to customer login
          </a>
          .
        </p>
      </div>
    </div>
  )
}
