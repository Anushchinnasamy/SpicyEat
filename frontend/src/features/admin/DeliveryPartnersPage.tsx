import { useEffect, useState } from 'react'
import { AdminLayout } from './AdminLayout'
import { Modal } from '../../components/layout/Modal'
import { ConfirmDialog } from '../../components/layout/ConfirmDialog'
import { Button } from '../../components/buttons/Button'
import { Input } from '../../components/forms/Input'
import { LoadingState } from '../../components/feedback/States'
import {
  fetchDeliveryPartners,
  createDeliveryPartner,
  updateDeliveryPartner,
  deleteDeliveryPartner,
  type DeliveryPartner,
  type DeliveryPartnerInput,
} from '../../api/admin'

const STATUS_STYLES: Record<DeliveryPartner['status'], string> = {
  online: 'bg-admin-success/15 text-admin-success',
  'on-delivery': 'bg-admin-orange/15 text-admin-orange-bright',
  offline: 'bg-white/10 text-admin-text2',
}

const EMPTY_FORM: DeliveryPartnerInput = { name: '', vehicle: '', rating: 4.5, status: 'online' }

export function DeliveryPartnersPage() {
  const [partners, setPartners] = useState<DeliveryPartner[] | null>(null)
  const [editing, setEditing] = useState<DeliveryPartner | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState<DeliveryPartnerInput>(EMPTY_FORM)
  const [deleting, setDeleting] = useState<DeliveryPartner | null>(null)
  const [saving, setSaving] = useState(false)

  function load() {
    fetchDeliveryPartners().then((res) => setPartners(res.data))
  }

  useEffect(load, [])

  function openEdit(p: DeliveryPartner) {
    setForm({ name: p.name, vehicle: p.vehicle, rating: p.rating, status: p.status })
    setEditing(p)
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    if (editing) {
      await updateDeliveryPartner(editing.id, form)
    } else {
      await createDeliveryPartner(form)
    }
    setSaving(false)
    setEditing(null)
    setShowAdd(false)
    load()
  }

  async function handleDelete() {
    if (!deleting) return
    await deleteDeliveryPartner(deleting.id)
    setDeleting(null)
    load()
  }

  const formOpen = showAdd || editing !== null

  return (
    <AdminLayout title="Delivery Partners">
      <div className="mb-4 flex justify-end">
        <Button
          type="button"
          onClick={() => {
            setForm(EMPTY_FORM)
            setShowAdd(true)
          }}
        >
          + Add Partner
        </Button>
      </div>

      {partners === null ? (
        <LoadingState />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-admin-border bg-admin-card">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-admin-border text-xs font-semibold uppercase tracking-wide text-admin-text2">
                <th className="px-5 py-3">Partner</th>
                <th className="px-5 py-3">Vehicle</th>
                <th className="px-5 py-3">Rating</th>
                <th className="px-5 py-3">Deliveries</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {partners.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-white/[0.03]">
                  <td className="px-5 py-3 font-semibold text-admin-text">{p.name}</td>
                  <td className="px-5 py-3 text-admin-text2">{p.vehicle}</td>
                  <td className="px-5 py-3 text-admin-text">⭐ {p.rating}</td>
                  <td className="px-5 py-3 text-admin-text">{p.deliveries}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[p.status]}`}>
                      {p.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(p)}
                        className="rounded-full border border-admin-border px-3 py-1 text-xs font-semibold text-admin-text2 transition-colors hover:border-admin-orange hover:text-admin-orange-bright"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(p)}
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
          title={editing ? 'Edit Partner' : 'Add Partner'}
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
              label="Vehicle"
              required
              placeholder="Bike · TN 07 AB 1234"
              value={form.vehicle}
              onChange={(e) => setForm({ ...form, vehicle: e.target.value })}
            />
            <Input
              variant="dark"
              label="Rating"
              type="number"
              step="0.1"
              min={0}
              max={5}
              required
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
            />
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-admin-text2">Status</span>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as DeliveryPartner['status'] })}
                className="rounded-2xl border border-admin-border bg-admin-bg2 px-4 py-3 text-sm text-admin-text"
              >
                <option value="online">Online</option>
                <option value="on-delivery">On Delivery</option>
                <option value="offline">Offline</option>
              </select>
            </label>
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
                {saving ? 'Saving...' : editing ? 'Save Changes' : 'Add Partner'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          title="Remove partner"
          message={`Remove "${deleting.name}" from delivery partners? This can't be undone.`}
          onCancel={() => setDeleting(null)}
          onConfirm={handleDelete}
        />
      )}
    </AdminLayout>
  )
}
