import { Link } from 'react-router-dom'
import type { Food } from '../../types'
import { SpiceIndicator } from './SpiceIndicator'

interface Props {
  food: Food
}

/** Large editorial hero-style card used for menu category feature slots. */
export function FeaturedFoodCard({ food }: Props) {
  return (
    <Link
      to={`/menu/${food.slug}`}
      className="group relative flex min-h-[420px] flex-col justify-end overflow-hidden rounded-3xl bg-deep-ink text-warm-canvas"
    >
      <img
        src={food.images[0]}
        alt={food.name}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
      <div className="relative flex flex-col gap-3 p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-sun-orange">{food.tagline}</p>
        <h3 className="font-display text-4xl uppercase leading-[0.95] sm:text-5xl">{food.name}</h3>
        <div className="flex items-center gap-4">
          <SpiceIndicator level={food.spiceLevel} />
          <span className="font-display text-2xl">₹{food.price}</span>
        </div>
      </div>
    </Link>
  )
}
