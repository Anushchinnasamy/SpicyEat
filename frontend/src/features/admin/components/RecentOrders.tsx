import { Link } from 'react-router-dom'
import { OrderStatusBadge } from './OrderStatusBadge'
import type { RealOrder } from '../../../api/realOrder'

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function RecentOrders({ orders }: { orders: RealOrder[] }) {
  return (
    <div className="rounded-2xl border border-admin-border bg-admin-card p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="font-bold text-admin-text">Recent Orders</p>
        <Link to="/admin/orders" className="text-xs font-semibold text-admin-orange-bright hover:text-admin-amber">
          View all orders →
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="mt-6 text-sm text-admin-text2">No orders yet.</p>
      ) : (
        <div className="mt-4 flex flex-col divide-y divide-admin-border">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex items-center gap-4 py-3.5 transition-colors duration-150 hover:bg-white/[0.03]"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-[11px] font-bold text-admin-text2">
                {order.items.length}×
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-admin-text">{order.id.slice(0, 8)}</p>
                <p className="truncate text-xs text-admin-text2">{order.deliveryAddress.city}</p>
              </div>
              <div className="hidden sm:block">
                <OrderStatusBadge status={order.status} />
              </div>
              <span className="hidden w-16 shrink-0 text-xs text-admin-text2 md:inline">
                {formatTime(order.createdAt)}
              </span>
              <span className="w-16 shrink-0 text-right text-sm font-semibold text-admin-text">₹{order.total}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
