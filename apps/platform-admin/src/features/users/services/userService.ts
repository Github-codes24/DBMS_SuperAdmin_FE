import type {
  AccountStatus,
  AssignedProject,
  CreateUserInput,
  SelectOption,
  User,
  UserInput,
  UserListParams,
  UserListResult,
} from '../types/user.types'
import { userApi } from '../user.api'

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

function optionName(value: unknown): SelectOption {
  if (typeof value === 'string' || typeof value === 'number') {
    const name = String(value)
    return { id: name, name }
  }

  const option = asRecord(value)
  const id = option.id ?? option._id ?? option.projectId ?? option.value ?? option.projectName ?? option.name
  const name = option.name ?? option.projectName ?? option.label ?? option.title
  return {
    id: asString(id, 'an option identifier'),
    name: asString(name, 'an option name'),
  }
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

export async function listUsers(
  params: UserListParams,
  signal?: AbortSignal,
): Promise<UserListResult> {
  const raw = await userApi.listUsers(params, signal)
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

export async function listRoles(signal?: AbortSignal): Promise<SelectOption[]> {
  const raw = await userApi.listRoles(signal)
  return unwrapList(raw).items.map(optionName)
}

export async function listProjects(signal?: AbortSignal): Promise<SelectOption[]> {
  const raw = await userApi.listProjects(signal)
  return unwrapList(raw).items.map(optionName)
}

export async function getUser(id: string): Promise<User> {
  const raw = await userApi.getUser(id)
  const record = asRecord(raw)
  return mapUser(record.data ?? record.user ?? record)
}

export async function createUser(input: CreateUserInput): Promise<void> {
  await userApi.createUser(input)
}

export async function updateUser(id: string, input: UserInput): Promise<void> {
  await userApi.updateUser(id, input)
}

export async function updateUserStatus(id: string, status: AccountStatus): Promise<void> {
  await userApi.updateUserStatus(id, status)
}

export async function resetUserPassword(id: string, password: string): Promise<void> {
  await userApi.resetUserPassword(id, password)
}

export async function deleteUser(id: string): Promise<void> {
  await userApi.deleteUser(id)
}
