import { motion } from 'framer-motion'
import { useReducedMotion } from '../../hooks/useReducedMotion'

type ParticleKind = 'chili' | 'flake' | 'crumb' | 'ember'

interface Particle {
  kind: ParticleKind
  top: string
  left: string
  size: number
  opacity: number
  duration: number
  delay: number
  /** Hide on small screens to keep mobile clean and cheap. */
  visibleFrom?: 'sm' | 'lg'
}

const PARTICLES: Particle[] = [
  { kind: 'chili', top: '8%', left: '4%', size: 22, opacity: 0.85, duration: 7, delay: 0 },
  { kind: 'ember', top: '18%', left: '92%', size: 8, opacity: 0.7, duration: 5.5, delay: 0.4 },
  { kind: 'flake', top: '78%', left: '10%', size: 10, opacity: 0.6, duration: 6.5, delay: 0.8 },
  { kind: 'crumb', top: '86%', left: '88%', size: 7, opacity: 0.55, duration: 6, delay: 1.2, visibleFrom: 'sm' },
  { kind: 'ember', top: '4%', left: '55%', size: 6, opacity: 0.6, duration: 4.5, delay: 0.2, visibleFrom: 'sm' },
  { kind: 'flake', top: '52%', left: '96%', size: 9, opacity: 0.5, duration: 7.5, delay: 1.6, visibleFrom: 'lg' },
  { kind: 'crumb', top: '35%', left: '2%', size: 6, opacity: 0.5, duration: 8, delay: 0.6, visibleFrom: 'lg' },
  { kind: 'ember', top: '95%', left: '48%', size: 7, opacity: 0.65, duration: 5, delay: 1, visibleFrom: 'lg' },
]

function ParticleShape({ kind, size }: { kind: ParticleKind; size: number }) {
  if (kind === 'chili') {
    return (
      <span style={{ fontSize: size }} aria-hidden>
        🌶️
      </span>
    )
  }
  if (kind === 'ember') {
    return (
      <span
        aria-hidden
        className="block rounded-full bg-sun-orange blur-[1px]"
        style={{ width: size, height: size, boxShadow: '0 0 8px 2px rgba(250,126,59,0.6)' }}
      />
    )
  }
  if (kind === 'flake') {
    return (
      <span
        aria-hidden
        className="block rotate-45 rounded-sm bg-chili-red"
        style={{ width: size, height: size * 0.6, opacity: 0.9 }}
      />
    )
  }
  return (
    <span
      aria-hidden
      className="block rounded-full bg-[#c98a4b]"
      style={{ width: size, height: size }}
    />
  )
}

const visibilityClass: Record<NonNullable<Particle['visibleFrom']>, string> = {
  sm: 'hidden sm:block',
  lg: 'hidden lg:block',
}

/** Ambient chili flake / ember / crumb field for the hero. Purely decorative. */
export function FloatingSpiceParticles() {
  const reducedMotion = useReducedMotion()

  return (
    <div className="pointer-events-none absolute inset-0 overflow-visible" aria-hidden>
      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className={`absolute ${p.visibleFrom ? visibilityClass[p.visibleFrom] : ''}`}
          style={{ top: p.top, left: p.left, opacity: p.opacity }}
          animate={
            reducedMotion
              ? undefined
              : {
                  y: [0, -16, 0],
                  x: [0, 5, 0],
                  rotate: [0, 8, 0],
                }
          }
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <ParticleShape kind={p.kind} size={p.size} />
        </motion.div>
      ))}
    </div>
  )
}
