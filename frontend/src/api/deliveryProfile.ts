import { fetchApi } from './client'

export interface PartnerProfile {
  userId: string
  vehicle: string | null
  rating: number | null
  online: boolean
}

export function fetchPartnerProfile(): Promise<PartnerProfile> {
  return fetchApi<PartnerProfile>('/api/delivery/profile')
}

export function updatePartnerVehicle(vehicle: string): Promise<PartnerProfile> {
  return fetchApi<PartnerProfile>('/api/delivery/profile', {
    method: 'PUT',
    body: JSON.stringify({ vehicle }),
  })
}

export function setPartnerOnline(online: boolean): Promise<PartnerProfile> {
  return fetchApi<PartnerProfile>('/api/delivery/profile/online', {
    method: 'POST',
    body: JSON.stringify({ online }),
  })
}
