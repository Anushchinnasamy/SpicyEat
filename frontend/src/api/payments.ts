import { fetchApi } from './client'

export interface PaymentResponse {
  id: string
  orderId: string
  userId: string
  amount: number
  status: 'INITIATED' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED'
  refundedAmount: number
  providerReference: string | null
  clientSecret: string | null
  createdAt: string
  updatedAt: string
}

export function createPayment(orderId: string, amount: number): Promise<PaymentResponse> {
  // One idempotency key per attempt: a retried click after a network blip safely
  // replays instead of creating a second charge for the same order.
  const idempotencyKey = crypto.randomUUID()
  return fetchApi<PaymentResponse>('/api/payments', {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify({ orderId, amount }),
  })
}

export function verifyPayment(paymentId: string): Promise<PaymentResponse> {
  return fetchApi<PaymentResponse>(`/api/payments/${paymentId}/verify`, { method: 'POST' })
}

export function fetchPaymentByOrder(orderId: string): Promise<PaymentResponse> {
  return fetchApi<PaymentResponse>(`/api/payments/by-order/${orderId}`)
}
