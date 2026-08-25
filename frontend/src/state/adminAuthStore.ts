import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AdminAuthState {
  isAdmin: boolean
  adminName: string | null
  login: (name: string) => void
  logout: () => void
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      isAdmin: false,
      adminName: null,
      login: (name) => set({ isAdmin: true, adminName: name }),
      logout: () => set({ isAdmin: false, adminName: null }),
    }),
    { name: 'spicyeat-admin-auth' },
  ),
)
