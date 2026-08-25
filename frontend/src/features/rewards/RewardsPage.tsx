import { useEffect, useState } from 'react'
import { PageShell } from '../../components/layout/PageShell'
import { EditorialHeading, Eyebrow } from '../../components/typography/EditorialHeading'
import { LoadingState } from '../../components/feedback/States'
import { fetchRewardsSummary, type RewardsSummary } from '../../api/rewards'

export function RewardsPage() {
  const [rewards, setRewards] = useState<RewardsSummary | null>(null)

  useEffect(() => {
    fetchRewardsSummary().then((res) => setRewards(res.data))
  }, [])

  if (!rewards) {
    return (
      <PageShell>
        <LoadingState />
      </PageShell>
    )
  }

  const progress = Math.min((rewards.balance / rewards.nextMilestone) * 100, 100)

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-5 pb-6 pt-12 lg:px-10">
        <Eyebrow>Spicy Coins</Eyebrow>
        <EditorialHeading lines={['More heat.', 'More coins.']} accentLine={1} size="lg" className="mt-2" />
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-10 lg:px-10">
        <div className="rounded-3xl bg-deep-ink p-8 text-warm-canvas">
          <p className="text-xs font-bold uppercase tracking-wide text-warm-canvas/60">Your balance</p>
          <p className="mt-2 font-display text-6xl text-sun-orange">{rewards.balance}</p>
          <p className="text-xs uppercase tracking-wide text-warm-canvas/60">Spicy Coins</p>

          <div className="mt-6">
            <div className="h-2 rounded-full bg-warm-canvas/15">
              <div className="h-2 rounded-full bg-sun-orange transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-xs text-warm-canvas/60">
              {rewards.nextMilestone - rewards.balance} coins to your next milestone reward
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-10 lg:px-10">
        <p className="font-display text-xl uppercase">Redeem</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {rewards.redeemable.map((r) => {
            const canRedeem = rewards.balance >= r.cost
            return (
              <div key={r.title} className="flex flex-col justify-between gap-4 rounded-2xl bg-white p-5 ring-1 ring-deep-ink/5">
                <div>
                  <p className="font-display text-lg uppercase">{r.title}</p>
                  <p className="mt-1 text-xs text-muted-ink">{r.desc}</p>
                </div>
                <button
                  type="button"
                  disabled={!canRedeem}
                  className="rounded-full bg-deep-ink px-4 py-2.5 text-xs font-bold text-warm-canvas transition-colors hover:bg-sun-orange disabled:cursor-not-allowed disabled:opacity-30"
                >
                  {r.cost} coins
                </button>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-20 lg:px-10">
        <p className="font-display text-xl uppercase">Earning history</p>
        <div className="mt-4 flex flex-col divide-y divide-deep-ink/10 rounded-2xl bg-white ring-1 ring-deep-ink/5">
          {rewards.history.map((h) => (
            <div key={`${h.label}-${h.date}`} className="flex items-center justify-between gap-4 px-5 py-4 text-sm">
              <div>
                <p className="font-semibold">{h.label}</p>
                <p className="text-xs text-muted-ink">{h.date}</p>
              </div>
              <span className="font-display text-herb-green">+{h.coins}</span>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  )
}
