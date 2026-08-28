import { fetchApi } from './client'

export interface AdminUserSummary {
  id: string
  email: string
  role: string
  status: string
  createdAt: string
}

export function listUsers(): Promise<AdminUserSummary[]> {
  return fetchApi<AdminUserSummary[]>('/api/auth/admin/users')
}
