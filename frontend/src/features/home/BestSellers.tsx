import { useEffect, useState } from 'react'
import { LinkButton } from '../../components/buttons/Button'
import { FoodCard } from '../../components/food/FoodCard'
import { Eyebrow, EditorialHeading } from '../../components/typography/EditorialHeading'
import { fetchBestsellers } from '../../api/menu'
import { useCartStore } from '../../state/cartStore'
import type { Food } from '../../types'

export function BestSellers() {
  const [items, setItems] = useState<Food[]>([])
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    fetchBestsellers(4).then((res) => setItems(res.data))
  }, [])

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Can't get enough</Eyebrow>
          <EditorialHeading size="md" lines={['Popular', 'right now 🔥']} className="mt-2" />
        </div>
        <LinkButton to="/menu" variant="outline">
          View All Menu
        </LinkButton>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((food) => (
          <FoodCard
            key={food.id}
            food={food}
            onQuickAdd={(f) => addItem({ food: f, quantity: 1, spiceLevel: f.spiceLevel })}
          />
        ))}
      </div>
    </section>
  )
}
