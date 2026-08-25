import { useState } from 'react'
import type { Offer } from '../../api/offers'

const ACCENT_CLASSES: Record<Offer['accent'], string> = {
  orange: 'bg-sun-orange text-white',
  lavender: 'bg-soft-lavender text-deep-ink',
  dark: 'bg-deep-ink text-warm-canvas',
}

export function OfferCard({ offer }: { offer: Offer }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(offer.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className={`flex flex-col justify-between gap-6 rounded-3xl p-6 sm:p-8 ${ACCENT_CLASSES[offer.accent]}`}>
      <div>
        <p className="font-display text-3xl uppercase leading-none sm:text-4xl">{offer.title}</p>
        <p className="mt-3 text-sm opacity-80">{offer.description}</p>
        <p className="mt-4 text-xs opacity-60">{offer.terms}</p>
      </div>

      <button
        type="button"
        onClick={handleCopy}
        className="flex items-center justify-between gap-3 self-start rounded-full border border-current/30 px-5 py-2.5 text-sm font-bold tracking-wide transition-opacity hover:opacity-80"
      >
        {copied ? 'Copied ✓' : offer.code}
        {!copied && <span aria-hidden>⧉</span>}
      </button>
    </div>
  )
}
