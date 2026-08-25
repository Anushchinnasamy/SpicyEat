import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useDeliveryAuthStore } from '../../state/deliveryAuthStore'

export function RequireDeliveryPartner({ children }: { children: ReactNode }) {
  const isPartner = useDeliveryAuthStore((s) => s.isPartner)
  if (!isPartner) return <Navigate to="/delivery/login" replace />
  return <>{children}</>
}
