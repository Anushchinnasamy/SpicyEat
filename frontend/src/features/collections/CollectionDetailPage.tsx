import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageShell } from '../../components/layout/PageShell'
import { FoodCard } from '../../components/food/FoodCard'
import { EditorialHeading } from '../../components/typography/EditorialHeading'
import { LoadingState, EmptyState } from '../../components/feedback/States'
import { getCollection, fetchCollectionFoods } from '../../api/collections'
import { useCartStore } from '../../state/cartStore'
import type { Food } from '../../types'

export function CollectionDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const collection = slug ? getCollection(slug) : undefined
  const [foods, setFoods] = useState<Food[] | null>(null)
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    if (!slug) return
    setFoods(null)
    fetchCollectionFoods(slug).then((res) => setFoods(res.data))
  }, [slug])

  if (!collection) {
    return (
      <PageShell>
        <EmptyState
          title="Nothing hit the spot."
          subtitle="That collection doesn't exist."
          action={
            <Link to="/collections" className="mt-2 text-sm font-semibold text-sun-orange hover:underline">
              Back to Collections →
            </Link>
          }
        />
      </PageShell>
    )
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-5 pb-6 pt-12 lg:px-10">
        <Link to="/collections" className="text-sm font-semibold text-muted-ink hover:text-deep-ink">
          ← Back to Collections
        </Link>
        <EditorialHeading lines={[collection.name]} size="lg" className="mt-4" />
        <p className="mt-3 max-w-sm text-muted-ink">{collection.tagline}</p>
      </section>

      {foods === null && <LoadingState />}

      {foods && foods.length === 0 && (
        <EmptyState title="Nothing hit the spot." subtitle="Try a different collection." />
      )}

      {foods && foods.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-10">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {foods.map((food) => (
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
