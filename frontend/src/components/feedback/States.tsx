import type { ReactNode } from 'react'

interface StateProps {
  title: string
  subtitle?: string
  action?: ReactNode
}

function StateBlock({ title, subtitle, action, emoji }: StateProps & { emoji: string }) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-24 text-center">
      <span className="text-4xl" aria-hidden>
        {emoji}
      </span>
      <p className="font-display text-2xl uppercase sm:text-3xl">{title}</p>
      {subtitle && <p className="max-w-sm text-sm text-muted-ink">{subtitle}</p>}
      {action}
    </div>
  )
}

export function LoadingState({ title = 'Cooking something good...' }: { title?: string }) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-24 text-center" role="status" aria-live="polite">
      <span className="animate-chilli-spin text-4xl" aria-hidden>
        🌶️
      </span>
      <p className="font-display text-xl uppercase sm:text-2xl">{title}</p>
    </div>
  )
}

export function EmptyState(props: StateProps) {
  return <StateBlock emoji="🍽️" {...props} />
}

export function ErrorState({
  title = 'Something got a little too hot.',
  subtitle = 'Try again.',
  action,
}: StateProps) {
  return <StateBlock emoji="🔥" title={title} subtitle={subtitle} action={action} />
}
