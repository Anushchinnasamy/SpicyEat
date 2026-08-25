import { Eyebrow, EditorialHeading } from '../../components/typography/EditorialHeading'
import { CategoryRail } from '../../components/food/CategoryRail'
import { useCategories } from '../../hooks/useCategories'

export function CategoryShowcase() {
  const { categories } = useCategories()

  return (
    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-10">
      <Eyebrow>Pick your poison</Eyebrow>
      <EditorialHeading size="md" lines={["What's your", 'craving today?']} className="mt-2" />
      <div className="mt-8">{categories && <CategoryRail categories={categories} />}</div>
    </section>
  )
}
