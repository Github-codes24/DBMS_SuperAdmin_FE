import { clearAccessToken, getAccessToken } from '../auth/authService'
import { projectsApiBaseUrl } from '../../api'
import type { ManagedProject, ProjectStatus } from './projectData'

type ApiRecord = Record<string, unknown>

export class ProjectAuthenticationError extends Error {
  constructor() {
    super('Your session has expired. Please sign in again.')
    this.name = 'ProjectAuthenticationError'
  }
}

function asRecord(value: unknown): ApiRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('The projects API returned an invalid response.')
  }
  return value as ApiRecord
}

function asString(value: unknown, field: string): string {
  if (typeof value !== 'string' && typeof value !== 'number') {
    throw new Error(`The projects API response is missing ${field}.`)
  }
  return String(value)
}

function optionalString(value: unknown, field: string): string {
  if (value == null) return ''
  return asString(value, field)
}

function unwrapProjects(value: unknown): unknown[] {
  if (Array.isArray(value)) return value

  const response = asRecord(value)
  const data = response.data
  if (Array.isArray(data)) return data

  const nested = typeof data === 'object' && data !== null && !Array.isArray(data)
    ? asRecord(data)
    : {}
  const projects = nested.projects ?? nested.items ?? response.projects ?? response.items
  if (!Array.isArray(projects)) {
    throw new Error('The projects API returned an invalid list response.')
  }
  return projects
}

function normalizeStatus(value: unknown): ProjectStatus {
  const status = asString(value, 'a project status')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
  switch (status) {
    case 'active':
      return 'Active'
    case 'upcoming':
      return 'Upcoming'
    case 'completed':
      return 'Completed'
    case 'hold':
    case 'on_hold':
      return 'On Hold'
    default:
      throw new Error(`The projects API returned an unsupported project status: ${status}.`)
  }
}

function relatedId(value: unknown, field: string): string {
  if (value == null || value === '') return ''
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  const related = asRecord(value)
  return asString(related.id ?? related._id ?? related.projectAdminId, field)
}

function mapProject(value: unknown): ManagedProject {
  const record = asRecord(value)
  return {
    id: asString(record.id ?? record._id ?? record.projectId, 'a project identifier'),
    name: asString(record.name ?? record.projectName ?? record.title, 'a project name'),
    description: optionalString(record.description ?? record.projectDescription, 'a project description'),
    startDate: optionalString(record.startDate ?? record.start_date, 'a project start date').slice(0, 10),
    endDate: optionalString(record.endDate ?? record.end_date, 'a project end date').slice(0, 10),
    status: normalizeStatus(record.status ?? record.projectStatus),
    adminId: relatedId(
      record.adminId ?? record.projectAdminId ?? record.projectAdmin ?? record.assignedAdmin,
      'a project admin identifier',
    ),
  }
}

function projectPayload(project: Omit<ManagedProject, 'id'>): Record<string, string> {
  return {
    name: project.name,
    description: project.description,
    startDate: project.startDate,
    endDate: project.endDate,
    status: project.status.toLowerCase().replace(/\s+/g, '_'),
    adminId: project.adminId,
  }
}

async function request(path: string, init?: RequestInit): Promise<unknown> {
  const accessToken = getAccessToken()
  if (!accessToken) throw new ProjectAuthenticationError()

  const response = await fetch(`${projectsApiBaseUrl}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  })

  const responseText = await response.text()
  console.log('[projects API] raw response:', responseText)

  if (response.status === 401) {
    clearAccessToken()
    throw new ProjectAuthenticationError()
  }

  if (!response.ok) {
    let message = `Projects request failed (${response.status}).`
    if (responseText) {
      try {
        const body: unknown = JSON.parse(responseText)
        if (typeof body === 'object' && body !== null && !Array.isArray(body)) {
          const record = body as ApiRecord
          if (typeof record.message === 'string') message = record.message
          else if (typeof record.error === 'string') message = record.error
        } else if (typeof body === 'string') {
          message = body
        }
      } catch {
        message = responseText
      }
    } else if (response.statusText) {
      message = response.statusText
    }
    throw new Error(message)
  }

  if (!responseText) return undefined

  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json') && !contentType.includes('+json')) {
    return responseText
  }

  try {
    return JSON.parse(responseText) as unknown
  } catch {
    throw new Error('The projects API returned invalid JSON.')
  }
}

export async function listProjects(signal?: AbortSignal): Promise<ManagedProject[]> {
  const response = await request('/projects', { signal })
  return unwrapProjects(response).map(mapProject)
}

export async function createProject(project: Omit<ManagedProject, 'id'>): Promise<void> {
  await request('/projects', {
    method: 'POST',
    body: JSON.stringify(projectPayload(project)),
  })
}

export async function updateProject(id: string, project: Omit<ManagedProject, 'id'>): Promise<void> {
  await request(`/projects/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(projectPayload(project)),
  })
}

export async function deleteProject(id: string): Promise<void> {
  await request(`/projects/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
