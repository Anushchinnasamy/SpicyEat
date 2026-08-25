import { motion } from 'framer-motion'
import { AnimatedHeadline } from './AnimatedHeadline'
import { HeroCTA } from './HeroCTA'
import { HeroFood } from './HeroFood'
import { useReducedMotion } from '../../hooks/useReducedMotion'

const perks = [
  { icon: '🔥', title: 'Real Heat', desc: 'No compromises. Just fire.' },
  { icon: '🍗', title: 'Crispy', desc: 'Crunch in every single bite.' },
  { icon: '🌿', title: 'Fresh', desc: 'Quality ingredients. Always.' },
  { icon: '❤️', title: 'Made For You', desc: 'Cooked with love, served hot.' },
]

export function Hero() {
  const reducedMotion = useReducedMotion()

  return (
    <motion.section
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="relative min-h-[100svh] w-full overflow-hidden bg-deep-ink text-warm-canvas lg:min-h-screen"
    >
      <HeroFood />

      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-deep-ink from-10% via-deep-ink/70 via-40% to-transparent to-75%"
      />

      <div className="relative z-10 flex min-h-[100svh] w-full flex-col px-5 pb-10 pt-28 sm:px-8 lg:min-h-screen lg:px-12 lg:pt-32 xl:px-16">
        <div className="flex flex-1 flex-col justify-center">
          <AnimatedHeadline lines={['Spicy.', 'Crispy.', 'Good.']} accentLine={2} />

          <motion.p
            initial={reducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.9, ease: 'easeOut' }}
            className="mt-6 max-w-sm text-warm-canvas/75"
          >
            Bold flavors. Real heat.
            <br />
            Food you'll <span className="font-semibold text-sun-orange">crave</span> again.
          </motion.p>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1, ease: 'easeOut' }}
            className="mt-8 flex items-center gap-4"
          >
            <HeroCTA to="/menu">Explore Menu</HeroCTA>
            <button
              type="button"
              aria-label="Watch our story"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-warm-canvas/40 text-xs transition-colors hover:border-sun-orange hover:text-sun-orange"
            >
              ▶
            </button>
            <span className="text-sm font-semibold text-warm-canvas/75">
              Too hot to handle?
              <br className="sm:hidden" /> We love it.
            </span>
          </motion.div>
        </div>

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.3, ease: 'easeOut' }}
          className="grid grid-cols-2 gap-x-6 gap-y-6 sm:flex sm:divide-x sm:divide-warm-canvas/15"
        >
          {perks.map((p) => (
            <div key={p.title} className="flex flex-col gap-2 sm:px-6 sm:first:pl-0">
              <span className="text-xl" aria-hidden>
                {p.icon}
              </span>
              <p className="font-display text-sm uppercase">{p.title}</p>
              <p className="text-xs text-warm-canvas/60">{p.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  )
}
