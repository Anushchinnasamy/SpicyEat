interface Props {
  label: string
  value: string
  hint?: string
  accent?: boolean
}

export function StatCard({ label, value, hint, accent }: Props) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        accent
          ? 'border-admin-orange/25 bg-gradient-to-br from-admin-orange to-chili-red text-white'
          : 'border-admin-border bg-admin-card'
      }`}
    >
      <p className={`text-xs font-semibold uppercase tracking-wide ${accent ? 'text-white/80' : 'text-admin-text2'}`}>
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
      {hint && <p className={`mt-1 text-xs ${accent ? 'text-white/70' : 'text-admin-text2'}`}>{hint}</p>}
    </div>
  )
}
