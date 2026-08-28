import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/buttons/Button'
import { Input } from '../../components/forms/Input'
import { EditorialHeading } from '../../components/typography/EditorialHeading'
import { LoginEntryAnimation } from '../../components/animations/LoginEntryAnimation'
import { useAuth } from './useAuth'

type Tab = 'login' | 'register' | 'forgot-password'

const perks = [
  { icon: '🔥', title: 'Real Heat', desc: 'No compromises. Just fire.' },
  { icon: '🍗', title: 'Crispy', desc: 'Crunch in every single bite.' },
  { icon: '🌿', title: 'Fresh', desc: 'Quality ingredients. Always.' },
  { icon: '❤️', title: 'Made For You', desc: 'Cooked with love, served hot.' },
]

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
      {off && <line x1="3" y1="21" x2="21" y2="3" />}
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.95v2.33A9 9 0 0 0 9 18Z"
      />
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.95A9 9 0 0 0 0 9c0 1.45.35 2.83.95 4.03l3-2.33Z" />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .95 4.97l3 2.33C4.66 5.17 6.65 3.58 9 3.58Z"
      />
    </svg>
  )
}

function SocialButton({ children, label }: { children: ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-deep-ink/15 bg-white/60 text-sm font-semibold text-deep-ink transition-colors hover:border-deep-ink/30 hover:bg-white"
    >
      {children}
      {label}
    </button>
  )
}

export function AuthPage({ initialTab = 'login' }: { initialTab?: Tab }) {
  const [tab, setTab] = useState<Tab>(initialTab)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showEntry, setShowEntry] = useState(false)
  const [forgotSuccess, setForgotSuccess] = useState(false)
  const { login, register, requestReset, loading, error, setErrorEmpty } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (tab === 'forgot-password') {
      const ok = await requestReset({ email })
      if (ok) {
        setForgotSuccess(true)
      }
    } else {
      const ok = tab === 'login' ? await login({ email, password }) : await register({ name, email, password })
      if (ok) setShowEntry(true)
    }
  }

  function handleSwitchTab(t: Tab) {
    setTab(t)
    setForgotSuccess(false)
    setErrorEmpty()
  }

  return (
    <div className="grid h-screen overflow-hidden lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-deep-ink lg:flex lg:flex-col lg:justify-between lg:p-10">
        <img
          src="/images/login/login-hero-clean.png"
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-deep-ink via-deep-ink/60 to-transparent" />

        <div className="relative flex items-center gap-1.5 font-display text-xl uppercase text-warm-canvas">
          <span aria-hidden>🌶️</span>
          Spicy<span className="text-sun-orange">Eat</span>
        </div>

        <div className="relative">
          <EditorialHeading
            size="lg"
            lines={['Come Hungry.', 'Leave Obsessed.']}
            accentLine={1}
            className="text-warm-canvas"
          />
          <p className="mt-6 max-w-sm text-sm text-warm-canvas/70">
            <span className="font-semibold text-sun-orange">Bold</span> flavors.{' '}
            <span className="font-semibold text-sun-orange">Real</span> heat.
            <br />
            Food you'll <span className="font-semibold text-sun-orange">crave</span> again.
          </p>
        </div>

        <div className="relative grid grid-cols-2 gap-6 sm:grid-cols-4">
          {perks.map((p) => (
            <div key={p.title} className="flex flex-col gap-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-warm-canvas/20 text-lg">
                {p.icon}
              </span>
              <p className="font-display text-sm uppercase text-warm-canvas">{p.title}</p>
              <p className="text-xs text-warm-canvas/60">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex h-full flex-col justify-center overflow-y-auto px-6 py-8 sm:px-16">
        <div className="mx-auto w-full max-w-sm">
          <p className="mb-2 text-sm">Hey there! 👋</p>
          <EditorialHeading
            as="h1"
            size="md"
            lines={
              tab === 'login'
                ? ['Welcome', 'Back']
                : tab === 'register'
                  ? ["Let's get", 'you fed.']
                  : ['Reset', 'password']
            }
          />
          <p className="mt-3 text-sm text-muted-ink">
            {tab === 'login' && <>Login to continue your <span className="text-sun-orange">spicy</span> journey.</>}
            {tab === 'register' && 'Create an account and start craving.'}
            {tab === 'forgot-password' && 'Enter your email to receive a password reset link.'}
          </p>

          <div className="mt-8 flex gap-6 border-b border-deep-ink/10">
            {(['login', 'register'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleSwitchTab(t)}
                className={`-mb-px border-b-2 pb-3 text-sm font-bold uppercase tracking-wide transition-colors ${
                  tab === t || (tab === 'forgot-password' && t === 'login') ? 'border-sun-orange text-deep-ink' : 'border-transparent text-muted-ink'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {!forgotSuccess ? (
            <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
              {tab === 'register' && (
                <Input
                  icon="👤"
                  type="text"
                  required
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              )}
              <Input
                icon="✉️"
                type="email"
                required
                placeholder="Email or phone number"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              
              {tab !== 'forgot-password' && (
                <Input
                  icon="🔒"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  maxLength={100}
                  placeholder="Password (min 8 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  endAdornment={
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="shrink-0 text-muted-ink transition-colors hover:text-deep-ink"
                    >
                      <EyeIcon off={showPassword} />
                    </button>
                  }
                />
              )}

              {tab === 'login' && (
                <button 
                  type="button" 
                  onClick={() => handleSwitchTab('forgot-password')}
                  className="self-end text-xs font-semibold text-sun-orange hover:underline"
                >
                  Forgot password?
                </button>
              )}

              {error && <p className="text-sm text-chili-red">{error}</p>}

              <Button type="submit" disabled={loading} className="mt-2 w-full justify-center">
                {loading ? 'Cooking something good...' : tab === 'login' ? 'Login' : tab === 'register' ? 'Create Account' : 'Send Reset Link'}
                {!loading && <span aria-hidden>→</span>}
              </Button>
            </form>
          ) : (
            <div className="mt-8 rounded-2xl bg-herb-green/10 p-6 text-center text-sm text-deep-ink">
              <span className="mb-2 block text-2xl">✅</span>
              <p className="font-semibold">Reset link sent!</p>
              <p className="mt-1 text-muted-ink">If an account exists for {email}, a reset link has been dispatched to it.</p>
              <button 
                type="button" 
                onClick={() => handleSwitchTab('login')} 
                className="mt-6 font-semibold text-sun-orange hover:underline"
              >
                Back to Login
              </button>
            </div>
          )}

          {tab !== 'forgot-password' && (
            <>
              <div className="mt-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-muted-ink">
                <span className="h-px flex-1 bg-deep-ink/10" />
                or continue with
                <span className="h-px flex-1 bg-deep-ink/10" />
              </div>

              <div className="mt-4 flex gap-3">
                <SocialButton label="Google">
                  <GoogleIcon />
                </SocialButton>
                <SocialButton label="Apple">
                  <span aria-hidden className="text-base"></span>
                </SocialButton>
              </div>

              <p className="mt-8 text-center text-xs text-muted-ink">
                {tab === 'login' ? (
                  <>
                    New here?{' '}
                    <button className="font-semibold text-sun-orange hover:underline" onClick={() => handleSwitchTab('register')}>
                      Create an account →
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button className="font-semibold text-sun-orange hover:underline" onClick={() => handleSwitchTab('login')}>
                      Login →
                    </button>
                  </>
                )}
              </p>
            </>
          )}
        </div>
      </div>

      {showEntry && <LoginEntryAnimation onComplete={() => navigate('/')} />}
    </div>
  )
}
