import { useState } from 'react'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { Button } from '../../components/buttons/Button'
import { stripePromise } from '../../lib/stripe'
import { verifyPayment } from '../../api/payments'

interface Props {
  clientSecret: string
  paymentId: string
  amount: number
  onSuccess: () => void
}

export function PaymentStep({ clientSecret, paymentId, amount, onSuccess }: Props) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentForm paymentId={paymentId} amount={amount} onSuccess={onSuccess} />
    </Elements>
  )
}

function PaymentForm({ paymentId, amount, onSuccess }: Omit<Props, 'clientSecret'>) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePay(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setSubmitting(true)
    setError(null)

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })

    if (confirmError) {
      setError(confirmError.message ?? 'Payment failed. Try a different card.')
      setSubmitting(false)
      return
    }

    if (paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'processing') {
      // Reconciles our record with Stripe's — the source of truth is the
      // webhook in production, but local dev has no public URL for Stripe to
      // call back to, so this polls Stripe directly instead.
      try {
        await verifyPayment(paymentId)
      } catch {
        // Non-fatal: the charge already succeeded with Stripe; a stale local
        // status will catch up on the next verify/webhook.
      }
      onSuccess()
      return
    }

    setError('Payment did not complete. Please try again.')
    setSubmitting(false)
  }

  return (
    <form onSubmit={handlePay} className="flex flex-col gap-4">
      <PaymentElement />
      {error && <p className="text-sm text-chili-red">{error}</p>}
      <Button type="submit" disabled={!stripe || submitting} className="w-full justify-center">
        {submitting ? 'Processing payment...' : `Pay ₹${amount}`}
      </Button>
    </form>
  )
}
