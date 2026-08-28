import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PageShell } from '../../components/layout/PageShell'
import { EditorialHeading } from '../../components/typography/EditorialHeading'
import { EmptyState } from '../../components/feedback/States'
import { LinkButton } from '../../components/buttons/Button'
import { useAuthStore } from '../../state/authStore'
import { performLogout } from '../../api/auth'
import { fetchOrders } from '../../api/orders'
import { fetchRewardsSummary, type RewardsSummary } from '../../api/rewards'
import { fetchBestsellers } from '../../api/menu'
import type { Food, Order } from '../../types'

export function ProfilePage() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()

  const [orders, setOrders] = useState<Order[]>([])
  const [rewards, setRewards] = useState<RewardsSummary | null>(null)
  const [favourites, setFavourites] = useState<Food[]>([])
  const [vegOnly, setVegOnly] = useState(false)
  const [orderUpdates, setOrderUpdates] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchOrders().then((res) => setOrders(res.data))
    fetchRewardsSummary().then((res) => setRewards(res.data))
    fetchBestsellers(4).then((res) => setFavourites(res.data))
  }, [user])

  const addresses = useMemo(() => {
    const seen = new Set<string>()
    const list: Order['address'][] = []
    for (const order of orders) {
      const key = `${order.address.line1}-${order.address.pincode}`
      if (!seen.has(key)) {
        seen.add(key)
        list.push(order.address)
      }
    }
    return list
  }, [orders])

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
            {rewards && (
              <Link
                to="/rewards"
                className="flex items-center justify-between rounded-3xl bg-deep-ink p-6 text-warm-canvas transition-transform hover:-translate-y-0.5 sm:p-8"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-warm-canvas/60">Spicy Coins</p>
                  <p className="mt-1 font-display text-4xl text-sun-orange">{rewards.balance}</p>
                </div>
                <span className="text-sm font-semibold text-warm-canvas/70">View rewards →</span>
              </Link>
            )}

            <div className="rounded-3xl bg-white p-6 ring-1 ring-deep-ink/5 sm:p-8">
              <p className="font-display text-lg uppercase">Favourites</p>
              {favourites.length === 0 ? (
                <p className="mt-3 text-sm text-muted-ink">Start ordering to build your favourites.</p>
              ) : (
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {favourites.map((food) => (
                    <Link key={food.id} to={`/menu/${food.slug}`} className="group">
                      <img
                        src={food.images[0]}
                        alt={food.name}
                        className="aspect-square w-full rounded-xl object-cover transition-transform group-hover:scale-105"
                      />
                      <p className="mt-2 truncate text-xs font-semibold">{food.name}</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl bg-white p-6 ring-1 ring-deep-ink/5 sm:p-8">
              <p className="font-display text-lg uppercase">Order History</p>
              {orders.length === 0 ? (
                <p className="mt-3 text-sm text-muted-ink">No orders yet. Your cravings are waiting.</p>
              ) : (
                <div className="mt-4 flex flex-col divide-y divide-deep-ink/10">
                  {orders.map((order) => (
                    <Link
                      key={order.id}
                      to={`/orders/${order.id}`}
                      className="flex items-center justify-between gap-4 py-4 text-sm hover:text-sun-orange"
                    >
                      <div>
                        <p className="font-semibold">{order.id}</p>
                        <p className="text-xs text-muted-ink">
                          {order.items.length} item{order.items.length > 1 ? 's' : ''} ·{' '}
                          {new Date(order.placedAt).toLocaleDateString()}
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
              {addresses.length === 0 ? (
                <p className="mt-3 text-sm text-muted-ink">No saved addresses yet.</p>
              ) : (
                <div className="mt-4 flex flex-col gap-3">
                  {addresses.map((addr) => (
                    <div key={`${addr.line1}-${addr.pincode}`} className="rounded-2xl border border-deep-ink/10 p-4 text-sm">
                      <p className="font-semibold">{addr.name}</p>
                      <p className="text-muted-ink">
                        {addr.line1}, {addr.city} {addr.pincode}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <button
                type="button"
                className="mt-4 text-sm font-semibold text-sun-orange hover:underline"
              >
                + Add new address
              </button>
            </div>

            <div className="rounded-3xl bg-white p-6 ring-1 ring-deep-ink/5 sm:p-8">
              <p className="font-display text-lg uppercase">Payment Methods</p>
              <div className="mt-4 flex flex-col gap-3">
                <div className="flex items-center justify-between rounded-2xl border border-deep-ink/10 p-4 text-sm">
                  <span>💳 Card ···· 4242</span>
                  <span className="text-xs text-muted-ink">Default</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl border border-deep-ink/10 p-4 text-sm">
                  <span>📱 UPI · foodie@upi</span>
                </div>
              </div>
              <button type="button" className="mt-4 text-sm font-semibold text-sun-orange hover:underline">
                + Add payment method
              </button>
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
              <button type="button" className="mt-4 text-sm font-semibold text-sun-orange hover:underline">
                Change password
              </button>
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
