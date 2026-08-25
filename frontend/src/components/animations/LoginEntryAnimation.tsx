import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useReducedMotion } from '../../hooks/useReducedMotion'

const INGREDIENTS = ['🧀', '🌶️', '🍗', '🍅', '🧅', '🧄']

type Phase = 'success' | 'hangTight' | 'burst' | 'vortex' | 'logo' | 'letsEat'

const PHASE_DURATIONS: Record<Phase, number> = {
  success: 500,
  hangTight: 700,
  burst: 600,
  vortex: 700,
  logo: 700,
  letsEat: 600,
}

const ORDER: Phase[] = ['success', 'hangTight', 'burst', 'vortex', 'logo', 'letsEat']

export function LoginEntryAnimation({ onComplete }: { onComplete: () => void }) {
  const reducedMotion = useReducedMotion()
  const [phaseIndex, setPhaseIndex] = useState(0)

  useEffect(() => {
    if (reducedMotion) {
      const timer = setTimeout(onComplete, 400)
      return () => clearTimeout(timer)
    }

    if (phaseIndex >= ORDER.length) {
      onComplete()
      return
    }

    const timer = setTimeout(() => setPhaseIndex((i) => i + 1), PHASE_DURATIONS[ORDER[phaseIndex]])
    return () => clearTimeout(timer)
  }, [phaseIndex, reducedMotion, onComplete])

  if (reducedMotion) {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-deep-ink text-warm-canvas"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <p className="font-display text-3xl uppercase">Let's eat!</p>
      </motion.div>
    )
  }

  const phase = ORDER[phaseIndex]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-deep-ink text-warm-canvas">
      <AnimatePresence mode="wait">
        {phase === 'success' && (
          <motion.p
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="font-display text-4xl uppercase text-herb-green sm:text-5xl"
          >
            Login Success
          </motion.p>
        )}

        {phase === 'hangTight' && (
          <motion.p
            key="hangTight"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-md px-6 text-center font-display text-3xl uppercase leading-tight sm:text-4xl"
          >
            Hang tight. Good food is on the way.
          </motion.p>
        )}

        {phase === 'burst' && (
          <motion.div key="burst" className="relative flex h-64 w-64 items-center justify-center">
            {Array.from({ length: 10 }).map((_, i) => {
              const angle = (i / 10) * Math.PI * 2
              return (
                <motion.span
                  key={i}
                  className="absolute text-3xl"
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
                  animate={{
                    x: Math.cos(angle) * 130,
                    y: Math.sin(angle) * 130,
                    opacity: 0,
                    scale: 1.2,
                  }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                  🌶️
                </motion.span>
              )
            })}
          </motion.div>
        )}

        {phase === 'vortex' && (
          <motion.div key="vortex" className="relative flex h-64 w-64 items-center justify-center">
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.7, ease: 'linear' }}
            >
              {INGREDIENTS.map((ing, i) => {
                const angle = (i / INGREDIENTS.length) * Math.PI * 2
                return (
                  <span
                    key={ing}
                    className="absolute text-2xl"
                    style={{
                      left: `calc(50% + ${Math.cos(angle) * 100}px)`,
                      top: `calc(50% + ${Math.sin(angle) * 100}px)`,
                    }}
                  >
                    {ing}
                  </span>
                )
              })}
            </motion.div>
          </motion.div>
        )}

        {phase === 'logo' && (
          <motion.p
            key="logo"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="font-display text-5xl uppercase tracking-tight sm:text-6xl"
          >
            Spicy<span className="text-sun-orange">Eat</span>
          </motion.p>
        )}

        {phase === 'letsEat' && (
          <motion.p
            key="letsEat"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="font-display text-5xl uppercase text-sun-orange sm:text-6xl"
          >
            Let's eat!
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
