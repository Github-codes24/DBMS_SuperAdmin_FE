const accessTokenKey = 'accessToken'
export const authSessionChangeEvent = 'platform-admin:auth-session-change'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  projectIds?: string[]
}

export function getAccessToken() {
  return localStorage.getItem(accessTokenKey)
}

export function setAccessToken(accessToken: string) {
  localStorage.setItem(accessTokenKey, accessToken)
  window.dispatchEvent(new Event(authSessionChangeEvent))
}

export function clearAccessToken() {
  localStorage.removeItem(accessTokenKey)
  window.dispatchEvent(new Event(authSessionChangeEvent))
}

export function getCurrentUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('user')
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}
