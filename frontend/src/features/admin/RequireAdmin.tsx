import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../../state/authStore'

export function RequireAdmin({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user)
  if (!user || user.role !== 'ADMIN') return <Navigate to="/admin/login" replace />
  return <>{children}</>
}
