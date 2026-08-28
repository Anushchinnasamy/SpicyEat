import { useEffect, useState } from 'react'
import { AdminLayout } from './AdminLayout'
import { LoadingState, EmptyState } from '../../components/feedback/States'
import { toast } from '../../state/toastStore'
import { listUsers, type AdminUserSummary } from '../../api/adminUsers'

export function CustomersPage() {
  const [users, setUsers] = useState<AdminUserSummary[] | null>(null)

  useEffect(() => {
    listUsers()
      .then(setUsers)
      .catch(() => {
        setUsers([])
        toast.error('Could not load users')
      })
  }, [])

  return (
    <AdminLayout title="Customers">
      {users === null && <LoadingState />}
      {users && users.length === 0 && <EmptyState title="No accounts yet." subtitle="Registered users will show up here." />}
      {users && users.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-admin-border bg-admin-card">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-admin-border text-xs font-semibold uppercase tracking-wide text-admin-text2">
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border">
              {users.map((u) => (
                <tr key={u.id} className="transition-colors hover:bg-white/[0.03]">
                  <td className="px-5 py-4 font-semibold text-admin-text">{u.email}</td>
                  <td className="px-5 py-4 text-admin-text2">{u.role}</td>
                  <td className="px-5 py-4 text-admin-text2">{u.status}</td>
                  <td className="px-5 py-4 text-admin-text2">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}
