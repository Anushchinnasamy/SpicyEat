import { Link } from 'react-router-dom'
import type { Food } from '../../types'
import { useFavouritesStore } from '../../state/favouritesStore'
import { SpiceIndicator } from './SpiceIndicator'
import { VegBadge } from './VegBadge'

interface Props {
  food: Food
  onQuickAdd?: (food: Food) => void
}

export function FoodCard({ food, onQuickAdd }: Props) {
  const isFavourite = useFavouritesStore((s) => s.ids.has(food.id))
  const toggleFavourite = useFavouritesStore((s) => s.toggle)

  return (
    <Link
      to={`/menu/${food.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-deep-ink/5 transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden bg-deep-ink/5">
        <img
          src={food.images[0]}
          alt={food.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {food.bestseller && (
          <span className="absolute left-3 top-3 rounded-full bg-sun-orange px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            Bestseller
          </span>
        )}
        <span className="absolute right-3 top-3 flex flex-col items-end gap-2">
          <VegBadge isVeg={food.isVeg} />
          <button
            type="button"
            aria-label={isFavourite ? `Remove ${food.name} from favourites` : `Add ${food.name} to favourites`}
            onClick={(e) => {
              e.preventDefault()
              toggleFavourite(food.id, food.name)
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-sm shadow-sm backdrop-blur transition-transform hover:scale-110"
          >
            {isFavourite ? '❤️' : '🤍'}
          </button>
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-lg uppercase leading-tight tracking-tight">{food.name}</h3>
        <SpiceIndicator level={food.spiceLevel} size="sm" />
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-display text-xl">₹{food.price}</span>
          <button
            type="button"
            aria-label={`Add ${food.name} to cart`}
            onClick={(e) => {
              e.preventDefault()
              onQuickAdd?.(food)
            }}
            className="flex h-10 min-w-11 items-center justify-center rounded-full bg-deep-ink px-4 text-sm font-bold text-warm-canvas transition-colors hover:bg-sun-orange"
          >
            Add
          </button>
        </div>
      </div>
    </Link>
  )
}
