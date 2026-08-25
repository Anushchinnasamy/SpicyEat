interface Props {
  selected: boolean
  onSelect: () => void
  icon: string
  title: string
  subtitle: string
}

/** Generic selectable card used for delivery options and payment methods. */
export function OptionCard({ selected, onSelect, icon, title, subtitle }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex flex-1 items-center gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors ${
        selected ? 'border-sun-orange bg-sun-orange/10' : 'border-deep-ink/10 bg-white/60 hover:border-deep-ink/25'
      }`}
    >
      <span className="text-xl" aria-hidden>
        {icon}
      </span>
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-xs text-muted-ink">{subtitle}</span>
      </span>
    </button>
  )
}
