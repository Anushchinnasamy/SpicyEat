import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const MotionLink = motion.create(Link)

export function HeroCTA({ to, children }: { to: string; children: ReactNode }) {
  return (
    <MotionLink
      to={to}
      className="group inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-sun-orange px-6 py-3.5 font-sans text-sm font-semibold tracking-wide text-white shadow-md shadow-sun-orange/20 transition-[background-color,box-shadow] duration-200 hover:bg-chili-red hover:shadow-xl hover:shadow-chili-red/30"
      whileHover={{ y: -3, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      {children}
      <span aria-hidden className="inline-block transition-transform duration-200 group-hover:translate-x-1">
        →
      </span>
    </MotionLink>
  )
}
