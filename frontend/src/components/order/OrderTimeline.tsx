import type { OrderStatus } from '../../types'

const STAGES: { status: OrderStatus; label: string }[] = [
  { status: 'PLACED', label: 'Placed' },
  { status: 'CONFIRMED', label: 'Confirmed' },
  { status: 'PREPARING', label: 'Preparing' },
  { status: 'READY', label: 'Ready' },
  { status: 'ASSIGNED', label: 'Assigned' },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { status: 'DELIVERED', label: 'Delivered' },
]

export function OrderTimeline({ status }: { status: OrderStatus }) {
  const currentIndex = STAGES.findIndex((s) => s.status === status)

  return (
    <ol className="flex w-full items-start justify-between gap-1">
      {STAGES.map((stage, i) => {
        const done = i <= currentIndex
        const active = i === currentIndex
        return (
          <li key={stage.status} className="relative flex flex-1 flex-col items-center text-center">
            {i > 0 && (
              <span
                aria-hidden
                className={`absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2 ${
                  i <= currentIndex ? 'bg-sun-orange' : 'bg-deep-ink/10'
                }`}
              />
            )}
            <span
              className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                done
                  ? 'border-sun-orange bg-sun-orange text-white'
                  : 'border-deep-ink/15 bg-warm-canvas text-muted-ink'
              } ${active ? 'ring-4 ring-sun-orange/20' : ''}`}
            >
              {done ? '✓' : i + 1}
            </span>
            <span
              className={`mt-2 max-w-[70px] text-[11px] font-semibold uppercase leading-tight sm:max-w-none sm:text-xs ${
                done ? 'text-deep-ink' : 'text-muted-ink'
              }`}
            >
              {stage.label}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
