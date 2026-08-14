import { apiClient } from './apiClient.js'
import { clearAuthToken, getAuthToken, setAuthToken } from './authToken.js'

export const isLoggedIn = () => Boolean(getAuthToken())

export async function login(credentials) {
  const result = await apiClient('/auth/login', { method: 'POST', body: JSON.stringify(credentials) })
  setAuthToken(result.token)
  return result.user
}

export function logout() {
  clearAuthToken()
}

