import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageShell } from '../../components/layout/PageShell'
import { EditorialHeading } from '../../components/typography/EditorialHeading'
import { EmptyState, LoadingState } from '../../components/feedback/States'
import { LinkButton, Button } from '../../components/buttons/Button'
import { Input } from '../../components/forms/Input'
import { useAuthStore } from '../../state/authStore'
import { useFavouritesStore } from '../../state/favouritesStore'
import { toast } from '../../state/toastStore'
import { performLogout, changePassword } from '../../api/auth'
import { fetchOrders as fetchRealOrders, type RealOrder } from '../../api/realOrder'
import { fetchAddresses, createAddress, deleteAddress, type AddressResponse } from '../../api/addresses'
import { fetchMenu } from '../../api/menu'
import type { Food } from '../../types'

const COINS_PER_RUPEE = 0.1

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  const [orders, setOrders] = useState<RealOrder[] | null>(null)
  const [addresses, setAddresses] = useState<AddressResponse[] | null>(null)
  const [menu, setMenu] = useState<Food[]>([])
  const favouriteIds = useFavouritesStore((s) => s.ids)
  const toggleFavourite = useFavouritesStore((s) => s.toggle)

  const [vegOnly, setVegOnly] = useState(false)
  const [orderUpdates, setOrderUpdates] = useState(true)

  const [showNewAddress, setShowNewAddress] = useState(false)
  const [label, setLabel] = useState('Home')
  const [line1, setLine1] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [savingAddress, setSavingAddress] = useState(false)

  const [showChangePassword, setShowChangePassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    fetchRealOrders().then(setOrders).catch(() => setOrders([]))
    fetchAddresses().then(setAddresses).catch(() => setAddresses([]))
    fetchMenu().then((res) => setMenu(res.data)).catch(() => setMenu([]))
  }, [user])

  if (!user) {
    return (
      <PageShell>
        <EmptyState
          title="Hey, stranger."
          subtitle="Log in to see your profile, orders and Spicy Coins."
          action={
            <LinkButton to="/login" className="mt-2">
              Login →
            </LinkButton>
          }
        />
      </PageShell>
    )
  }

  async function handleLogout() {
    await performLogout()
    navigate('/')
  }

  async function handleSaveAddress(e: React.FormEvent) {
    e.preventDefault()
    setSavingAddress(true)
    try {
      const created = await createAddress({
        label,
        line1,
        city,
        state,
        postalCode,
        isDefault: (addresses?.length ?? 0) === 0,
      })
      setAddresses((prev) => [...(prev ?? []), created])
      setLabel('Home')
      setLine1('')
      setCity('')
      setState('')
      setPostalCode('')
      setShowNewAddress(false)
      toast.success('Address saved')
    } catch {
      toast.error('Could not save that address')
    } finally {
      setSavingAddress(false)
    }
  }

  async function handleDeleteAddress(id: string) {
    try {
      await deleteAddress(id)
      setAddresses((prev) => (prev ?? []).filter((a) => a.id !== id))
      toast.success('Address removed')
    } catch {
      toast.error('Could not remove that address')
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    setChangingPassword(true)
    setPasswordError(null)
    try {
      await changePassword(currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setShowChangePassword(false)
      toast.success('Password updated')
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Could not change your password')
    } finally {
      setChangingPassword(false)
    }
  }

  const spicyCoins = Math.floor((orders ?? []).reduce((sum, o) => sum + o.total, 0) * COINS_PER_RUPEE)
  const favouriteFoods = menu.filter((f) => favouriteIds.has(f.id))

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-5 pb-6 pt-12 lg:px-10">
        <EditorialHeading lines={['Hey, foodie.']} size="lg" />
        <p className="mt-3 text-muted-ink">
          {user.name} · {user.email}
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-10 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between rounded-3xl bg-deep-ink p-6 text-warm-canvas sm:p-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-warm-canvas/60">Spicy Coins</p>
                <p className="mt-1 font-display text-4xl text-sun-orange">{spicyCoins}</p>
                <p className="mt-1 text-xs text-warm-canvas/50">Earned from your real order history</p>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 ring-1 ring-deep-ink/5 sm:p-8">
              <p className="font-display text-lg uppercase">Favourites</p>
              {favouriteFoods.length === 0 ? (
                <p className="mt-3 text-sm text-muted-ink">
                  Tap the heart on any dish to save it here.
                </p>
              ) : (
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {favouriteFoods.map((food) => (
                    <div key={food.id} className="group relative">
                      <Link to={`/menu/${food.slug}`}>
                        <img
                          src={food.images[0]}
                          alt={food.name}
                          className="aspect-square w-full rounded-xl object-cover transition-transform group-hover:scale-105"
                        />
                        <p className="mt-2 truncate text-xs font-semibold">{food.name}</p>
                      </Link>
                      <button
                        type="button"
                        aria-label={`Remove ${food.name} from favourites`}
                        onClick={() => toggleFavourite(food.id, food.name)}
                        className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-xs shadow-sm"
                      >
                        ❤️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-white p-6 ring-1 ring-deep-ink/5 sm:p-8">
              <p className="font-display text-lg uppercase">Order History</p>
              {orders === null && <LoadingState title="Loading your orders..." />}
              {orders !== null && orders.length === 0 && (
                <p className="mt-3 text-sm text-muted-ink">No orders yet. Your cravings are waiting.</p>
              )}
              {orders !== null && orders.length > 0 && (
                <div className="mt-4 flex flex-col divide-y divide-deep-ink/10">
                  {orders.map((order) => (
                    <Link
                      key={order.id}
                      to={`/orders/${order.id}`}
                      className="flex items-center justify-between gap-4 py-4 text-sm hover:text-sun-orange"
                    >
                      <div>
                        <p className="font-semibold">{order.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-ink">
                          {order.items.length} item{order.items.length > 1 ? 's' : ''} ·{' '}
                          {new Date(order.createdAt).toLocaleDateString()} · {order.status}
                        </p>
                      </div>
                      <span className="font-display">₹{order.total}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-white p-6 ring-1 ring-deep-ink/5 sm:p-8">
              <p className="font-display text-lg uppercase">Addresses</p>
              {addresses === null && <LoadingState title="Loading addresses..." />}
              {addresses !== null && addresses.length === 0 && !showNewAddress && (
                <p className="mt-3 text-sm text-muted-ink">No saved addresses yet.</p>
              )}
              {addresses !== null && addresses.length > 0 && (
                <div className="mt-4 flex flex-col gap-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="flex items-start justify-between gap-3 rounded-2xl border border-deep-ink/10 p-4 text-sm"
                    >
                      <div>
                        <p className="font-semibold">{addr.label}</p>
                        <p className="text-muted-ink">
                          {addr.line1}
                          {addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} {addr.postalCode}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="shrink-0 text-xs font-semibold text-chili-red hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {showNewAddress ? (
                <form onSubmit={handleSaveAddress} className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Input required placeholder="Label, e.g. Home" value={label} onChange={(e) => setLabel(e.target.value)} />
                  <Input
                    required
                    placeholder="Address, area"
                    className="sm:col-span-2"
                    value={line1}
                    onChange={(e) => setLine1(e.target.value)}
                  />
                  <Input required placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
                  <Input required placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
                  <Input
                    required
                    placeholder="Postal code"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                  />
                  <div className="flex items-center gap-3 sm:col-span-2">
                    <Button type="submit" disabled={savingAddress}>
                      {savingAddress ? 'Saving...' : 'Save Address'}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setShowNewAddress(false)}
                      className="text-sm font-semibold text-muted-ink hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowNewAddress(true)}
                  className="mt-4 text-sm font-semibold text-sun-orange hover:underline"
                >
                  + Add new address
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="rounded-3xl bg-white p-6 ring-1 ring-deep-ink/5">
              <p className="font-display text-lg uppercase">Preferences</p>
              <div className="mt-4 flex flex-col gap-4 text-sm">
                <label className="flex items-center justify-between">
                  <span>Veg only by default</span>
                  <input
                    type="checkbox"
                    checked={vegOnly}
                    onChange={(e) => setVegOnly(e.target.checked)}
                    className="h-5 w-5 accent-herb-green"
                  />
                </label>
                <label className="flex items-center justify-between">
                  <span>Order status updates</span>
                  <input
                    type="checkbox"
                    checked={orderUpdates}
                    onChange={(e) => setOrderUpdates(e.target.checked)}
                    className="h-5 w-5 accent-sun-orange"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-6 ring-1 ring-deep-ink/5">
              <p className="font-display text-lg uppercase">Security</p>
              {!showChangePassword ? (
                <button
                  type="button"
                  onClick={() => setShowChangePassword(true)}
                  className="mt-4 text-sm font-semibold text-sun-orange hover:underline"
                >
                  Change password
                </button>
              ) : (
                <form onSubmit={handleChangePassword} className="mt-4 flex flex-col gap-3">
                  <Input
                    type="password"
                    required
                    placeholder="Current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <Input
                    type="password"
                    required
                    minLength={8}
                    placeholder="New password (min 8 chars)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  {passwordError && <p className="text-xs text-chili-red">{passwordError}</p>}
                  <div className="flex items-center gap-3">
                    <Button type="submit" disabled={changingPassword} className="flex-1 justify-center">
                      {changingPassword ? 'Updating...' : 'Update password'}
                    </Button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowChangePassword(false)
                        setPasswordError(null)
                      }}
                      className="text-sm font-semibold text-muted-ink hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-chili-red/30 px-6 py-3.5 text-sm font-semibold text-chili-red transition-colors hover:bg-chili-red/10"
            >
              Log out
            </button>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
