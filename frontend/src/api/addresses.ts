import { fetchApi } from './client'

export interface AddressResponse {
  id: string
  label: string
  line1: string
  line2: string | null
  city: string
  state: string
  postalCode: string
  isDefault: boolean
}

export interface AddressInput {
  label: string
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
  isDefault: boolean
}

export function fetchAddresses(): Promise<AddressResponse[]> {
  return fetchApi<AddressResponse[]>('/api/users/me/addresses')
}

export function createAddress(input: AddressInput): Promise<AddressResponse> {
  return fetchApi<AddressResponse>('/api/users/me/addresses', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
