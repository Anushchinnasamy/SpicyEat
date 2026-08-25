import { useState } from 'react'
import { AdminLayout } from './AdminLayout'
import { Input } from '../../components/forms/Input'
import { Button } from '../../components/buttons/Button'

export function SettingsPage() {
  const [restaurantName, setRestaurantName] = useState('SpicyEat')
  const [deliveryRadius, setDeliveryRadius] = useState('8')
  const [taxRate, setTaxRate] = useState('5')
  const [notifications, setNotifications] = useState(true)
  const [saved, setSaved] = useState(false)

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <AdminLayout title="Settings">
      <form onSubmit={handleSave} className="max-w-xl rounded-2xl border border-admin-border bg-admin-card p-6">
        <p className="font-bold text-admin-text">Operations</p>
        <div className="mt-4 flex flex-col gap-4">
          <Input
            variant="dark"
            label="Restaurant name"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
          />
          <Input
            variant="dark"
            label="Delivery radius (km)"
            type="number"
            value={deliveryRadius}
            onChange={(e) => setDeliveryRadius(e.target.value)}
          />
          <Input
            variant="dark"
            label="Tax rate (%)"
            type="number"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
          />
          <label className="flex items-center justify-between text-sm text-admin-text2">
            <span>New order notifications</span>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="h-5 w-5 accent-admin-orange"
            />
          </label>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Button type="submit">Save Changes</Button>
          {saved && <span className="text-sm font-semibold text-admin-success">Saved ✓</span>}
        </div>
      </form>
    </AdminLayout>
  )
}
