import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageShell } from '../../components/layout/PageShell'
import { FoodCard } from '../../components/food/FoodCard'
import { SpiceIndicator } from '../../components/food/SpiceIndicator'
import { VegBadge } from '../../components/food/VegBadge'
import { QuantityStepper } from '../../components/buttons/QuantityStepper'
import { Button } from '../../components/buttons/Button'
import { LoadingState, ErrorState } from '../../components/feedback/States'
import { fetchFoodBySlug, fetchRelated } from '../../api/menu'
import { useCartStore } from '../../state/cartStore'
import { useFavouritesStore } from '../../state/favouritesStore'
import type { AddOn, Food, SizeOption, SpiceLevel } from '../../types'

export function MenuItemPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const addItem = useCartStore((s) => s.addItem)
  const favouriteIds = useFavouritesStore((s) => s.ids)
  const toggleFavourite = useFavouritesStore((s) => s.toggle)

  const [food, setFood] = useState<Food | null | undefined>(undefined)
  const [related, setRelated] = useState<Food[]>([])
  const [sizeId, setSizeId] = useState<string | undefined>()
  const [addOnIds, setAddOnIds] = useState<string[]>([])
  const [spiceLevel, setSpiceLevel] = useState<SpiceLevel>(1)
  const [quantity, setQuantity] = useState(1)
  const [justAdded, setJustAdded] = useState(false)

  useEffect(() => {
    if (!slug) return
    setFood(undefined)
    setJustAdded(false)
    fetchFoodBySlug(slug).then((res) => {
      setFood(res.data ?? null)
      setSizeId(res.data?.sizes?.[0]?.id)
      setAddOnIds([])
      setSpiceLevel(res.data?.spiceLevel ?? 1)
      setQuantity(1)
      if (res.data) {
        fetchRelated(res.data.id, res.data.categorySlug).then((r) => setRelated(r.data))
      }
    })
  }, [slug])

  if (food === undefined) {
    return (
      <PageShell>
        <LoadingState />
      </PageShell>
    )
  }

  if (food === null) {
    return (
      <PageShell>
        <ErrorState title="Nothing hit the spot." subtitle="This dish doesn't exist. Try the full menu instead." />
      </PageShell>
    )
  }

  const currentFood: Food = food
  const isFavourite = favouriteIds.has(currentFood.id)
  const size = currentFood.sizes?.find((s: SizeOption) => s.id === sizeId)
  const selectedAddOns: AddOn[] = (currentFood.addOns ?? []).filter((a) => addOnIds.includes(a.id))
  const unitPrice = currentFood.price + (size?.price ?? 0) + selectedAddOns.reduce((sum, a) => sum + a.price, 0)

  function toggleAddOn(id: string) {
    setAddOnIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function handleAddToCart() {
    addItem({ food: currentFood, quantity, size, addOns: selectedAddOns, spiceLevel })
    setJustAdded(true)
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-7xl px-5 pb-24 pt-8 lg:px-10">
        <Link to="/menu" className="text-sm font-semibold text-muted-ink hover:text-deep-ink">
          ← Back to Menu
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-sun-orange">{food.tagline}</p>
            <h1 className="mt-2 font-display text-5xl uppercase leading-[0.92] sm:text-6xl">{food.name}</h1>
            <img
              src={food.images[0]}
              alt={food.name}
              className="mt-8 aspect-square w-full rounded-[2rem] object-cover"
            />
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {food.bestseller && (
                  <span className="rounded-full bg-sun-orange px-3 py-1 text-[10px] font-bold uppercase text-white">
                    🔥 Bestseller
                  </span>
                )}
                <span className="flex items-center gap-1 text-sm font-semibold">
                  ⭐ {food.rating} <span className="text-muted-ink">({food.reviewCount} reviews)</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <VegBadge isVeg={food.isVeg} />
                <button
                  type="button"
                  aria-label={isFavourite ? `Remove ${food.name} from favourites` : `Add ${food.name} to favourites`}
                  onClick={() => toggleFavourite(currentFood.id, currentFood.name)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-soft-lavender/40 text-base transition-transform hover:scale-110"
                >
                  {isFavourite ? '❤️' : '🤍'}
                </button>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-muted-ink">{food.description}</p>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-ink">Spice level</p>
              <div className="mt-2 flex items-center gap-4 rounded-2xl bg-soft-lavender/40 p-4">
                <SpiceIndicator level={spiceLevel} interactive onChange={setSpiceLevel} showLabel />
              </div>
            </div>

            <p className="font-display text-3xl">₹{unitPrice}</p>

            {food.sizes && (
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-ink">Choose size</p>
                <div className="mt-2 flex flex-wrap gap-3">
                  {food.sizes.map((s: SizeOption) => (
                    <button
                      key={s.id}
                      onClick={() => setSizeId(s.id)}
                      className={`rounded-xl border px-4 py-2.5 text-left text-sm font-semibold transition-colors ${
                        sizeId === s.id ? 'border-sun-orange bg-sun-orange/10' : 'border-deep-ink/15'
                      }`}
                    >
                      {s.label}
                      <span className="block text-xs text-muted-ink">
                        ₹{food.price + s.price}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {food.addOns && (
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wide text-muted-ink">Add-ons</p>
                  <p className="text-xs text-muted-ink">Choose up to {food.addOns.length}</p>
                </div>
                <div className="mt-2 flex flex-col gap-2">
                  {food.addOns.map((a: AddOn) => (
                    <label
                      key={a.id}
                      className="flex items-center justify-between rounded-xl border border-deep-ink/10 px-4 py-2.5 text-sm"
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={addOnIds.includes(a.id)}
                          onChange={() => toggleAddOn(a.id)}
                          className="h-4 w-4 accent-sun-orange"
                        />
                        {a.name}
                      </span>
                      <span className="text-muted-ink">₹{a.price}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 pt-2">
              <QuantityStepper quantity={quantity} onChange={setQuantity} />
              <Button onClick={handleAddToCart} className="flex-1 justify-center">
                {justAdded ? 'Added ✓' : `Add to Cart · ₹${unitPrice * quantity}`}
              </Button>
            </div>
            {justAdded && (
              <button
                onClick={() => navigate('/cart')}
                className="self-start text-sm font-semibold text-sun-orange hover:underline"
              >
                View Cart →
              </button>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display text-3xl uppercase">You might also crave...</h2>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {related.map((f) => (
                <FoodCard key={f.id} food={f} onQuickAdd={(food) => addItem({ food, quantity: 1, spiceLevel: food.spiceLevel })} />
              ))}
            </div>
          </div>
        )}
      </div>
    </PageShell>
  )
}
