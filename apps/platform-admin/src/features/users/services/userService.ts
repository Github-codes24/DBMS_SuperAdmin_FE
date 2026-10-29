import type {
  AccountStatus,
  AssignedProject,
  CreateUserInput,
  User,
  UserInput,
  UserListParams,
  UserListResult,
} from '../types/user.types'
import { clearAccessToken, getAccessToken } from '../../auth/authService'
import { apiBaseUrl } from '../../../api'

export class AuthenticationError extends Error {
  constructor() {
    super('Your session has expired. Please sign in again.')
    this.name = 'AuthenticationError'
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('The server returned an invalid response.')
  }
  return value as Record<string, unknown>
}

function asString(value: unknown, field: string): string {
  if (typeof value !== 'string' && typeof value !== 'number') {
    throw new Error(`The server response is missing ${field}.`)
  }
  return String(value)
}

function apiErrorMessage(value: unknown, field?: string): string | undefined {
  if (typeof value === 'string') return field ? `${field}: ${value}` : value
  if (Array.isArray(value)) {
    const messages = value
      .map((item) => apiErrorMessage(item))
      .filter((message): message is string => Boolean(message))
    return messages.length ? messages.join('; ') : undefined
  }
  if (typeof value !== 'object' || value === null) return undefined

  const record = value as Record<string, unknown>
  const rawMessage = record.message ?? record.msg
  const fieldValue = record.field ?? record.path ?? record.param ?? record.property
  const fieldLabel = Array.isArray(fieldValue) ? fieldValue.join('.') : typeof fieldValue === 'string' ? fieldValue : undefined
  const message = typeof rawMessage === 'string'
    ? fieldLabel && !rawMessage.toLowerCase().startsWith(`${fieldLabel.toLowerCase()}:`)
      ? `${fieldLabel}: ${rawMessage}`
      : rawMessage
    : undefined
  const details = apiErrorMessage(record.errors ?? record.details ?? record.issues)
  if (message && details && message !== details) return `${message}: ${details}`
  if (message ?? details) return message ?? details

  const nestedMessages = Object.entries(record)
    .map(([key, nestedValue]) => apiErrorMessage(nestedValue, key))
    .filter((entry): entry is string => Boolean(entry))
  return nestedMessages.length ? nestedMessages.join('; ') : undefined
}

function unwrapList(value: unknown): { items: unknown[]; metadata: Record<string, unknown> } {
  if (Array.isArray(value)) return { items: value, metadata: {} }

  const response = asRecord(value)
  const data = response.data
  if (Array.isArray(data)) return { items: data, metadata: response }

  const nested =
    typeof data === 'object' && data !== null && !Array.isArray(data)
      ? asRecord(data)
      : {}
  const items =
    nested.users ??
    nested.items ??
    nested.projects ??
    response.users ??
    response.items ??
    response.projects
  if (!Array.isArray(items)) {
    throw new Error('The server returned an invalid list response.')
  }
  return { items, metadata: { ...response, ...nested } }
}

function assignedProjects(value: unknown): AssignedProject[] {
  if (value == null) return []
  if (!Array.isArray(value)) {
    throw new Error('The server returned an invalid project list for a user.')
  }
  return value.map((project) => {
    if (typeof project === 'string' || typeof project === 'number') {
      const name = String(project)
      return { id: name, name }
    }
    const record = asRecord(project)
    const id = asString(record.id ?? record._id ?? record.name ?? record.projectName, 'a project identifier')
    const name = asString(record.name ?? record.projectName ?? id, 'a project name')
    return { id, name }
  })
}

function mapUser(value: unknown): User {
  const record = asRecord(value)
  const roleValue = record.role ?? record.roleName
  let role: string
  if (typeof roleValue === 'object' && roleValue !== null) {
    const roleRecord = asRecord(roleValue)
    role = asString(roleRecord.name ?? roleRecord.label, 'a role name')
  } else {
    role = asString(roleValue, 'a role')
  }

  const rawStatus = record.status ?? record.accountStatus
  const statusValue =
    rawStatus === undefined && typeof record.isActive === 'boolean'
      ? record.isActive
        ? 'active'
        : 'inactive'
      : rawStatus
  const status = String(statusValue).toLowerCase()
  if (status !== 'active' && status !== 'inactive') {
    throw new Error('The server returned an unsupported account status.')
  }

  const phoneNumber = record.phoneNumber ?? record.phone ?? ''
  if (typeof phoneNumber !== 'string' && typeof phoneNumber !== 'number') {
    throw new Error('The server returned an invalid phone number.')
  }

  return {
    id: asString(record.id ?? record._id, 'a user identifier'),
    fullName: asString(record.fullName ?? record.name, 'a user name'),
    email: asString(record.email, 'a user email address'),
    phoneNumber: String(phoneNumber),
    role,
    assignedProjects: assignedProjects(record.assignedProjects ?? record.projectIds ?? record.projects),
    status: status as AccountStatus,
    createdAt: asString(record.createdAt ?? record.created_at, 'a creation date'),
    ...(record.updatedAt || record.updated_at
      ? { updatedAt: asString(record.updatedAt ?? record.updated_at, 'an update date') }
      : {}),
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const accessToken = getAccessToken()
  if (!accessToken) {
    throw new AuthenticationError()
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
    throw new AuthenticationError()
  }

  if (!response.ok) {
    let message = `Request failed (${response.status}).`
    try {
      const body: unknown = await response.json()
      const bodyMessage = apiErrorMessage(body)
      if (bodyMessage) message = bodyMessage
      else if (typeof body === 'object' && body !== null && !Array.isArray(body)) {
        const error = (body as Record<string, unknown>).error
        if (typeof error === 'string') message = error
      }
    } catch {
      if (response.statusText) message = response.statusText
    }
    throw new Error(message)
  }

  if (response.status === 204) return undefined as T
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json') && !contentType.includes('+json')) {
    throw new Error('The API returned a non-JSON response. Verify the API base URL and endpoint configuration.')
  }
  const responseText = await response.text()
  if (!responseText) return undefined as T
  return JSON.parse(responseText) as T
}

export async function listUsers(
  params: UserListParams,
  signal?: AbortSignal,
): Promise<UserListResult> {
  const query = new URLSearchParams({
    page: String(params.page),
    limit: String(params.pageSize),
  })
  if (params.search) query.set('search', params.search)
  if (params.role) query.set('role', params.role)
  if (params.status) query.set('isActive', String(params.status === 'active'))
  query.set('sortBy', 'createdAt')
  query.set('sortOrder', 'desc')

  const raw: unknown = await request(`/users?${query.toString()}`, { signal })
  const { items, metadata } = unwrapList(raw)
  const pagination =
    typeof metadata.pagination === 'object' && metadata.pagination !== null
      ? asRecord(metadata.pagination)
      : {}
  const totalValue =
    metadata.total ??
    metadata.totalCount ??
    metadata.totalItems ??
    pagination.total ??
    pagination.totalCount ??
    items.length
  const pageValue = metadata.page ?? pagination.page ?? params.page
  const pageSizeValue = metadata.limit ?? metadata.pageSize ?? pagination.limit ?? pagination.pageSize ?? params.pageSize

  if (
    typeof totalValue !== 'number' ||
    typeof pageValue !== 'number' ||
    typeof pageSizeValue !== 'number'
  ) {
    throw new Error('The server returned invalid pagination information.')
  }

  return {
    users: items.map(mapUser),
    total: totalValue,
    page: pageValue,
    pageSize: pageSizeValue,
  }
}

export async function getUser(id: string): Promise<User> {
  const raw: unknown = await request(`/users/${encodeURIComponent(id)}`)
  const record = asRecord(raw)
  return mapUser(record.data ?? record.user ?? record)
}

export async function createUser(input: CreateUserInput): Promise<void> {
  await request('/users', {
    method: 'POST',
    body: JSON.stringify({
      name: input.fullName,
      email: input.email,
      password: input.password,
      ...(input.phoneNumber.trim() ? { phoneNumber: input.phoneNumber.trim() } : {}),
      role: apiRole(input.role),
      projectIds: input.assignedProjects,
      isActive: true,
    }),
  })
}

export async function updateUser(id: string, input: UserInput): Promise<void> {
  await request(`/users/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify({
      name: input.fullName,
      email: input.email,
      ...(input.phoneNumber.trim() ? { phoneNumber: input.phoneNumber.trim() } : {}),
      role: apiRole(input.role),
      projectIds: input.assignedProjects,
    }),
  })
}

function apiRole(role: string): string {
  return role.toLowerCase() === 'admin' ? 'admin' : role
}

export async function updateUserStatus(id: string, status: AccountStatus): Promise<void> {
  await request(`/users/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive: status === 'active' }),
  })
}

export async function resetUserPassword(id: string, password: string): Promise<void> {
  await request(`/users/${encodeURIComponent(id)}/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ password }),
  })
}

export async function deleteUser(id: string): Promise<void> {
  await request(`/users/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}
