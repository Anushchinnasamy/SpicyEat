import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface DeliveryAuthState {
  isPartner: boolean
  partnerId: string | null
  partnerName: string | null
  online: boolean
  login: (id: string, name: string) => void
  logout: () => void
  setOnline: (online: boolean) => void
}

export const useDeliveryAuthStore = create<DeliveryAuthState>()(
  persist(
    (set) => ({
      isPartner: false,
      partnerId: null,
      partnerName: null,
      online: true,
      login: (id, name) => set({ isPartner: true, partnerId: id, partnerName: name }),
      logout: () => set({ isPartner: false, partnerId: null, partnerName: null }),
      setOnline: (online) => set({ online }),
    }),
    { name: 'spicyeat-delivery-auth' },
  ),
)
