import { SPICE_LABELS, type SpiceLevel } from '../../types'

const LEVELS: SpiceLevel[] = [1, 2, 3, 4]

interface Props {
  level: SpiceLevel
  showLabel?: boolean
  size?: 'sm' | 'md'
  interactive?: boolean
  onChange?: (level: SpiceLevel) => void
}

/** Reusable 4-pip chilli scale. Pass onChange + interactive to make it a selector. */
export function SpiceIndicator({ level, showLabel = false, size = 'md', interactive = false, onChange }: Props) {
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'
  return (
    <div className={`inline-flex items-center gap-2 ${textSize}`}>
      <div className="flex gap-0.5" role={interactive ? 'radiogroup' : undefined} aria-label="Spice level">
        {LEVELS.map((l) => {
          const active = l <= level
          const Comp = interactive ? 'button' : 'span'
          return (
            <Comp
              key={l}
              type={interactive ? 'button' : undefined}
              role={interactive ? 'radio' : undefined}
              aria-checked={interactive ? l === level : undefined}
              aria-label={interactive ? `${SPICE_LABELS[l].label} spice` : undefined}
              onClick={interactive ? () => onChange?.(l) : undefined}
              className={`transition-transform duration-150 ${
                active ? 'scale-100 opacity-100' : 'scale-90 opacity-30'
              } ${interactive ? 'cursor-pointer hover:scale-110' : ''}`}
            >
              🌶️
            </Comp>
          )
        })}
      </div>
      {showLabel && <span className="font-semibold uppercase tracking-wide">{SPICE_LABELS[level].label}</span>}
    </div>
  )
}
