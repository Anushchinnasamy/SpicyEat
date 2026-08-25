import { Eyebrow, EditorialHeading } from '../../components/typography/EditorialHeading'

export function BrandStory() {
  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-2 lg:items-center lg:px-10">
      <img
        src="/images/chicken-fingers/spicyeat-crispy-chicken-feast.png"
        alt="SpicyEat crispy chicken feast"
        className="aspect-[4/3] w-full rounded-[2rem] object-cover"
      />
      <div>
        <Eyebrow>Made with real heat</Eyebrow>
        <EditorialHeading size="md" lines={['Cooking something', 'good, on purpose.']} className="mt-2" />
        <p className="mt-6 max-w-md text-sm text-muted-ink">
          SpicyEat started with one idea: fast food doesn't have to mean forgettable food. Every burger is smashed
          to order, every wing is double-fried, and every spice level is exactly as brave as you choose.
        </p>
      </div>
    </section>
  )
}
