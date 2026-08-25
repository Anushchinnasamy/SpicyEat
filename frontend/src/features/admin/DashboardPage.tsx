import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { AdminLayout } from './AdminLayout'
import { KpiCard } from './components/KpiCard'
import { RecentOrders } from './components/RecentOrders'
import { PopularItems } from './components/PopularItems'
import { RevenueOverview } from './components/RevenueOverview'
import { OrdersOverview } from './components/OrdersOverview'
import { DeliveryStatus } from './components/DeliveryStatus'
import { LoadingState } from '../../components/feedback/States'
import { fetchDashboardMetrics, type DashboardMetrics } from '../../api/admin'
import { fetchOrders } from '../../api/orders'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import type { Order } from '../../types'

function compareText(today: number, yesterday: number, unit: (n: number) => string) {
  if (yesterday === 0) {
    return today === 0 ? 'No orders yesterday' : `${unit(today)} — none yesterday`
  }
  const pct = Math.round(((today - yesterday) / yesterday) * 100)
  if (pct === 0) return 'Same as yesterday'
  return `${pct > 0 ? '↑' : '↓'} ${Math.abs(pct)}% vs yesterday`
}

export function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [orders, setOrders] = useState<Order[] | null>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    fetchDashboardMetrics().then((res) => setMetrics(res.data))
    fetchOrders().then((res) => setOrders(res.data))
  }, [])

  const yesterday = new Date(Date.now() - 86400000).toDateString()
  const ordersYesterday = orders?.filter((o) => new Date(o.placedAt).toDateString() === yesterday).length ?? 0
  const revenueYesterday =
    orders
      ?.filter((o) => new Date(o.placedAt).toDateString() === yesterday)
      .reduce((s, o) => s + o.total, 0) ?? 0

  const kpiContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
  }
  const kpiItem = {
    hidden: reducedMotion ? {} : { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  }

  return (
    <AdminLayout title="Dashboard 👋" subtitle="Here's what's happening with your restaurant today.">
      {!metrics || !orders ? (
        <LoadingState />
      ) : (
        <>
          <motion.div
            variants={kpiContainer}
            initial={reducedMotion ? false : 'hidden'}
            animate="visible"
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
          >
            <motion.div variants={kpiItem}>
              <KpiCard
                icon="🧾"
                label="Orders Today"
                value={String(metrics.ordersToday)}
                changeText={compareText(metrics.ordersToday, ordersYesterday, (n) => `${n} orders`)}
                changeType={metrics.ordersToday >= ordersYesterday ? 'up' : 'down'}
                accent
              />
            </motion.div>
            <motion.div variants={kpiItem}>
              <KpiCard
                icon="💰"
                label="Revenue Today"
                value={`₹${metrics.revenueToday.toLocaleString()}`}
                changeText={compareText(metrics.revenueToday, revenueYesterday, (n) => `₹${n}`)}
                changeType={metrics.revenueToday >= revenueYesterday ? 'up' : 'down'}
                accent
              />
            </motion.div>
            <motion.div variants={kpiItem}>
              <KpiCard
                icon="⏱️"
                label="Active Orders"
                value={String(metrics.activeOrders)}
                changeText={`${metrics.prepQueue} preparing · ${metrics.activeDeliveries} on the way`}
              />
            </motion.div>
            <motion.div variants={kpiItem}>
              <KpiCard
                icon="👨‍🍳"
                label="Prep Queue"
                value={String(metrics.prepQueue)}
                changeText="Avg. prep time ~18m"
              />
            </motion.div>
            <motion.div variants={kpiItem}>
              <KpiCard
                icon="🛵"
                label="Active Deliveries"
                value={String(metrics.activeDeliveries)}
                changeText="Live orders on the way"
              />
            </motion.div>
            <motion.div variants={kpiItem}>
              <KpiCard
                icon="👥"
                label="Customers"
                value={metrics.customers.toLocaleString()}
                changeText="Registered customers"
              />
            </motion.div>
          </motion.div>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: reducedMotion ? 0 : 0.35 }}
            className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]"
          >
            <RecentOrders orders={orders.slice(0, 6)} />
            <PopularItems items={metrics.popularItems} />
          </motion.div>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: reducedMotion ? 0 : 0.5 }}
            className="mt-5 grid gap-5 lg:grid-cols-3"
          >
            <RevenueOverview orders={orders} />
            <OrdersOverview orders={orders} />
            <DeliveryStatus orders={orders} />
          </motion.div>
        </>
      )}
    </AdminLayout>
  )
}
