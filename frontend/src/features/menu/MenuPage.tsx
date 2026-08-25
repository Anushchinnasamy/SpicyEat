import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageShell } from '../../components/layout/PageShell'
import { NAV_HEIGHT } from '../../components/layout/Navigation'
import { FoodCard } from '../../components/food/FoodCard'
import { FeaturedFoodCard } from '../../components/food/FeaturedFoodCard'
import { EditorialHeading } from '../../components/typography/EditorialHeading'
import { LoadingState, EmptyState } from '../../components/feedback/States'
import { useMenu } from '../../hooks/useMenu'
import { useCartStore } from '../../state/cartStore'
import type { CategorySlug, SpiceLevel } from '../../types'

const CATEGORY_TABS: { slug: CategorySlug | 'all'; label: string }[] = [
  { slug: 'all', label: 'All' },
  { slug: 'burgers', label: 'Burgers' },
  { slug: 'fried-chicken', label: 'Fried Chicken' },
  { slug: 'pizza', label: 'Pizza' },
  { slug: 'wraps-rolls', label: 'Wraps & Rolls' },
  { slug: 'loaded', label: 'Loaded' },
  { slug: 'pasta', label: 'Pasta' },
  { slug: 'sides', label: 'Sides' },
  { slug: 'desserts', label: 'Desserts' },
]

export function MenuPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = (searchParams.get('category') as CategorySlug | null) ?? 'all'
  const [vegOnly, setVegOnly] = useState(false)
  const [maxSpice, setMaxSpice] = useState<SpiceLevel>(4)

  const { foods, loading } = useMenu({ category, vegOnly, maxSpice })

  const featured = foods?.find((f) => f.bestseller)
  const rest = foods?.filter((f) => f.id !== featured?.id) ?? []
  const addItem = useCartStore((s) => s.addItem)

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-5 pb-6 pt-12 lg:px-10">
        <EditorialHeading lines={["What's your", 'craving?']} size="lg" />
      </section>

      <div
        className="sticky z-30 border-b border-deep-ink/5 bg-warm-canvas/95 backdrop-blur"
        style={{ top: NAV_HEIGHT }}
      >
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-5 py-4 lg:px-10">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.slug}
              onClick={() => setSearchParams(tab.slug === 'all' ? {} : { category: tab.slug })}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold uppercase tracking-wide transition-colors ${
                category === tab.slug
                  ? 'border-sun-orange bg-sun-orange text-white'
                  : 'border-deep-ink/15 text-deep-ink hover:border-deep-ink/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-5 py-6 lg:px-10">
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input
              type="checkbox"
              checked={vegOnly}
              onChange={(e) => setVegOnly(e.target.checked)}
              className="h-4 w-4 accent-herb-green"
            />
            Veg only
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold">
            Max spice
            <select
              value={maxSpice}
              onChange={(e) => setMaxSpice(Number(e.target.value) as SpiceLevel)}
              className="rounded-full border border-deep-ink/15 bg-transparent px-3 py-1.5"
            >
              <option value={1}>Mild</option>
              <option value={2}>Hot</option>
              <option value={3}>Fire</option>
              <option value={4}>Insane</option>
            </select>
          </label>
        </div>
      </section>

      {loading && <LoadingState />}

      {!loading && foods && foods.length === 0 && (
        <EmptyState title="Nothing hit the spot." subtitle="Try something spicier." />
      )}

      {!loading && featured && (
        <section className="mx-auto max-w-7xl px-5 pb-10 lg:px-10">
          <FeaturedFoodCard food={featured} />
        </section>
      )}

      {!loading && rest.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-10">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {rest.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
                onQuickAdd={(f) => addItem({ food: f, quantity: 1, spiceLevel: f.spiceLevel })}
              />
            ))}
          </div>
        </section>
      )}
    </PageShell>
  )
}
