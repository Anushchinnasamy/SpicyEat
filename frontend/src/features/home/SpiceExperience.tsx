import { SPICE_LABELS, type SpiceLevel } from '../../types'

const LEVELS: SpiceLevel[] = [1, 2, 3, 4]

export function SpiceExperience() {
  return (
    <section className="bg-soft-lavender/60 py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <div>
          <p className="font-display text-2xl uppercase leading-none sm:text-3xl">
            How brave
            <br />
            are you?
          </p>
        </div>
        <div className="grid grid-cols-2 gap-6 sm:flex sm:gap-10">
          {LEVELS.map((level) => (
            <div key={level} className="flex flex-col items-center gap-1 text-center sm:items-start sm:text-left">
              <span className="text-lg">{'🌶️'.repeat(level)}</span>
              <p className="font-display text-sm uppercase">{SPICE_LABELS[level].label}</p>
              <p className="text-xs text-deep-ink/60">{SPICE_LABELS[level].hint}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
