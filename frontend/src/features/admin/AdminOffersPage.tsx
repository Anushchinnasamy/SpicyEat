import { useState } from 'react'
import { AdminLayout } from './AdminLayout'
import { offers as initialOffers } from '../../api/offers'

export function AdminOffersPage() {
  const [active, setActive] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(initialOffers.map((o) => [o.code, true])),
  )

  return (
    <AdminLayout title="Offers">
      <div className="overflow-x-auto rounded-2xl border border-admin-border bg-admin-card">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead>
            <tr className="border-b border-admin-border text-xs font-semibold uppercase tracking-wide text-admin-text2">
              <th className="px-5 py-3">Code</th>
              <th className="px-5 py-3">Title</th>
              <th className="px-5 py-3">Terms</th>
              <th className="px-5 py-3">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border">
            {initialOffers.map((offer) => (
              <tr key={offer.code} className="transition-colors hover:bg-white/[0.03]">
                <td className="px-5 py-3 font-mono text-xs font-bold text-admin-text">{offer.code}</td>
                <td className="px-5 py-3 font-semibold text-admin-text">{offer.title}</td>
                <td className="px-5 py-3 text-admin-text2">{offer.terms}</td>
                <td className="px-5 py-3">
                  <button
                    type="button"
                    onClick={() => setActive((prev) => ({ ...prev, [offer.code]: !prev[offer.code] }))}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                      active[offer.code] ? 'bg-admin-success/15 text-admin-success' : 'bg-white/10 text-admin-text2'
                    }`}
                  >
                    {active[offer.code] ? 'Active' : 'Paused'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
