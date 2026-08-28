import type { ApiResult } from '../types'
import { useAuthStore } from '../state/authStore'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

/**
 * Simulates network latency for the mock layer so loading states are
 * exercised the same way real fetch calls would trigger them.
 */
export async function apiRequest<T>(resolve: () => T, delayMs = 350): Promise<ApiResult<T>> {
  await new Promise((res) => setTimeout(res, delayMs))
  return { data: resolve() }
}

/**
 * Parses the error message from the standard Spring Boot ApiError response.
 */
export async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const body = await res.json()
    return body.message ?? `Request failed with status ${res.status}`
  } catch {
    return `Request failed with status ${res.status}`
  }
}

/**
 * Real API client that automatically attaches the access token and handles base URLs.
 */
export async function fetchApi<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers)

  if (!headers.has('Content-Type') && options.body instanceof URLSearchParams === false) {
    headers.set('Content-Type', 'application/json')
  }

  const { accessToken } = useAuthStore.getState()
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    throw new Error(await parseErrorMessage(res))
  }

  // Some endpoints (e.g. 202 Accepted, 204 No Content) return an empty body.
  const text = await res.text()
  return (text ? JSON.parse(text) : null) as T
}
