import { PageShell } from '../../components/layout/PageShell'
import { Hero } from './Hero'
import { IngredientStory } from './IngredientStory'
import { CategoryShowcase } from './CategoryShowcase'
import { SpiceExperience } from './SpiceExperience'
import { BestSellers } from './BestSellers'
import { BrandStory } from './BrandStory'
import { OrderCTA } from './OrderCTA'

export function HomePage() {
  return (
    <PageShell transparentNav>
      <Hero />
      <IngredientStory />
      <CategoryShowcase />
      <SpiceExperience />
      <BestSellers />
      <BrandStory />
      <OrderCTA />
    </PageShell>
  )
}
