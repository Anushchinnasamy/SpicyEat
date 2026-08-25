import { apiRequest } from './client'
import type { User } from '../types'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
}

export function login(payload: LoginPayload) {
  return apiRequest<User>(() => ({
    id: 'user-1',
    name: payload.email.split('@')[0] || 'Foodie',
    email: payload.email,
  }))
}

export function register(payload: RegisterPayload) {
  return apiRequest<User>(() => ({
    id: 'user-1',
    name: payload.name,
    email: payload.email,
  }))
}
