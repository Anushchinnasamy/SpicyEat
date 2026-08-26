import type { ApiResult, User } from '../types'
import { useAuthStore } from '../state/authStore'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://api-gateway-19ce.onrender.com'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

interface AuthResponse {
  accessToken: string
  refreshToken: string
  expiresInSeconds: number
  tokenType: string
}

interface MeResponse {
  id: string
  email: string
  role: string
}

interface ProfileResponse {
  userId: string
  fullName: string | null
  phoneNumber: string | null
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json()
    return body.message ?? `Request failed with status ${res.status}`
  } catch {
    return `Request failed with status ${res.status}`
  }
}

async function authenticate(path: string, body: unknown): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json()
}

async function fetchMe(accessToken: string): Promise<MeResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json()
}

async function fetchProfile(accessToken: string): Promise<ProfileResponse> {
  const res = await fetch(`${API_BASE_URL}/api/users/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json()
}

async function updateProfileName(accessToken: string, fullName: string): Promise<ProfileResponse> {
  const res = await fetch(`${API_BASE_URL}/api/users/me`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ fullName, phoneNumber: null }),
  })
  if (!res.ok) throw new Error(await parseErrorMessage(res))
  return res.json()
}

function persistSession(user: User, tokens: AuthResponse) {
  useAuthStore.getState().setSession(user, tokens.accessToken, tokens.refreshToken)
}

export async function login(payload: LoginPayload): Promise<ApiResult<User>> {
  const tokens = await authenticate('/api/auth/login', { email: payload.email, password: payload.password })
  const [me, profile] = await Promise.all([fetchMe(tokens.accessToken), fetchProfile(tokens.accessToken)])
  const user: User = { id: me.id, name: profile.fullName || me.email.split('@')[0], email: me.email }
  persistSession(user, tokens)
  return { data: user }
}

export async function register(payload: RegisterPayload): Promise<ApiResult<User>> {
  const tokens = await authenticate('/api/auth/register', {
    email: payload.email,
    password: payload.password,
    role: 'CUSTOMER',
  })
  const me = await fetchMe(tokens.accessToken)
  const profile = await updateProfileName(tokens.accessToken, payload.name)
  const user: User = { id: me.id, name: profile.fullName || payload.name, email: me.email }
  persistSession(user, tokens)
  return { data: user }
}
