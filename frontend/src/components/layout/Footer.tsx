import { motion } from 'framer-motion'
import { useReducedMotion } from '../../hooks/useReducedMotion'

const chillies = [
  { top: '10%', left: '8%', size: 'text-3xl', delay: 0 },
  { top: '60%', left: '18%', size: 'text-2xl', delay: 0.4 },
  { top: '25%', left: '85%', size: 'text-4xl', delay: 0.8 },
  { top: '70%', left: '92%', size: 'text-2xl', delay: 1.2 },
]

const perks = [
  { icon: '🔥', title: 'Freshly Made', desc: "Food that's hot and made just for you." },
  { icon: '🥗', title: 'Quality Ingredients', desc: 'We use only the best, always.' },
  { icon: '🛵', title: 'Fast Delivery', desc: 'Quick, tracked and right to your door.' },
  { icon: '⭐', title: 'Rewards', desc: 'Eat more. Earn more. Unlock exclusive perks.' },
]

export function Footer() {
  const reduced = useReducedMotion()

  return (
    <footer className="relative overflow-hidden bg-deep-ink text-warm-canvas">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-5 py-12 sm:grid-cols-4 lg:px-10">
        {perks.map((perk) => (
          <div key={perk.title} className="flex flex-col gap-2">
            <span className="text-2xl" aria-hidden>
              {perk.icon}
            </span>
            <p className="font-display text-sm uppercase tracking-wide">{perk.title}</p>
            <p className="text-xs text-warm-canvas/60">{perk.desc}</p>
          </div>
        ))}
      </div>

      <div className="relative border-t border-warm-canvas/10 px-5 py-14 lg:px-10">
        {!reduced &&
          chillies.map((c, i) => (
            <motion.span
              key={i}
              aria-hidden
              className={`pointer-events-none absolute select-none opacity-20 ${c.size}`}
              style={{ top: c.top, left: c.left }}
              animate={{ y: [0, -14, 0], rotate: [0, 12, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, delay: c.delay, ease: 'easeInOut' }}
            >
              🌶️
            </motion.span>
          ))}

        <div className="relative flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
          <div>
            <p className="font-display text-4xl uppercase leading-none sm:text-5xl">
              Drop a chilli.
              <br />
              <span className="text-sun-orange">Or 20.</span>
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-warm-canvas/60">
              Get spicy updates &amp; offers!
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex overflow-hidden rounded-full border border-warm-canvas/20"
            >
              <input
                type="email"
                required
                placeholder="Your email"
                aria-label="Email address"
                className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-warm-canvas/40"
              />
              <button
                type="submit"
                className="shrink-0 bg-sun-orange px-5 text-sm font-bold text-white transition-colors hover:bg-chili-red"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="relative mt-10 flex flex-col items-start justify-between gap-4 border-t border-warm-canvas/10 pt-6 text-xs text-warm-canvas/50 sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} SpicyEat. All rights reserved.</p>
          <div className="flex gap-4 text-sm">
            <a href="#" aria-label="Instagram" className="hover:text-warm-canvas">
              Instagram
            </a>
            <a href="#" aria-label="Facebook" className="hover:text-warm-canvas">
              Facebook
            </a>
            <a href="#" aria-label="X" className="hover:text-warm-canvas">
              X
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
