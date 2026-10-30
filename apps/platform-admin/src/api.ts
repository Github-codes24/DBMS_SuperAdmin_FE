const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
const normalizedBaseUrl = configuredApiBaseUrl?.replace(/\/+$/, '')
const defaultApiBaseUrl = import.meta.env.DEV
  ? '/api'
  : 'https://dbms-superadmin-be.onrender.com/api'

export const apiBaseUrl = normalizedBaseUrl
  ? /\/api$/i.test(normalizedBaseUrl)
    ? normalizedBaseUrl
    : `${normalizedBaseUrl}/api`
  : defaultApiBaseUrl
