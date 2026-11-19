export type AccountStatus = 'active' | 'inactive'

export interface User {
  id: string
  fullName: string
  email: string
  phoneNumber: string
  role: string
  assignedProjects: AssignedProject[]
  status: AccountStatus
  createdAt: string
  updatedAt?: string
  lastLoginAt?: string
  lastLoginIp?: string
  lastLoginDevice?: string
  activityHistory?: UserActivity[]
}

export interface AssignedProject {
  id: string
  name: string
  description?: string
  status?: string
  assignedAt?: string
}

export interface UserActivity {
  id: string
  action: string
  description?: string
  createdAt: string
  ipAddress?: string
  device?: string
  before?: unknown
  after?: unknown
}

export interface SelectOption {
  id: string
  name: string
}

export interface UserListResult {
  users: User[]
  total: number
  page: number
  pageSize: number
}

export interface UserListParams {
  page: number
  pageSize: number
  search: string
  role: string
  status: string
}

export interface UserInput {
  fullName: string
  email: string
  role: string
  assignedProjects: string[]
}

export interface CreateUserInput extends UserInput {
  password: string
}
