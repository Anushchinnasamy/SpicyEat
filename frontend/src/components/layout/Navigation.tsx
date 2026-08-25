import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useCartStore, cartItemCount } from '../../state/cartStore'
import { useReducedMotion } from '../../hooks/useReducedMotion'

const links = [
  { to: '/menu', label: 'Menu' },
  { to: '/explore', label: 'Explore' },
  { to: '/collections', label: 'Collections' },
  { to: '/offers', label: 'Offers' },
  { to: '/rewards', label: 'Rewards' },
]

export const NAV_HEIGHT = 76

interface Props {
  /** Starts transparent with light text over a dark hero, then solidifies once scrolled. */
  transparentAtTop?: boolean
}

export function Navigation({ transparentAtTop = false }: Props) {
  const items = useCartStore((s) => s.items)
  const count = cartItemCount(items)
  const reducedMotion = useReducedMotion()
  const [solid, setSolid] = useState(!transparentAtTop)

  useEffect(() => {
    if (!transparentAtTop) return
    function onScroll() {
      setSolid(window.scrollY > 80)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [transparentAtTop])

  const dark = transparentAtTop && !solid

  return (
    <motion.header
      initial={reducedMotion ? false : { y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{ height: NAV_HEIGHT }}
      className={`fixed inset-x-0 top-0 z-40 border-b transition-colors duration-300 ${
        solid ? 'border-deep-ink/5 bg-warm-canvas/90 backdrop-blur' : 'border-transparent bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-5 lg:px-10">
        <Link
          to="/"
          className={`flex items-center gap-1.5 font-display text-xl uppercase tracking-tight transition-colors ${
            dark ? 'text-warm-canvas' : 'text-deep-ink'
          }`}
        >
          <span aria-hidden>🌶️</span>
          Spicy<span className="text-sun-orange">Eat</span>
        </Link>

        <ul className="hidden items-center gap-7 text-sm font-semibold uppercase tracking-wide lg:flex">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `group relative inline-block py-1 transition-colors hover:text-sun-orange ${
                    isActive ? 'text-sun-orange' : dark ? 'text-warm-canvas/90' : 'text-deep-ink'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {link.label}
                    <span
                      aria-hidden
                      className={`absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-sun-orange transition-transform duration-300 ease-out group-hover:scale-x-100 ${
                        isActive ? 'scale-x-100' : ''
                      }`}
                    />
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            to="/search"
            aria-label="Search"
            className={`flex h-11 w-11 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 ${
              dark ? 'text-warm-canvas hover:bg-white/10' : 'text-deep-ink hover:bg-deep-ink/5'
            }`}
          >
            🔍
          </Link>
          <Link
            to="/profile"
            aria-label="Profile"
            className={`hidden h-11 w-11 items-center justify-center rounded-full transition-all duration-200 hover:scale-110 sm:flex ${
              dark ? 'text-warm-canvas hover:bg-white/10' : 'text-deep-ink hover:bg-deep-ink/5'
            }`}
          >
            👤
          </Link>
          <Link
            to="/cart"
            aria-label={`Cart, ${count} items`}
            className={`relative flex h-11 items-center gap-1.5 rounded-full px-5 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
              dark
                ? 'bg-sun-orange text-white hover:bg-chili-red hover:shadow-chili-red/30'
                : 'bg-deep-ink text-warm-canvas hover:bg-chili-red hover:shadow-chili-red/30'
            }`}
          >
            Cart
            {count > 0 && (
              <span
                className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] ${
                  dark ? 'bg-white text-deep-ink' : 'bg-sun-orange text-white'
                }`}
              >
                {count}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </motion.header>
  )
}
