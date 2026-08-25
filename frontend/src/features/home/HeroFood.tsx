import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FloatingSpiceParticles } from '../../components/animations/FloatingSpiceParticles'
import { useReducedMotion } from '../../hooks/useReducedMotion'

/**
 * Full-bleed hero backdrop. Two independent transform layers so scroll
 * parallax and the idle breathing zoom never fight over the same
 * element's `transform`.
 */
export function HeroFood() {
  const reducedMotion = useReducedMotion()
  const scrollRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({ target: scrollRef, offset: ['start start', 'end start'] })
  const scrollY = useTransform(scrollYProgress, [0, 1], [0, reducedMotion ? 0 : -80])

  return (
    <div ref={scrollRef} className="absolute inset-0">
      <FloatingSpiceParticles />

      <motion.div
        className="absolute inset-0"
        style={{ y: scrollY }}
        initial={reducedMotion ? false : { opacity: 0, scale: 1.08 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="h-full w-full"
          animate={reducedMotion ? undefined : { scale: [1, 1.035, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        >
          <img
            src="/images/home/home-hero.png"
            alt="SpicyEat signature burger with bacon, melted cheese and fire sauce, surrounded by chilli and flame"
            className="h-full w-full object-cover object-right"
            loading="eager"
          />
        </motion.div>
      </motion.div>
    </div>
  )
}
