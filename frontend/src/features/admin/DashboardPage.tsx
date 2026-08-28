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
import { fetchAllOrdersAdmin, type RealOrder } from '../../api/realOrder'
import { listUsers } from '../../api/adminUsers'
import { fetchMenu } from '../../api/menu'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import type { Food } from '../../types'

function compareText(today: number, yesterday: number, unit: (n: number) => string) {
  if (yesterday === 0) {
    return today === 0 ? 'No orders yesterday' : `${unit(today)} — none yesterday`
  }
  const pct = Math.round(((today - yesterday) / yesterday) * 100)
  if (pct === 0) return 'Same as yesterday'
  return `${pct > 0 ? '↑' : '↓'} ${Math.abs(pct)}% vs yesterday`
}

export function DashboardPage() {
  const [orders, setOrders] = useState<RealOrder[] | null>(null)
  const [customerCount, setCustomerCount] = useState<number | null>(null)
  const [menu, setMenu] = useState<Food[]>([])
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    fetchAllOrdersAdmin().then(setOrders).catch(() => setOrders([]))
    listUsers()
      .then((users) => setCustomerCount(users.filter((u) => u.role === 'CUSTOMER').length))
      .catch(() => setCustomerCount(0))
    fetchMenu().then((res) => setMenu(res.data)).catch(() => setMenu([]))
  }, [])

  const today = new Date().toDateString()
  const yesterday = new Date(Date.now() - 86400000).toDateString()

  const ordersToday = orders?.filter((o) => new Date(o.createdAt).toDateString() === today) ?? []
  const ordersYesterdayList = orders?.filter((o) => new Date(o.createdAt).toDateString() === yesterday) ?? []
  const revenueToday = ordersToday.reduce((s, o) => s + o.total, 0)
  const revenueYesterday = ordersYesterdayList.reduce((s, o) => s + o.total, 0)

  const activeOrders = orders?.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED') ?? []
  const prepQueue = orders?.filter((o) => o.status === 'CONFIRMED' || o.status === 'PREPARING').length ?? 0
  const activeDeliveries =
    orders?.filter((o) => o.status === 'ASSIGNED' || o.status === 'PICKED_UP' || o.status === 'OUT_FOR_DELIVERY').length ?? 0

  const menuById = new Map(menu.map((f) => [f.id, f]))
  const itemCounts = new Map<string, { name: string; image: string; orders: number; price: number }>()
  for (const order of orders ?? []) {
    for (const item of order.items) {
      const existing = itemCounts.get(item.menuItemId)
      const image = menuById.get(item.menuItemId)?.images[0] ?? ''
      if (existing) {
        existing.orders += item.quantity
      } else {
        itemCounts.set(item.menuItemId, { name: item.itemName, image, orders: item.quantity, price: item.unitPrice })
      }
    }
  }
  const popularItems = [...itemCounts.values()].sort((a, b) => b.orders - a.orders).slice(0, 5)

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
      {!orders || customerCount === null ? (
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
                value={String(ordersToday.length)}
                changeText={compareText(ordersToday.length, ordersYesterdayList.length, (n) => `${n} orders`)}
                changeType={ordersToday.length >= ordersYesterdayList.length ? 'up' : 'down'}
                accent
              />
            </motion.div>
            <motion.div variants={kpiItem}>
              <KpiCard
                icon="💰"
                label="Revenue Today"
                value={`₹${revenueToday.toLocaleString()}`}
                changeText={compareText(revenueToday, revenueYesterday, (n) => `₹${n}`)}
                changeType={revenueToday >= revenueYesterday ? 'up' : 'down'}
                accent
              />
            </motion.div>
            <motion.div variants={kpiItem}>
              <KpiCard
                icon="⏱️"
                label="Active Orders"
                value={String(activeOrders.length)}
                changeText={`${prepQueue} preparing · ${activeDeliveries} on the way`}
              />
            </motion.div>
            <motion.div variants={kpiItem}>
              <KpiCard icon="👨‍🍳" label="Prep Queue" value={String(prepQueue)} changeText="Confirmed + preparing" />
            </motion.div>
            <motion.div variants={kpiItem}>
              <KpiCard
                icon="🛵"
                label="Active Deliveries"
                value={String(activeDeliveries)}
                changeText="Live orders on the way"
              />
            </motion.div>
            <motion.div variants={kpiItem}>
              <KpiCard
                icon="👥"
                label="Customers"
                value={customerCount.toLocaleString()}
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
            <PopularItems items={popularItems} />
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
