import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageShell } from '../../components/layout/PageShell'
import { CartItemRow } from '../../components/cart/CartItemRow'
import { OrderSummary } from '../../components/cart/OrderSummary'
import { FoodCard } from '../../components/food/FoodCard'
import { EditorialHeading } from '../../components/typography/EditorialHeading'
import { EmptyState } from '../../components/feedback/States'
import { LinkButton } from '../../components/buttons/Button'
import { useCartStore, cartSubtotal } from '../../state/cartStore'
import { fetchMenu } from '../../api/menu'
import type { Food } from '../../types'

export function CartPage() {
  const items = useCartStore((s) => s.items)
  const setQuantity = useCartStore((s) => s.setQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const addItem = useCartStore((s) => s.addItem)
  const [recommended, setRecommended] = useState<Food[]>([])

  useEffect(() => {
    fetchMenu({ category: 'sides' }).then((res) => setRecommended(res.data.slice(0, 4)))
  }, [])

  const subtotal = cartSubtotal(items)

  if (items.length === 0) {
    return (
      <PageShell>
        <EmptyState
          title="This feels a little too healthy."
          subtitle="Your cart is empty. Let's fix that."
          action={
            <LinkButton to="/menu" className="mt-2">
              Explore Menu →
            </LinkButton>
          }
        />
      </PageShell>
    )
  }

  return (
    <PageShell hideFooter>
      <div className="mx-auto max-w-7xl px-5 pb-32 pt-12 lg:px-10">
        <EditorialHeading lines={['Your cart.', 'Good choices.']} size="lg" accentLine={1} />

        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <CartItemRow
                key={item.lineId}
                item={item}
                onQuantityChange={(q) => setQuantity(item.lineId, q)}
                onRemove={() => removeItem(item.lineId)}
              />
            ))}

            {recommended.length > 0 && (
              <div className="mt-6">
                <p className="font-display text-xl uppercase">Make it a combo</p>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {recommended.map((food) => (
                    <FoodCard
                      key={food.id}
                      food={food}
                      onQuickAdd={(f) => addItem({ food: f, quantity: 1, spiceLevel: f.spiceLevel })}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6">
            <OrderSummary subtotal={subtotal} />
            <Link
              to="/checkout"
              className="flex min-h-11 items-center justify-center rounded-full bg-sun-orange px-6 py-4 font-display text-lg uppercase text-white transition-colors hover:bg-chili-red"
            >
              Let's Eat.
            </Link>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-deep-ink/10 bg-warm-canvas/95 p-4 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-ink">Subtotal</p>
            <p className="font-display text-xl">₹{subtotal}</p>
          </div>
          <Link
            to="/checkout"
            className="flex min-h-11 flex-1 items-center justify-center rounded-full bg-sun-orange px-6 font-display uppercase text-white"
          >
            Let's Eat.
          </Link>
        </div>
      </div>
    </PageShell>
  )
}
