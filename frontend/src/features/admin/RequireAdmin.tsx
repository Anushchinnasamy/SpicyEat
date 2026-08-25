import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAdminAuthStore } from '../../state/adminAuthStore'

export function RequireAdmin({ children }: { children: ReactNode }) {
  const isAdmin = useAdminAuthStore((s) => s.isAdmin)
  if (!isAdmin) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}
