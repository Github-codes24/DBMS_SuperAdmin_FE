const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
const normalizedBaseUrl = configuredApiBaseUrl?.replace(/\/+$/, '')

export const apiBaseUrl = normalizedBaseUrl
  ? /\/api$/i.test(normalizedBaseUrl)
    ? normalizedBaseUrl
    : `${normalizedBaseUrl}/api`
  : '/api'
