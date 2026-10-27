const accessTokenKey = 'accessToken'

export function getAccessToken() {
  return localStorage.getItem(accessTokenKey)
}

export function clearAccessToken() {
  localStorage.removeItem(accessTokenKey)
}
