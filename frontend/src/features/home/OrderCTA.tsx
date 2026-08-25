import { LinkButton } from '../../components/buttons/Button'
import { Eyebrow, EditorialHeading } from '../../components/typography/EditorialHeading'

export function OrderCTA() {
  return (
    <section className="bg-soft-lavender">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 py-16 sm:flex-row sm:items-center lg:px-10">
        <div>
          <Eyebrow>Deals that hit different</Eyebrow>
          <EditorialHeading size="md" lines={['Good food.', 'Great deals.']} accentLine={1} className="mt-2" />
          <LinkButton to="/offers" variant="dark" className="mt-6">
            View Offers →
          </LinkButton>
        </div>

        <div className="relative rounded-2xl bg-warm-canvas px-8 py-6 text-center shadow-lg">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-ink">Get upto</p>
          <p className="font-display text-5xl text-soft-lavender">40% Off</p>
          <p className="mt-1 text-xs font-semibold uppercase text-muted-ink">On selected items</p>
          <p className="mt-3 rounded-full bg-deep-ink px-4 py-2 text-xs font-bold uppercase text-warm-canvas">
            Use code: Spicy40
          </p>
        </div>
      </div>
    </section>
  )
}
