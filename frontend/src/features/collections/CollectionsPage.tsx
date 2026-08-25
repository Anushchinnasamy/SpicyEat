import { Link } from 'react-router-dom'
import { PageShell } from '../../components/layout/PageShell'
import { EditorialHeading, Eyebrow } from '../../components/typography/EditorialHeading'
import { collections } from '../../api/collections'

export function CollectionsPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-5 pb-6 pt-12 lg:px-10">
        <Eyebrow>Pick a mood</Eyebrow>
        <EditorialHeading lines={['Collections']} size="lg" className="mt-2" />
        <p className="mt-4 max-w-sm text-muted-ink">Curated line-ups for whatever kind of hungry you're feeling.</p>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((c) => (
            <Link
              key={c.slug}
              to={`/collections/${c.slug}`}
              className="group relative flex h-64 flex-col justify-end overflow-hidden rounded-3xl bg-deep-ink text-warm-canvas"
            >
              <img
                src={c.image}
                alt={c.name}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <div className="relative p-6">
                <h3 className="font-display text-2xl uppercase leading-none">{c.name}</h3>
                <p className="mt-2 text-xs text-warm-canvas/70">{c.tagline}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  )
}
