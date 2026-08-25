import { motion } from 'framer-motion'
import { useReducedMotion } from '../../../hooks/useReducedMotion'

interface Props {
  icon: string
  label: string
  value: string
  changeText: string
  changeType?: 'up' | 'down' | 'neutral'
  accent?: boolean
}

const CHANGE_COLOR = {
  up: 'text-admin-success',
  down: 'text-admin-danger',
  neutral: 'text-admin-text2',
}

export function KpiCard({ icon, label, value, changeText, changeType = 'neutral', accent = false }: Props) {
  const reducedMotion = useReducedMotion()

  return (
    <motion.div
      whileHover={reducedMotion ? undefined : { y: -3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className={`group relative overflow-hidden rounded-2xl border p-5 transition-colors duration-200 ${
        accent
          ? 'border-admin-orange/25 bg-admin-card hover:border-admin-orange/50'
          : 'border-admin-border bg-admin-card hover:border-white/15'
      }`}
    >
      {accent && (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-admin-orange/20 blur-3xl transition-opacity duration-300 group-hover:opacity-80"
        />
      )}

      <div className="relative flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-wide text-admin-text2">{label}</p>
        <span
          aria-hidden
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${
            accent ? 'bg-admin-orange/20 text-admin-orange-bright' : 'bg-white/5 text-admin-text2'
          }`}
        >
          {icon}
        </span>
      </div>

      <p className="relative mt-3 text-3xl font-bold text-admin-text">{value}</p>
      <p className={`relative mt-1 text-xs font-medium ${CHANGE_COLOR[changeType]}`}>{changeText}</p>
    </motion.div>
  )
}
