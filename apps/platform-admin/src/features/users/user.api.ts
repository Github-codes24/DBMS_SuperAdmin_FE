import { apiBaseUrl } from '../../api'
import { clearAccessToken, getAccessToken } from '../auth/authService'
import type {
  AccountStatus,
  CreateUserInput,
  UserInput,
  UserListParams,
} from './types/user.types'

async function request(path: string, init?: RequestInit): Promise<unknown> {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new Error('Authentication required. Please sign in to continue.')
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  })

  if (response.status === 401) {
    clearAccessToken()
  }

  if (!response.ok) {
    let message = `Request failed (${response.status}).`
    try {
      const body: unknown = await response.json()
      if (typeof body === 'object' && body !== null && !Array.isArray(body)) {
        const record = body as Record<string, unknown>
        if (typeof record.message === 'string') message = record.message
        else if (typeof record.error === 'string') message = record.error
      }
    } catch {
      if (response.statusText) message = response.statusText
    }
    throw new Error(message)
  }

  if (response.status === 204) return undefined

  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json') && !contentType.includes('+json')) {
    throw new Error('The API returned a non-JSON response. Verify the API base URL and endpoint configuration.')
  }

  const responseText = await response.text()
  return responseText ? JSON.parse(responseText) as unknown : undefined
}

export const userApi = {
  listUsers(params: UserListParams, signal?: AbortSignal): Promise<unknown> {
    const query = new URLSearchParams({
      page: String(params.page),
      limit: String(params.pageSize),
    })
    if (params.search) query.set('search', params.search)
    if (params.role) query.set('role', params.role)
    if (params.status) query.set('isActive', String(params.status === 'active'))
    query.set('sortBy', 'createdAt')
    query.set('sortOrder', 'desc')

    return request(`/users?${query.toString()}`, { signal })
  },

  listRoles(signal?: AbortSignal): Promise<unknown> {
    return request('/roles', { signal })
  },

  listProjects(signal?: AbortSignal): Promise<unknown> {
    return request('/projects', { signal })
  },

  getUser(id: string): Promise<unknown> {
    return request(`/users/${encodeURIComponent(id)}`)
  },

  createUser(input: CreateUserInput): Promise<unknown> {
    return request('/users', {
      method: 'POST',
      body: JSON.stringify({
        name: input.fullName,
        email: input.email,
        password: input.password,
        phoneNumber: input.phoneNumber,
        role: input.role,
        projectIds: input.assignedProjects,
        isActive: true,
      }),
    })
  },

  updateUser(id: string, input: UserInput): Promise<unknown> {
    return request(`/users/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: input.fullName,
        email: input.email,
        phoneNumber: input.phoneNumber,
        role: input.role,
        projectIds: input.assignedProjects,
      }),
    })
  },

  updateUserStatus(id: string, status: AccountStatus): Promise<unknown> {
    return request(`/users/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: status === 'active' }),
    })
  },

  resetUserPassword(id: string, password: string): Promise<unknown> {
    return request(`/users/${encodeURIComponent(id)}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    })
  },

  deleteUser(id: string): Promise<unknown> {
    return request(`/users/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
  },
}
