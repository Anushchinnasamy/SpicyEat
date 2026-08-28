import { useEffect, useState } from 'react'
import { AdminLayout } from './AdminLayout'
import { Modal } from '../../components/layout/Modal'
import { Button } from '../../components/buttons/Button'
import { Input } from '../../components/forms/Input'
import { LoadingState, EmptyState } from '../../components/feedback/States'
import { toast } from '../../state/toastStore'
import { fetchAllOrdersAdmin, updateOrderStatusAdmin, cancelOrder, type RealOrder, type RealOrderStatus } from '../../api/realOrder'
import { fetchPaymentByOrder, refundPayment, type PaymentResponse } from '../../api/adminPayments'

const STATUSES: RealOrderStatus[] = [
  'PLACED',
  'CONFIRMED',
  'PREPARING',
  'READY_FOR_PICKUP',
  'ASSIGNED',
  'PICKED_UP',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
]

export function OrdersPage() {
  const [orders, setOrders] = useState<RealOrder[] | null>(null)
  const [cancelling, setCancelling] = useState<RealOrder | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [busy, setBusy] = useState(false)

  const [refunding, setRefunding] = useState<RealOrder | null>(null)
  const [payment, setPayment] = useState<PaymentResponse | null | undefined>(undefined)
  const [refundAmount, setRefundAmount] = useState(0)
  const [refundReason, setRefundReason] = useState('')

  function load() {
    fetchAllOrdersAdmin()
      .then(setOrders)
      .catch(() => {
        setOrders([])
        toast.error('Could not load orders')
      })
  }

  useEffect(load, [])

  async function handleStatusChange(id: string, status: RealOrderStatus) {
    const previous = orders
    setOrders((prev) => prev && prev.map((o) => (o.id === id ? { ...o, status } : o)))
    try {
      await updateOrderStatusAdmin(id, status)
      toast.success('Order status updated')
    } catch {
      setOrders(previous)
      toast.error('Could not update order status')
    }
  }

  async function handleCancel() {
    if (!cancelling) return
    setBusy(true)
    try {
      await cancelOrder(cancelling.id, cancelReason || undefined)
      toast.success('Order cancelled')
      setCancelling(null)
      setCancelReason('')
      load()
    } catch {
      toast.error('Could not cancel that order')
    } finally {
      setBusy(false)
    }
  }

  async function openRefund(order: RealOrder) {
    setRefunding(order)
    setPayment(undefined)
    try {
      const p = await fetchPaymentByOrder(order.id)
      setPayment(p)
      setRefundAmount(p.amount - p.refundedAmount)
    } catch {
      setPayment(null)
    }
  }

  async function handleRefund(e: React.FormEvent) {
    e.preventDefault()
    if (!payment || !refunding) return
    setBusy(true)
    try {
      await refundPayment(payment.id, refundAmount, refundReason || undefined)
      const isFullRefund = refundAmount >= payment.amount - payment.refundedAmount
      if (isFullRefund && refunding.status !== 'CANCELLED') {
        await cancelOrder(refunding.id, refundReason || 'Refunded')
      }
      toast.success('Refund issued')
      setRefunding(null)
      setRefundReason('')
      load()
    } catch {
      toast.error('Could not issue that refund')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AdminLayout title="Orders">
      {orders === null && <LoadingState />}
      {orders && orders.length === 0 && <EmptyState title="No orders yet." subtitle="They'll show up here once customers start ordering." />}
      {orders && orders.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-admin-border bg-admin-card">
          <table className="w-full min-w-[840px] text-left text-sm">
            <thead>
              <tr className="border-b border-admin-border text-xs font-semibold uppercase tracking-wide text-admin-text2">
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Items</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Placed</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {orders.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-white/[0.03]">
                  <td className="px-5 py-4 font-semibold text-admin-text">{order.id.slice(0, 8)}</td>
                  <td className="px-5 py-4 text-admin-text2">{order.userId.slice(0, 8)}</td>
                  <td className="px-5 py-4 text-admin-text2">{order.items.length} items</td>
                  <td className="px-5 py-4 font-semibold text-admin-text">₹{order.total}</td>
                  <td className="px-5 py-4 text-admin-text2">{new Date(order.createdAt).toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as RealOrderStatus)}
                      className="rounded-full border border-admin-border bg-admin-bg2 px-3 py-1.5 text-xs font-semibold text-admin-text"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s.replace(/_/g, ' ')}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={order.status === 'CANCELLED'}
                        onClick={() => openRefund(order)}
                        className="rounded-full border border-admin-border px-3 py-1 text-xs font-semibold text-admin-text2 transition-colors hover:border-admin-orange hover:text-admin-orange-bright disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        Refund
                      </button>
                      <button
                        type="button"
                        disabled={order.status === 'CANCELLED'}
                        onClick={() => setCancelling(order)}
                        className="rounded-full border border-admin-border px-3 py-1 text-xs font-semibold text-admin-danger transition-colors hover:border-admin-danger disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {cancelling && (
        <Modal title={`Cancel order ${cancelling.id.slice(0, 8)}`} onClose={() => setCancelling(null)}>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-admin-text2">This calls the real order-service cancel endpoint. Optionally give a reason.</p>
            <Input
              variant="dark"
              label="Reason (optional)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline-dark" onClick={() => setCancelling(null)}>
                Back
              </Button>
              <Button
                type="button"
                onClick={handleCancel}
                disabled={busy}
                className="!bg-admin-danger hover:!bg-admin-danger/90"
              >
                {busy ? 'Cancelling...' : 'Cancel order'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {refunding && (
        <Modal title={`Refund order ${refunding.id.slice(0, 8)}`} onClose={() => setRefunding(null)}>
          {payment === undefined && <LoadingState title="Looking up payment..." />}
          {payment === null && <p className="text-sm text-admin-danger">No payment found for this order.</p>}
          {payment && (
            <form onSubmit={handleRefund} className="flex flex-col gap-4">
              <p className="text-sm text-admin-text2">
                Paid ₹{payment.amount} · already refunded ₹{payment.refundedAmount}
              </p>
              <Input
                variant="dark"
                type="number"
                label="Refund amount (₹)"
                required
                min={0.01}
                max={payment.amount - payment.refundedAmount}
                step="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(Number(e.target.value))}
              />
              <Input
                variant="dark"
                label="Reason (optional)"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
              />
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline-dark" onClick={() => setRefunding(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={busy}>
                  {busy ? 'Processing...' : 'Issue refund'}
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </AdminLayout>
  )
}
