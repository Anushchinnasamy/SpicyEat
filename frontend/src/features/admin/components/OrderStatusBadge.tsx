import type { RealOrderStatus } from '../../../api/realOrder'

const STATUS_STYLES: Record<RealOrderStatus, string> = {
  PLACED: 'bg-admin-info/15 text-admin-info',
  CONFIRMED: 'bg-admin-success/15 text-admin-success',
  PREPARING: 'bg-admin-orange/15 text-admin-orange-bright',
  READY_FOR_PICKUP: 'bg-admin-amber/15 text-admin-amber',
  ASSIGNED: 'bg-admin-info/15 text-admin-info',
  PICKED_UP: 'bg-admin-info/15 text-admin-info',
  OUT_FOR_DELIVERY: 'bg-admin-info/15 text-admin-info',
  DELIVERED: 'bg-white/10 text-admin-text2',
  CANCELLED: 'bg-admin-danger/15 text-admin-danger',
}

export function OrderStatusBadge({ status }: { status: RealOrderStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${STATUS_STYLES[status]}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}
