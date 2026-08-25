import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useDeliveryAuthStore } from '../../state/deliveryAuthStore'
import { ConfirmDialog } from '../../components/layout/ConfirmDialog'

const TABS = [
  { to: '/delivery', label: 'Dashboard', icon: '📊', end: true },
  { to: '/delivery/available', label: 'Available', icon: '📋', end: false },
  { to: '/delivery/history', label: 'History', icon: '🕒', end: false },
  { to: '/delivery/earnings', label: 'Earnings', icon: '💰', end: false },
  { to: '/delivery/profile', label: 'Profile', icon: '👤', end: false },
]

export function DeliveryLayout({ title, children }: { title: string; children: ReactNode }) {
  const partnerName = useDeliveryAuthStore((s) => s.partnerName)
  const online = useDeliveryAuthStore((s) => s.online)
  const setOnline = useDeliveryAuthStore((s) => s.setOnline)
  const logout = useDeliveryAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const [confirmingLogout, setConfirmingLogout] = useState(false)

  function handleLogout() {
    logout()
    navigate('/delivery/login')
  }

  return (
    <div className="flex min-h-screen flex-col bg-admin-bg text-admin-text">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-admin-border bg-admin-bg2/90 px-5 py-4 backdrop-blur">
        <div className="flex items-center gap-1.5 font-display text-lg uppercase tracking-tight">
          <span aria-hidden>🌶️</span>
          Spicy<span className="text-admin-orange-bright">Eat</span>
          <span className="ml-1 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-admin-text2">
            Rider
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOnline(!online)}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wide transition-colors ${
              online
                ? 'border-admin-success/30 bg-admin-success/15 text-admin-success'
                : 'border-admin-border bg-white/5 text-admin-text2'
            }`}
          >
            <span
              aria-hidden
              className={`h-1.5 w-1.5 rounded-full ${online ? 'bg-admin-success' : 'bg-admin-text2'}`}
            />
            {online ? 'Online' : 'Offline'}
          </button>
          <button
            type="button"
            onClick={() => setConfirmingLogout(true)}
            aria-label="Rider profile menu"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-admin-orange to-chili-red text-sm text-white"
          >
            👤
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pb-24 pt-6">
        <h1 className="text-xl font-bold text-admin-text">{title}</h1>
        <div className="mt-5">{children}</div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-admin-border bg-admin-bg2/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-stretch justify-between px-2">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors ${
                  isActive ? 'text-admin-orange-bright' : 'text-admin-text2 hover:text-admin-text'
                }`
              }
            >
              <span aria-hidden className="text-lg">
                {tab.icon}
              </span>
              {tab.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {confirmingLogout && (
        <ConfirmDialog
          title="Log out"
          message={`See you later, ${partnerName ?? 'rider'}. You'll need to sign in again to keep delivering.`}
          onCancel={() => setConfirmingLogout(false)}
          onConfirm={handleLogout}
        />
      )}
    </div>
  )
}
