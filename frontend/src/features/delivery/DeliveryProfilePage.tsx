import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DeliveryLayout } from './DeliveryLayout'
import { ConfirmDialog } from '../../components/layout/ConfirmDialog'
import { useDeliveryAuthStore } from '../../state/deliveryAuthStore'

export function DeliveryProfilePage() {
  const partnerName = useDeliveryAuthStore((s) => s.partnerName)
  const online = useDeliveryAuthStore((s) => s.online)
  const logout = useDeliveryAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const [confirmingLogout, setConfirmingLogout] = useState(false)

  function handleLogout() {
    logout()
    navigate('/delivery/login')
  }

  return (
    <DeliveryLayout title="Profile">
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-4 rounded-2xl border border-admin-border bg-admin-card p-5">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-admin-orange to-chili-red text-2xl text-white">
            👤
          </span>
          <div>
            <p className="font-bold text-admin-text">{partnerName ?? 'Rider'}</p>
            <p className="text-xs text-admin-text2">{online ? 'Online · Ready for orders' : 'Offline'}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-admin-border bg-admin-card p-5">
          <p className="font-bold text-admin-text">Vehicle</p>
          <p className="mt-2 text-sm text-admin-text2">🛵 Bike</p>
        </div>

        <div className="rounded-2xl border border-admin-border bg-admin-card p-5">
          <p className="font-bold text-admin-text">Rating</p>
          <p className="mt-2 text-sm text-admin-text2">⭐ 4.8 average</p>
        </div>

        <button
          type="button"
          onClick={() => setConfirmingLogout(true)}
          className="rounded-full border border-admin-danger/30 px-6 py-3.5 text-sm font-semibold text-admin-danger transition-colors hover:bg-admin-danger/10"
        >
          Log out
        </button>
      </div>

      {confirmingLogout && (
        <ConfirmDialog
          title="Log out"
          message="You'll need to sign in again to keep delivering."
          onCancel={() => setConfirmingLogout(false)}
          onConfirm={handleLogout}
        />
      )}
    </DeliveryLayout>
  )
}
