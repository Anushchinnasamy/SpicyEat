import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DeliveryLayout } from './DeliveryLayout'
import { ConfirmDialog } from '../../components/layout/ConfirmDialog'
import { Input } from '../../components/forms/Input'
import { Button } from '../../components/buttons/Button'
import { LoadingState } from '../../components/feedback/States'
import { useAuthStore } from '../../state/authStore'
import { performLogout } from '../../api/auth'
import { toast } from '../../state/toastStore'
import { fetchPartnerProfile, updatePartnerVehicle, type PartnerProfile } from '../../api/deliveryProfile'

export function DeliveryProfilePage() {
  const partnerName = useAuthStore((s) => s.user?.name ?? null)
  const navigate = useNavigate()
  const [confirmingLogout, setConfirmingLogout] = useState(false)
  const [profile, setProfile] = useState<PartnerProfile | null>(null)
  const [editingVehicle, setEditingVehicle] = useState(false)
  const [vehicle, setVehicle] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchPartnerProfile().then((p) => {
      setProfile(p)
      setVehicle(p.vehicle ?? '')
    })
  }, [])

  async function handleLogout() {
    await performLogout()
    navigate('/delivery/login')
  }

  async function handleSaveVehicle(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const updated = await updatePartnerVehicle(vehicle)
      setProfile(updated)
      setEditingVehicle(false)
      toast.success('Vehicle updated')
    } catch {
      toast.error('Could not update vehicle')
    } finally {
      setSaving(false)
    }
  }

  if (!profile) {
    return (
      <DeliveryLayout title="Profile">
        <LoadingState />
      </DeliveryLayout>
    )
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
            <p className="text-xs text-admin-text2">{profile.online ? 'Online · Ready for orders' : 'Offline'}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-admin-border bg-admin-card p-5">
          <p className="font-bold text-admin-text">Vehicle</p>
          {editingVehicle ? (
            <form onSubmit={handleSaveVehicle} className="mt-3 flex flex-col gap-3">
              <Input
                variant="dark"
                placeholder="e.g. Bike · TN 07 AB 1234"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
              />
              <div className="flex gap-3">
                <Button type="submit" disabled={saving} className="flex-1 justify-center">
                  {saving ? 'Saving...' : 'Save'}
                </Button>
                <button
                  type="button"
                  onClick={() => setEditingVehicle(false)}
                  className="text-sm font-semibold text-admin-text2 hover:underline"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="mt-2 flex items-center justify-between">
              <p className="text-sm text-admin-text2">{profile.vehicle || 'Not set'}</p>
              <button
                type="button"
                onClick={() => setEditingVehicle(true)}
                className="text-xs font-semibold text-admin-orange-bright hover:underline"
              >
                Edit
              </button>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-admin-border bg-admin-card p-5">
          <p className="font-bold text-admin-text">Rating</p>
          <p className="mt-2 text-sm text-admin-text2">
            {profile.rating != null ? `⭐ ${profile.rating} average` : 'No ratings yet'}
          </p>
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
