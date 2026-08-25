import type { ApiResult } from '../types'

/**
 * Simulates network latency for the mock layer so loading states are
 * exercised the same way real fetch calls would trigger them. Swap the
 * body of this function for a real fetch() once a backend exists — every
 * caller already awaits an ApiResult<T>.
 */
export async function apiRequest<T>(resolve: () => T, delayMs = 350): Promise<ApiResult<T>> {
  await new Promise((res) => setTimeout(res, delayMs))
  return { data: resolve() }
}
