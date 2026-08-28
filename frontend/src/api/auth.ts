import type { ApiResult, User } from '../types'
import { useAuthStore } from '../state/authStore'
import { fetchApi } from './client'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  token: string
  newPassword: string
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

function persistSession(user: User, tokens: AuthResponse) {
  useAuthStore.getState().setSession(user, tokens.accessToken, tokens.refreshToken)
}

export async function fetchMe(): Promise<MeResponse> {
  return fetchApi<MeResponse>('/api/auth/me')
}

export async function fetchProfile(): Promise<ProfileResponse> {
  return fetchApi<ProfileResponse>('/api/users/me')
}

export async function updateProfileName(fullName: string): Promise<ProfileResponse> {
  return fetchApi<ProfileResponse>('/api/users/me', {
    method: 'PUT',
    body: JSON.stringify({ fullName, phoneNumber: null }),
  })
}

export async function login(payload: LoginPayload): Promise<ApiResult<User>> {
  const tokens = await fetchApi<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: payload.email, password: payload.password }),
  })
  
  // Set tokens temporarily so subsequent calls have the Bearer token attached automatically
  useAuthStore.getState().setSession({ id: '', name: '', email: '', role: '' }, tokens.accessToken, tokens.refreshToken)

  try {
    const [me, profile] = await Promise.all([fetchMe(), fetchProfile()])
    const user: User = { id: me.id, name: profile.fullName || me.email.split('@')[0], email: me.email, role: me.role }
    persistSession(user, tokens)
    return { data: user }
  } catch (error) {
    useAuthStore.getState().logout()
    throw error
  }
}

export async function register(payload: RegisterPayload): Promise<ApiResult<User>> {
  const tokens = await fetchApi<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
      role: 'CUSTOMER',
    }),
  })
  
  // Set tokens temporarily so subsequent calls have the Bearer token
  useAuthStore.getState().setSession({ id: '', name: '', email: '', role: '' }, tokens.accessToken, tokens.refreshToken)

  try {
    const me = await fetchMe()
    const profile = await updateProfileName(payload.name)
    const user: User = { id: me.id, name: profile.fullName || payload.name, email: me.email, role: me.role }
    persistSession(user, tokens)
    return { data: user }
  } catch (error) {
    useAuthStore.getState().logout()
    throw error
  }
}

export async function requestPasswordReset(payload: ForgotPasswordPayload): Promise<void> {
  await fetchApi('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<void> {
  await fetchApi('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await fetchApi('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  })
}

export async function performLogout(): Promise<void> {
  const { refreshToken, logout } = useAuthStore.getState()
  if (refreshToken) {
    try {
      await fetchApi('/api/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      })
    } catch (e) {
      // Intentionally ignore backend logout failure so local state cleans up safely
      console.error('Failed to revoke session on backend', e)
    }
  }
  // Clear local state
  logout()
}
