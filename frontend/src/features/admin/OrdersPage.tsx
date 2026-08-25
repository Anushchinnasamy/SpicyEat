import { useEffect, useState } from 'react'
import { AdminLayout } from './AdminLayout'
import { Modal } from '../../components/layout/Modal'
import { ConfirmDialog } from '../../components/layout/ConfirmDialog'
import { Button } from '../../components/buttons/Button'
import { Input } from '../../components/forms/Input'
import { LoadingState, EmptyState } from '../../components/feedback/States'
import { fetchOrders, updateOrderStatus, updateOrder, deleteOrder, type OrderEditInput } from '../../api/orders'
import type { DeliveryOption, Order, OrderAddress, OrderStatus, PaymentMethod } from '../../types'

const STATUSES: OrderStatus[] = [
  'PLACED',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'ASSIGNED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
]

const EMPTY_ADDRESS: OrderAddress = { name: '', phone: '', line1: '', city: '', pincode: '' }

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [editing, setEditing] = useState<Order | null>(null)
  const [address, setAddress] = useState<OrderAddress>(EMPTY_ADDRESS)
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption>('standard')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
  const [deleting, setDeleting] = useState<Order | null>(null)
  const [saving, setSaving] = useState(false)

  function load() {
    fetchOrders().then((res) => setOrders(res.data))
  }

  useEffect(load, [])

  async function handleStatusChange(id: string, status: OrderStatus) {
    setOrders((prev) => prev && prev.map((o) => (o.id === id ? { ...o, status } : o)))
    await updateOrderStatus(id, status)
  }

  function openEdit(order: Order) {
    setAddress(order.address)
    setDeliveryOption(order.deliveryOption)
    setPaymentMethod(order.paymentMethod)
    setEditing(order)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    setSaving(true)
    const input: OrderEditInput = { address, deliveryOption, paymentMethod }
    await updateOrder(editing.id, input)
    setSaving(false)
    setEditing(null)
    load()
  }

  async function handleDelete() {
    if (!deleting) return
    await deleteOrder(deleting.id)
    setDeleting(null)
    load()
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
                  <td className="px-5 py-4 font-semibold text-admin-text">{order.id}</td>
                  <td className="px-5 py-4 text-admin-text">{order.address.name}</td>
                  <td className="px-5 py-4 text-admin-text2">{order.items.length} items</td>
                  <td className="px-5 py-4 font-semibold text-admin-text">₹{order.total}</td>
                  <td className="px-5 py-4 text-admin-text2">{new Date(order.placedAt).toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
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
                        onClick={() => openEdit(order)}
                        className="rounded-full border border-admin-border px-3 py-1 text-xs font-semibold text-admin-text2 transition-colors hover:border-admin-orange hover:text-admin-orange-bright"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(order)}
                        className="rounded-full border border-admin-border px-3 py-1 text-xs font-semibold text-admin-danger transition-colors hover:border-admin-danger"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal title={`Edit ${editing.id}`} onClose={() => setEditing(null)}>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <Input
              variant="dark"
              label="Customer name"
              required
              value={address.name}
              onChange={(e) => setAddress({ ...address, name: e.target.value })}
            />
            <Input
              variant="dark"
              label="Phone"
              required
              value={address.phone}
              onChange={(e) => setAddress({ ...address, phone: e.target.value })}
            />
            <Input
              variant="dark"
              label="Address"
              required
              value={address.line1}
              onChange={(e) => setAddress({ ...address, line1: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
              variant="dark"
                label="City"
                required
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
              />
              <Input
              variant="dark"
                label="Pincode"
                required
                value={address.pincode}
                onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-admin-text2">Delivery</span>
                <select
                  value={deliveryOption}
                  onChange={(e) => setDeliveryOption(e.target.value as DeliveryOption)}
                  className="rounded-2xl border border-admin-border bg-admin-bg2 px-4 py-3 text-sm text-admin-text"
                >
                  <option value="standard">Standard</option>
                  <option value="express">Express</option>
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-admin-text2">Payment</span>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="rounded-2xl border border-admin-border bg-admin-bg2 px-4 py-3 text-sm text-admin-text"
                >
                  <option value="card">Card</option>
                  <option value="upi">UPI</option>
                  <option value="cod">Cash on delivery</option>
                </select>
              </label>
            </div>
            <div className="mt-2 flex justify-end gap-3">
              <Button type="button" variant="outline-dark" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete order"
          message={`Permanently delete order ${deleting.id}? This can't be undone.`}
          onCancel={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </AdminLayout>
  )
}
