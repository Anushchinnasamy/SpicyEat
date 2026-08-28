import { fetchApi } from './client'

export interface PaymentResponse {
  id: string
  orderId: string
  userId: string
  amount: number
  status: string
  refundedAmount: number
  providerReference: string | null
  createdAt: string
  updatedAt: string
}

export function fetchPaymentByOrder(orderId: string): Promise<PaymentResponse> {
  return fetchApi<PaymentResponse>(`/api/payments/by-order/${orderId}`)
}

export function refundPayment(paymentId: string, amount: number, reason?: string): Promise<PaymentResponse> {
  return fetchApi<PaymentResponse>(`/api/payments/${paymentId}/refund`, {
    method: 'POST',
    body: JSON.stringify({ amount, reason }),
  })
}
