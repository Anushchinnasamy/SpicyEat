import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../state/authStore'

export function RequireDeliveryPartner({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user)
  if (!user || user.role !== 'DELIVERY_PARTNER') return <Navigate to="/delivery/login" replace />
  return <>{children}</>
}
