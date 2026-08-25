import { motion } from 'framer-motion'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import type { Order } from '../../../types'

export function DeliveryStatus({ orders }: { orders: Order[] }) {
  const reducedMotion = useReducedMotion()

  const onTheWay = orders.filter((o) => o.status === 'ASSIGNED' || o.status === 'OUT_FOR_DELIVERY').length
  const pending = orders.filter((o) =>
    ['PLACED', 'CONFIRMED', 'PREPARING', 'READY'].includes(o.status),
  ).length
  const active = orders.filter((o) => o.status !== 'DELIVERED')
  const avgEta = active.length ? Math.round(active.reduce((s, o) => s + o.etaMinutes, 0) / active.length) : null

  return (
    <div className="rounded-2xl border border-admin-border bg-admin-card p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="font-bold text-admin-text">Delivery Status</p>
        <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-admin-success">
          <span className="relative flex h-1.5 w-1.5">
            {!reducedMotion && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-admin-success opacity-75" />
            )}
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-admin-success" />
          </span>
          Live
        </span>
      </div>

      <div className="relative mt-4 h-36 overflow-hidden rounded-xl border border-white/5 bg-[#0e0e0e]">
        <div
          aria-hidden
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'repeating-linear-gradient(115deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 26px), repeating-linear-gradient(25deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 34px)',
          }}
        />

        <svg viewBox="0 0 300 140" className="absolute inset-0 h-full w-full">
          <path
            d="M 24 108 C 90 108, 110 40, 180 40 S 260 90, 280 30"
            fill="none"
            stroke="#FF6B2C"
            strokeWidth="2"
            strokeDasharray="6 6"
            opacity="0.8"
          />
        </svg>

        <span aria-hidden className="absolute bottom-[18%] left-[6%] text-base">
          🏠
        </span>
        <span aria-hidden className="absolute right-[5%] top-[16%] text-base">
          📍
        </span>
        <motion.span
          aria-hidden
          className="absolute text-lg"
          style={{ left: '58%', top: '26%' }}
          animate={reducedMotion ? undefined : { y: [0, -3, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          🛵
        </motion.span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-xl font-bold text-admin-text">{onTheWay}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-admin-text2">On the way</p>
        </div>
        <div>
          <p className="text-xl font-bold text-admin-text">{pending}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-admin-text2">Pending</p>
        </div>
        <div>
          <p className="text-xl font-bold text-admin-text">{avgEta ? `${avgEta}m` : '—'}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-admin-text2">Avg. Delivery Time</p>
        </div>
      </div>
    </div>
  )
}
