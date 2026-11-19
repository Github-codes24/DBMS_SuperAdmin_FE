import type {
  AccountStatus,
  AssignedProject,
  CreateUserInput,
  User,
  UserActivity,
  UserInput,
  UserListParams,
  UserListResult,
} from '../types/user.types'
import api from '../../../api/axiosClient'

export class AuthenticationError extends Error {
  constructor() {
    super('Your session has expired. Please sign in again.')
    this.name = 'AuthenticationError'
  }
}

class RouteNotFoundError extends Error {
  constructor(message: string, cause: unknown) {
    super(message, { cause })
    this.name = 'RouteNotFoundError'
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

function optionalString(value: unknown, field: string): string | undefined {
  return value == null ? undefined : asString(value, field)
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
    return {
      id,
      name,
      ...(record.description != null ? { description: asString(record.description, 'a project description') } : {}),
      ...(record.status != null ? { status: asString(record.status, 'a project status') } : {}),
      ...(record.assignedAt != null ? { assignedAt: asString(record.assignedAt, 'a project assignment date') } : {}),
    }
  })
}

function activityHistory(value: unknown): UserActivity[] | undefined {
  if (value == null) return undefined
  if (!Array.isArray(value)) {
    throw new Error('The server returned an invalid user activity history.')
  }
  return value.map((item, index) => {
    const record = asRecord(item)
    return {
      id: optionalString(record.id ?? record._id, 'an activity identifier') ?? String(index),
      action: asString(record.action ?? record.event ?? record.type, 'an activity action'),
      createdAt: asString(record.createdAt ?? record.timestamp ?? record.date, 'an activity date'),
      ...(record.description != null ? { description: asString(record.description, 'an activity description') } : {}),
      ...(record.ipAddress != null || record.ip != null
        ? { ipAddress: asString(record.ipAddress ?? record.ip, 'an activity IP address') }
        : {}),
      ...(record.device != null ? { device: asString(record.device, 'an activity device') } : {}),
      ...(record.before !== undefined ? { before: record.before } : {}),
      ...(record.after !== undefined ? { after: record.after } : {}),
    }
  })
}

function mapUser(value: unknown): User {
  const record = asRecord(value)
  const lastLogin = typeof record.lastLogin === 'object' && record.lastLogin !== null
    ? asRecord(record.lastLogin)
    : {}
  const lastLoginAt = optionalString(
    record.lastLoginAt
      ?? lastLogin.at
      ?? lastLogin.createdAt
      ?? lastLogin.timestamp
      ?? (typeof record.lastLogin === 'string' || typeof record.lastLogin === 'number' ? record.lastLogin : undefined),
    'a last login date',
  )
  const lastLoginIp = optionalString(
    record.lastLoginIp ?? record.lastLoginIP ?? lastLogin.ipAddress ?? lastLogin.ip,
    'a last login IP address',
  )
  const lastLoginDevice = optionalString(
    record.lastLoginDevice ?? record.deviceInfo ?? lastLogin.device,
    'a last login device',
  )
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
    ...(lastLoginAt ? { lastLoginAt } : {}),
    ...(lastLoginIp ? { lastLoginIp } : {}),
    ...(lastLoginDevice ? { lastLoginDevice } : {}),
    ...(record.activityHistory != null || record.activity != null || record.auditLogs != null || record.activities != null
      ? { activityHistory: activityHistory(record.activityHistory ?? record.activity ?? record.auditLogs ?? record.activities) }
      : {}),
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const method = (init?.method ?? 'GET').toUpperCase()
  let data: unknown
  if (init?.body) {
    try {
      data = typeof init.body === 'string' ? JSON.parse(init.body) : init.body
    } catch {
      data = init.body
    }
  }

  try {
    const response = await api({
      url: path,
      method,
      data,
      signal: init?.signal ?? undefined,
    })
    return response.data as T
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new AuthenticationError()
    }
    const bodyMessage = apiErrorMessage(error.response?.data)
    const message = bodyMessage || error.response?.data?.message || error.response?.data?.error || error.message || 'Request failed.'
    if (error.response?.status === 404 && error.response?.data?.error?.code === 'ROUTE_NOT_FOUND') {
      throw new RouteNotFoundError(message, error)
    }
    throw new Error(message)
  }
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
  if (params.role) query.set('role', apiRole(params.role))
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

export async function listRoles(){
  return request('/platform/roles')
}

export async function getUser(id: string): Promise<User> {
  const raw: unknown = await request(`/users/${encodeURIComponent(id)}`)
  const record = asRecord(raw)
  const data = asRecord(record.data ?? record)
  const user = asRecord(data.user ?? record.user ?? data)
  return mapUser({ ...record, ...data, ...user })
}

function auditListItems(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  const response = asRecord(value)
  const data = response.data
  if (Array.isArray(data)) return data
  const nested = typeof data === 'object' && data !== null ? asRecord(data) : {}
  const items =
    nested.activities ??
    nested.auditHistory ??
    nested.auditLogs ??
    nested.activity ??
    nested.events ??
    nested.items ??
    nested.logs ??
    nested.data ??
    response.activities ??
    response.auditHistory ??
    response.auditLogs ??
    response.activity ??
    response.events ??
    response.items ??
    response.logs
  if (!Array.isArray(items)) {
    throw new Error('The server returned an invalid user audit response.')
  }
  return items
}

export async function getUserAudit(id: string, page = 1, limit = 25): Promise<UserActivity[]> {
  const query = new URLSearchParams({ page: String(page), limit: String(limit) })
  const raw: unknown = await request(`/users/${encodeURIComponent(id)}/audit?${query.toString()}`)
  return activityHistory(auditListItems(raw)) ?? []
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const raw: unknown = await request('/users', {
    method: 'POST',
    body: JSON.stringify({
      name: input.fullName,
      email: input.email,
      password: input.password,
      role: apiRole(input.role),
      projectIds: input.assignedProjects,
      isActive: true,
    }),
  })
  const record = asRecord(raw)
  return mapUser(record.data ?? record.user ?? record)
}

export async function updateUser(id: string, input: UserInput): Promise<User> {
  const raw: unknown = await request(`/users/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify({
      name: input.fullName,
      email: input.email,
      role: apiRole(input.role),
      projectIds: input.assignedProjects,
    }),
  })
  const record = asRecord(raw)
  return mapUser(record.data ?? record.user ?? record)
}

function apiRole(role: string): string {
  const normalizedRole = role.toLowerCase().replace(/[\s_-]+/g, '')
  if (normalizedRole === 'superadmin') return 'superadmin'
  if (normalizedRole === 'admin') return 'admin'
  if (normalizedRole === 'manager') return 'manager'
  if (normalizedRole === 'user') return 'user'
  throw new Error('Select a role supported by the server.')
}

export async function updateUserStatus(id: string, status: AccountStatus): Promise<User> {
  const raw: unknown = await request(`/users/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive: status === 'active' }),
  })
  const record = asRecord(raw)
  return mapUser(record.data ?? record.user ?? record)
}

export interface BulkStatusUpdateResult {
  usedIndividualFallback: boolean
  updatedUsers: User[]
  failures: Array<{ userId: string; error: unknown }>
}

export async function updateUsersStatus(userIds: string[], isActive: boolean): Promise<BulkStatusUpdateResult> {
  if (userIds.length === 0 || userIds.some((id) => !id.trim())) {
    throw new Error('Select at least one valid user.')
  }
  try {
    await request('/users/bulk-status', {
      method: 'PATCH',
      body: JSON.stringify({ userIds, isActive }),
    })
    return { usedIndividualFallback: false, updatedUsers: [], failures: [] }
  } catch (error) {
    if (!(error instanceof RouteNotFoundError)) throw error

    const status: AccountStatus = isActive ? 'active' : 'inactive'
    const results = await Promise.allSettled(
      userIds.map((id) => updateUserStatus(id, status)),
    )
    const authenticationFailure = results.find(
      (result) => result.status === 'rejected' && result.reason instanceof AuthenticationError,
    )
    if (authenticationFailure?.status === 'rejected') throw authenticationFailure.reason

    return {
      usedIndividualFallback: true,
      updatedUsers: results.flatMap((result) => result.status === 'fulfilled' ? [result.value] : []),
      failures: results.flatMap((result, index) =>
        result.status === 'rejected' ? [{ userId: userIds[index], error: result.reason }] : [],
      ),
    }
  }
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
