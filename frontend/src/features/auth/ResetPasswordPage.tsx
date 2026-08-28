import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PageShell } from '../../components/layout/PageShell'
import { EditorialHeading } from '../../components/typography/EditorialHeading'
import { Input } from '../../components/forms/Input'
import { Button, LinkButton } from '../../components/buttons/Button'
import { resetPassword } from '../../api/auth'
import { EmptyState } from '../../components/feedback/States'

export function ResetPasswordPage() {
  const [token, setToken] = useState<string | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    setToken(params.get('token'))
  }, [location])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    
    if (!token) {
      setError('Invalid or missing reset token.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await resetPassword({ token, newPassword: password })
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password. The link might be expired.')
    } finally {
      setLoading(false)
    }
  }

  if (!token && !success) {
    return (
      <PageShell>
        <EmptyState
          title="Invalid Link"
          subtitle="We couldn't find a reset token in the URL. Please request a new password reset link."
          action={
            <LinkButton to="/login" className="mt-2">
              Back to Login →
            </LinkButton>
          }
        />
      </PageShell>
    )
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-md px-6 py-20 pb-40">
        {!success ? (
          <>
            <EditorialHeading size="md" lines={['Set a new,', 'secure password.']} />
            <p className="mt-3 text-sm text-muted-ink">
              Choose a strong password to protect your cravings.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
              <Input
                icon="🔒"
                type="password"
                required
                minLength={8}
                maxLength={100}
                placeholder="New password (min 8 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Input
                icon="🔒"
                type="password"
                required
                minLength={8}
                maxLength={100}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              {error && <p className="text-sm text-chili-red">{error}</p>}

              <Button type="submit" disabled={loading} className="mt-4 justify-center">
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          </>
        ) : (
          <div className="rounded-3xl bg-white p-8 text-center ring-1 ring-deep-ink/5">
            <span className="mb-4 block text-4xl">✅</span>
            <p className="font-display text-xl uppercase">Password Updated</p>
            <p className="mt-2 text-sm text-muted-ink">
              Your password has been successfully changed. All existing sessions have been signed out.
            </p>
            <Button type="button" onClick={() => navigate('/login')} className="mt-8 w-full justify-center">
              Login to continue →
            </Button>
          </div>
        )}
      </div>
    </PageShell>
  )
}
