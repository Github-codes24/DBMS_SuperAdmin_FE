const accessTokenKey = 'accessToken'
export const authSessionChangeEvent = 'platform-admin:auth-session-change'

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
