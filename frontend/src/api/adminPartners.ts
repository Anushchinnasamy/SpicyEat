import { fetchApi } from './client'

export interface AdminPartner {
  userId: string
  vehicle: string | null
  rating: number | null
  online: boolean
  completedDeliveries: number
}

export function listPartners(): Promise<AdminPartner[]> {
  return fetchApi<AdminPartner[]>('/api/delivery/admin/partners')
}
