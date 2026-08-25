import { motion, type Variants } from 'framer-motion'
import { useReducedMotion } from '../../hooks/useReducedMotion'

interface Props {
  lines: string[]
  /** Index of the line that gets the stronger orange emphasis reveal. */
  accentLine?: number
}

const container: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.14, delayChildren: 0.15 },
  },
}

const line: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
}

const accentLineVariant: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: [0.96, 1.04, 1],
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
}

/** Hero-only headline: reveals line by line on mount, one line upward with a subtle emphasis pulse. */
export function AnimatedHeadline({ lines, accentLine }: Props) {
  const reducedMotion = useReducedMotion()

  return (
    <motion.h1
      className="font-display text-6xl uppercase leading-[0.92] tracking-tight sm:text-7xl lg:text-8xl"
      variants={container}
      initial={reducedMotion ? false : 'hidden'}
      animate="visible"
    >
      {lines.map((text, i) => (
        <motion.span
          key={text}
          variants={i === accentLine ? accentLineVariant : line}
          className={`block ${i === accentLine ? 'text-sun-orange' : ''}`}
        >
          {text}
        </motion.span>
      ))}
    </motion.h1>
  )
}
