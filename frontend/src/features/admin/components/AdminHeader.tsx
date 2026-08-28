import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useReducedMotion } from '../../../hooks/useReducedMotion'
import { useAuthStore } from '../../../state/authStore'
import { ConfirmDialog } from '../../../components/layout/ConfirmDialog'

function ProfileMenu({ adminName, onLogout }: { adminName: string | null; onLogout: () => void }) {
  const [open, setOpen] = useState(false)
  const [confirmingLogout, setConfirmingLogout] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Admin profile"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-white/5"
      >
        <span
          aria-hidden
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-admin-orange to-chili-red text-sm text-white"
        >
          👤
        </span>
        <span aria-hidden className={`text-xs text-admin-text2 transition-transform ${open ? 'rotate-180' : ''}`}>
          ▾
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-20 w-48 rounded-xl border border-admin-border bg-admin-card p-2 shadow-xl">
          <p className="truncate px-2 py-1.5 text-sm font-semibold text-admin-text">{adminName ?? 'Admin'}</p>
          <p className="truncate px-2 pb-1.5 text-xs text-admin-text2">Operations team</p>
          <div className="my-1 h-px bg-admin-border" />
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              setConfirmingLogout(true)
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-admin-danger transition-colors hover:bg-admin-danger/10"
          >
            <span aria-hidden>🚪</span>
            Log out
          </button>
        </div>
      )}

      {confirmingLogout && (
        <ConfirmDialog
          title="Log out"
          message="You'll need to sign in again to access the admin panel. Continue?"
          onCancel={() => setConfirmingLogout(false)}
          onConfirm={onLogout}
        />
      )}
    </div>
  )
}

export function AdminHeader({
  title,
  subtitle,
  sidebarOpen,
  onToggleSidebar,
  onLogout,
}: {
  title: string
  subtitle?: string
  sidebarOpen: boolean
  onToggleSidebar: () => void
  onLogout: () => void
}) {
  const adminName = useAuthStore((s) => s.user?.name ?? null)
  const reducedMotion = useReducedMotion()

  return (
    <motion.header
      initial={reducedMotion ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: reducedMotion ? 0 : 0.2 }}
      className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-admin-border bg-admin-bg2/90 px-6 py-5 backdrop-blur"
    >
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
          aria-expanded={sidebarOpen}
          className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full text-admin-text2 transition-colors hover:bg-white/5 hover:text-admin-text lg:flex"
        >
          <span aria-hidden>☰</span>
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-admin-text">{title}</h1>
          {subtitle && <p className="mt-0.5 truncate text-sm text-admin-text2">{subtitle}</p>}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <a
          href="/"
          className="hidden text-sm font-semibold text-admin-orange-bright hover:text-admin-amber sm:inline"
        >
          View storefront →
        </a>
        <span className="hidden h-6 w-px bg-admin-border sm:block" />
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-admin-text2 transition-colors hover:bg-white/5 hover:text-admin-text"
        >
          <span aria-hidden>🔔</span>
          <span
            aria-hidden
            className="absolute right-1.5 top-1.5 flex h-2 w-2 items-center justify-center rounded-full bg-admin-orange-bright"
          />
        </button>
        <ProfileMenu adminName={adminName} onLogout={onLogout} />
      </div>
    </motion.header>
  )
}
