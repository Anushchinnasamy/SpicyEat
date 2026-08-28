import { useEffect, useState } from 'react'
import { AdminLayout } from './AdminLayout'
import { LoadingState, EmptyState } from '../../components/feedback/States'
import { toast } from '../../state/toastStore'
import { listPartners, type AdminPartner } from '../../api/adminPartners'
import { listUsers, type AdminUserSummary } from '../../api/adminUsers'

export function DeliveryPartnersPage() {
  const [partners, setPartners] = useState<AdminPartner[] | null>(null)
  const [users, setUsers] = useState<AdminUserSummary[]>([])

  useEffect(() => {
    listPartners()
      .then(setPartners)
      .catch(() => {
        setPartners([])
        toast.error('Could not load delivery partners')
      })
    listUsers().then(setUsers).catch(() => {})
  }, [])

  const emailByUserId = new Map(users.map((u) => [u.id, u.email]))

  return (
    <AdminLayout title="Delivery Partners">
      {partners === null && <LoadingState />}
      {partners && partners.length === 0 && (
        <EmptyState
          title="No delivery partners yet."
          subtitle="Riders show up here once they've signed in at least once."
        />
      )}
      {partners && partners.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-admin-border bg-admin-card">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-admin-border text-xs font-semibold uppercase tracking-wide text-admin-text2">
                <th className="px-5 py-3">Partner</th>
                <th className="px-5 py-3">Vehicle</th>
                <th className="px-5 py-3">Rating</th>
                <th className="px-5 py-3">Deliveries</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {partners.map((p) => (
                <tr key={p.userId} className="transition-colors hover:bg-white/[0.03]">
                  <td className="px-5 py-3 font-semibold text-admin-text">
                    {emailByUserId.get(p.userId) ?? p.userId.slice(0, 8)}
                  </td>
                  <td className="px-5 py-3 text-admin-text2">{p.vehicle || 'Not set'}</td>
                  <td className="px-5 py-3 text-admin-text">{p.rating != null ? `⭐ ${p.rating}` : 'No ratings yet'}</td>
                  <td className="px-5 py-3 text-admin-text">{p.completedDeliveries}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        p.online ? 'bg-admin-success/15 text-admin-success' : 'bg-white/10 text-admin-text2'
                      }`}
                    >
                      {p.online ? 'Online' : 'Offline'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}
