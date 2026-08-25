import { PageShell } from '../components/layout/PageShell'
import { EditorialHeading } from '../components/typography/EditorialHeading'
import { LinkButton } from '../components/buttons/Button'

export function ComingSoonPage({ title }: { title: string }) {
  return (
    <PageShell>
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-5 py-32 text-center">
        <span className="text-4xl" aria-hidden>
          🌶️
        </span>
        <EditorialHeading align="center" size="md" lines={[title, 'Cooking something good...']} accentLine={1} />
        <LinkButton to="/">Back to Home</LinkButton>
      </div>
    </PageShell>
  )
}
