import { useState } from 'react'
import { PageShell } from '../../components/layout/PageShell'
import { CategoryRail } from '../../components/food/CategoryRail'
import { FeaturedFoodCard } from '../../components/food/FeaturedFoodCard'
import { FoodCard } from '../../components/food/FoodCard'
import { SpiceIndicator } from '../../components/food/SpiceIndicator'
import { LinkButton } from '../../components/buttons/Button'
import { Eyebrow, EditorialHeading } from '../../components/typography/EditorialHeading'
import { LoadingState } from '../../components/feedback/States'
import { useCategories } from '../../hooks/useCategories'
import { useMenu } from '../../hooks/useMenu'
import { useCartStore } from '../../state/cartStore'
import type { SpiceLevel } from '../../types'

export function ExplorePage() {
  const { categories } = useCategories()
  const [maxSpice, setMaxSpice] = useState<SpiceLevel>(4)
  const { foods, loading } = useMenu({ maxSpice })
  const addItem = useCartStore((s) => s.addItem)

  const featured = foods?.find((f) => f.bestseller)
  const popular = foods?.filter((f) => f.id !== featured?.id).slice(0, 8) ?? []

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-5 pb-10 pt-12 lg:px-10">
        <EditorialHeading lines={["What's your", 'craving?']} size="lg" />
        <p className="mt-4 max-w-sm text-muted-ink">Pick a mood. We'll handle the hunger.</p>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-10">
        {categories && <CategoryRail categories={categories} />}
      </section>

      <section className="bg-soft-lavender/40 py-10">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <Eyebrow>How brave are you?</Eyebrow>
          <div className="mt-4 flex flex-wrap items-center gap-6">
            {([1, 2, 3, 4] as SpiceLevel[]).map((level) => (
              <button
                key={level}
                onClick={() => setMaxSpice(level)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                  maxSpice === level
                    ? 'border-sun-orange bg-sun-orange text-white'
                    : 'border-deep-ink/15 hover:border-deep-ink/40'
                }`}
              >
                <SpiceIndicator level={level} showLabel size="sm" />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-10">
        <Eyebrow>Featured</Eyebrow>
        <EditorialHeading size="md" lines={['This week we love']} className="mt-2" />
        {loading && <LoadingState />}
        {featured && (
          <div className="mt-6">
            <FeaturedFoodCard food={featured} />
          </div>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Popular dishes</Eyebrow>
            <EditorialHeading size="md" lines={['Trending', 'this week']} className="mt-2" />
          </div>
          <LinkButton to="/menu" variant="outline">
            Full Menu
          </LinkButton>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {popular.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              onQuickAdd={(f) => addItem({ food: f, quantity: 1, spiceLevel: f.spiceLevel })}
            />
          ))}
        </div>
      </section>

      <section className="bg-deep-ink py-16 text-warm-canvas">
        <div className="mx-auto max-w-7xl px-5 lg:px-10">
          <p className="font-display text-3xl uppercase sm:text-4xl">Still hungry? We got more.</p>
          <LinkButton to="/collections" variant="primary" className="mt-6">
            Browse Collections →
          </LinkButton>
        </div>
      </section>
    </PageShell>
  )
}
