import { Link } from 'react-router-dom'
import type { Category } from '../../types'

interface Props {
  categories: Category[]
  activeSlug?: string
}

export function CategoryRail({ categories, activeSlug }: Props) {
  return (
    <div className="flex snap-x gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-8 lg:overflow-visible">
      {categories.map((cat) => (
        <Link
          key={cat.slug}
          to={`/menu?category=${cat.slug}`}
          className={`group relative flex h-40 w-32 shrink-0 snap-start flex-col justify-end overflow-hidden rounded-2xl lg:h-48 lg:w-full ${
            activeSlug === cat.slug ? 'ring-2 ring-sun-orange' : ''
          }`}
        >
          <img
            src={cat.image}
            alt={cat.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <div className="relative p-3 text-warm-canvas">
            <p className="font-display text-sm uppercase leading-tight sm:text-base">{cat.name}</p>
            <p className="text-[11px] opacity-80">{cat.itemCount} Items</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
