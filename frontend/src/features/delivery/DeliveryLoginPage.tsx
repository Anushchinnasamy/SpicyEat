import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from '../../components/forms/Input'
import { Button } from '../../components/buttons/Button'
import { useDeliveryAuthStore } from '../../state/deliveryAuthStore'

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function DeliveryLoginPage() {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useDeliveryAuthStore((s) => s.login)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 400))
    login(`partner-${slugify(name) || 'rider'}`, name || 'Rider')
    navigate('/delivery')
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
            icon="👤"
            required
            placeholder="Your name"
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            icon="📱"
            type="tel"
            required
            placeholder="Phone number"
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Button type="submit" disabled={loading} className="mt-2 w-full justify-center">
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-ink">
          Any name/phone works in this demo. Not a customer login —{' '}
          <a href="/login" className="font-semibold text-sun-orange hover:underline">
            go to customer login
          </a>
          .
        </p>
      </div>
    </div>
  )
}
