import axios, { type InternalAxiosRequestConfig } from 'axios'
import { apiBaseUrl } from '../api'
import { authSessionChangeEvent } from '../features/auth/authService'

export const api = axios.create({
  baseURL: apiBaseUrl,
})

// 1. Request Interceptor: Har request mein Bearer token attach karein
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 2. Response Interceptor: 401 aane par silent refresh karein
let isRefreshing = false
let failedQueue: Array<{
  resolve: (token: string | null) => void
  reject: (error: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    // Agar 401 aaye aur ye retry nahi hua hai
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        // Refresh token bhi nahi hai toh logout karein
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.dispatchEvent(new Event(authSessionChangeEvent))
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        // Backend ka refresh endpoint call karein
        const refreshUrl = `${apiBaseUrl}/auth/refresh`
        const res = await axios.post(refreshUrl, { refreshToken })
        const payload = res.data?.data ?? res.data
        const newAccessToken = payload?.accessToken
        const newRefreshToken = payload?.refreshToken

        if (!newAccessToken) {
          throw new Error('Refresh endpoint did not return an access token')
        }

        localStorage.setItem('accessToken', newAccessToken)
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken)
        }
        window.dispatchEvent(new Event(authSessionChangeEvent))

        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        processQueue(null, newAccessToken)
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        window.dispatchEvent(new Event(authSessionChangeEvent))
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default api

