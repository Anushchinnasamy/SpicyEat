import { useEffect, useState } from 'react'
import { PageShell } from '../../components/layout/PageShell'
import { FoodCard } from '../../components/food/FoodCard'
import { EditorialHeading } from '../../components/typography/EditorialHeading'
import { EmptyState, LoadingState } from '../../components/feedback/States'
import { searchFoods, popularSearches } from '../../api/search'
import { useDebounce } from '../../hooks/useDebounce'
import { useCartStore } from '../../state/cartStore'
import type { Food } from '../../types'

const RECENT_KEY = 'spicyeat-recent-searches'

function getRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]')
  } catch {
    return []
  }
}

function pushRecent(term: string) {
  const next = [term, ...getRecent().filter((t) => t !== term)].slice(0, 6)
  localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  return next
}

export function SearchPage() {
  const [query, setQuery] = useState('')
  const debounced = useDebounce(query, 300)
  const [results, setResults] = useState<Food[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [recent, setRecent] = useState<string[]>(() => getRecent())
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    if (!debounced.trim()) {
      setResults(null)
      return
    }
    setLoading(true)
    searchFoods(debounced).then((res) => {
      setResults(res.data)
      setLoading(false)
    })
  }, [debounced])

  function runSearch(term: string) {
    setQuery(term)
    setRecent(pushRecent(term))
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-3xl px-5 pb-10 pt-12 text-center lg:px-10">
        <EditorialHeading align="center" lines={['Find your', 'craving.']} size="lg" />
        <div className="mx-auto mt-8 flex items-center gap-3 rounded-full border border-deep-ink/15 bg-white px-6 py-4">
          <span aria-hidden>🔍</span>
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runSearch(query)}
            placeholder="Search burgers, pizza, fries..."
            className="w-full bg-transparent text-lg outline-none placeholder:text-muted-ink/50"
          />
        </div>
      </section>

      {!query && (
        <section className="mx-auto max-w-3xl px-5 pb-16 lg:px-10">
          {recent.length > 0 && (
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-ink">Recent searches</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {recent.map((term) => (
                  <button
                    key={term}
                    onClick={() => runSearch(term)}
                    className="rounded-full border border-deep-ink/15 px-4 py-2 text-sm hover:border-deep-ink/40"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted-ink">Popular searches</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => runSearch(term)}
                  className="rounded-full bg-soft-lavender/40 px-4 py-2 text-sm font-semibold hover:bg-soft-lavender/70"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {query && loading && <LoadingState />}

      {query && !loading && results && results.length === 0 && (
        <EmptyState title="Nothing hit the spot." subtitle="Try something spicier." />
      )}

      {query && !loading && results && results.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-10">
          <p className="mb-6 text-sm font-semibold text-muted-ink">
            {results.length} result{results.length > 1 ? 's' : ''} for "{query}"
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {results.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
                onQuickAdd={(f) => addItem({ food: f, quantity: 1, spiceLevel: f.spiceLevel })}
              />
            ))}
          </div>
        </section>
      )}
    </PageShell>
  )
}
