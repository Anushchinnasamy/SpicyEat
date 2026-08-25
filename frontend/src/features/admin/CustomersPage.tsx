import { useEffect, useState } from 'react'
import { AdminLayout } from './AdminLayout'
import { Modal } from '../../components/layout/Modal'
import { ConfirmDialog } from '../../components/layout/ConfirmDialog'
import { Button } from '../../components/buttons/Button'
import { Input } from '../../components/forms/Input'
import { LoadingState } from '../../components/feedback/States'
import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  type AdminCustomer,
  type CustomerInput,
} from '../../api/admin'

const EMPTY_FORM: CustomerInput = { name: '', email: '' }

export function CustomersPage() {
  const [customers, setCustomers] = useState<AdminCustomer[] | null>(null)
  const [editing, setEditing] = useState<AdminCustomer | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState<CustomerInput>(EMPTY_FORM)
  const [deleting, setDeleting] = useState<AdminCustomer | null>(null)
  const [saving, setSaving] = useState(false)

  function load() {
    fetchCustomers().then((res) => setCustomers(res.data))
  }

  useEffect(load, [])

  function openEdit(c: AdminCustomer) {
    setForm({ name: c.name, email: c.email })
    setEditing(c)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    if (editing) {
      await updateCustomer(editing.id, form)
    } else {
      await createCustomer(form)
    }
    setSaving(false)
    setEditing(null)
    setShowAdd(false)
    load()
  }

  async function handleDelete() {
    if (!deleting) return
    await deleteCustomer(deleting.id)
    setDeleting(null)
    load()
  }

  const formOpen = showAdd || editing !== null

  return (
    <AdminLayout title="Customers">
      <div className="mb-4 flex justify-end">
        <Button
          type="button"
          onClick={() => {
            setForm(EMPTY_FORM)
            setShowAdd(true)
          }}
        >
          + Add Customer
        </Button>
      </div>

      {customers === null ? (
        <LoadingState />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-admin-border bg-admin-card">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-admin-border text-xs font-semibold uppercase tracking-wide text-admin-text2">
                <th className="px-5 py-3">Customer</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Orders</th>
                <th className="px-5 py-3">Total Spend</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {customers.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-white/[0.03]">
                  <td className="px-5 py-3 font-semibold text-admin-text">{c.name}</td>
                  <td className="px-5 py-3 text-admin-text2">{c.email}</td>
                  <td className="px-5 py-3 text-admin-text">{c.orders}</td>
                  <td className="px-5 py-3 font-semibold text-admin-text">₹{c.totalSpend}</td>
                  <td className="px-5 py-3 text-admin-text2">{c.joined}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(c)}
                        className="rounded-full border border-admin-border px-3 py-1 text-xs font-semibold text-admin-text2 transition-colors hover:border-admin-orange hover:text-admin-orange-bright"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(c)}
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

      {formOpen && (
        <Modal
          title={editing ? 'Edit Customer' : 'Add Customer'}
          onClose={() => {
            setShowAdd(false)
            setEditing(null)
          }}
        >
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <Input
              variant="dark"
              label="Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              variant="dark"
              label="Email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <div className="mt-2 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline-dark"
                onClick={() => {
                  setShowAdd(false)
                  setEditing(null)
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Customer'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Remove customer"
          message={`Remove "${deleting.name}" from customers? This can't be undone.`}
          onCancel={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </AdminLayout>
  )
}
