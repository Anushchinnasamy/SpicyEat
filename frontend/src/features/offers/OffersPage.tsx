import { useEffect, useState } from 'react'
import { PageShell } from '../../components/layout/PageShell'
import { EditorialHeading, Eyebrow } from '../../components/typography/EditorialHeading'
import { OfferCard } from '../../components/offers/OfferCard'
import { LoadingState } from '../../components/feedback/States'
import { fetchOffers, type Offer } from '../../api/offers'

export function OffersPage() {
  const [offers, setOffers] = useState<Offer[] | null>(null)

  useEffect(() => {
    fetchOffers().then((res) => setOffers(res.data))
  }, [])

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-5 pb-6 pt-12 lg:px-10">
        <Eyebrow>Deals that hit different</Eyebrow>
        <EditorialHeading lines={['Good food.', 'Great deals.']} accentLine={1} size="lg" className="mt-2" />
      </section>

      {offers === null && <LoadingState />}

      {offers && (
        <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {offers.map((offer) => (
              <OfferCard key={offer.code} offer={offer} />
            ))}
          </div>
        </section>
      )}
    </PageShell>
  )
}
