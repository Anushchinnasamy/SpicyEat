import { useEffect, useState } from 'react'
import { AdminLayout } from './AdminLayout'
import { StatCard } from '../../components/admin/StatCard'
import { LoadingState } from '../../components/feedback/States'
import { fetchRewardsSummary, type RewardsSummary } from '../../api/rewards'

export function AdminRewardsPage() {
  const [summary, setSummary] = useState<RewardsSummary | null>(null)

  useEffect(() => {
    fetchRewardsSummary().then((res) => setSummary(res.data))
  }, [])

  if (!summary) {
    return (
      <AdminLayout title="Rewards">
        <LoadingState />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Rewards">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Coins per ₹ spent" value="1" hint="Earn rate" accent />
        <StatCard label="Welcome bonus" value="100" hint="New account coins" />
        <StatCard label="Active redemptions" value={String(summary.redeemable.length)} />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-admin-border bg-admin-card">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-admin-border text-xs font-semibold uppercase tracking-wide text-admin-text2">
              <th className="px-5 py-3">Reward</th>
              <th className="px-5 py-3">Description</th>
              <th className="px-5 py-3">Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-admin-border">
            {summary.redeemable.map((r) => (
              <tr key={r.title} className="transition-colors hover:bg-white/[0.03]">
                <td className="px-5 py-3 font-semibold text-admin-text">{r.title}</td>
                <td className="px-5 py-3 text-admin-text2">{r.desc}</td>
                <td className="px-5 py-3 font-semibold text-admin-text">{r.cost} coins</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
