import { create } from 'zustand'

export type ToastVariant = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastState {
  toasts: Toast[]
  dismiss: (id: string) => void
}

const DEFAULT_DURATION_MS = 3200

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

function push(message: string, variant: ToastVariant) {
  const id = crypto.randomUUID()
  useToastStore.setState((s) => ({ toasts: [...s.toasts, { id, message, variant }] }))
  setTimeout(() => useToastStore.getState().dismiss(id), DEFAULT_DURATION_MS)
}

export const toast = {
  success: (message: string) => push(message, 'success'),
  error: (message: string) => push(message, 'error'),
  info: (message: string) => push(message, 'info'),
}
