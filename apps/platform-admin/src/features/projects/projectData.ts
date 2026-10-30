export type ProjectStatus = 'Active' | 'Upcoming' | 'Completed' | 'On Hold'
export type ProjectAdminStatus = 'Active' | 'Inactive'

export interface ManagedProject {
  id: string
  name: string
  description: string
  startDate: string
  endDate: string
  status: ProjectStatus
  adminId: string
}

export interface ProjectAdmin {
  id: string
  name: string
  email: string
  phone: string
  username: string
  status: ProjectAdminStatus
  isActive?: boolean
  projectIds: string[]
}

export const projectStatuses: ProjectStatus[] = ['Active', 'Upcoming', 'Completed', 'On Hold']

export const initialProjectAdmins: ProjectAdmin[] = [
  {
    id: 'admin-1',
    name: 'Aarav Mehta',
    email: 'aarav.mehta@example.com',
    phone: '+91 98765 43210',
    username: 'aarav.mehta',
    status: 'Active',
    projectIds: ['project-1', 'project-3'],
  },
  {
    id: 'admin-2',
    name: 'Diya Sharma',
    email: 'diya.sharma@example.com',
    phone: '+91 98765 43211',
    username: 'diya.sharma',
    status: 'Active',
    projectIds: ['project-2'],
  },
  {
    id: 'admin-3',
    name: 'Kabir Patel',
    email: 'kabir.patel@example.com',
    phone: '+91 98765 43212',
    username: 'kabir.patel',
    status: 'Inactive',
    projectIds: ['project-4'],
  },
]

export const initialProjects: ManagedProject[] = [
  {
    id: 'project-1',
    name: 'Customer Relationship System',
    description: 'Centralized customer records, service workflows, and engagement insights.',
    startDate: '2026-01-15',
    endDate: '2026-12-20',
    status: 'Active',
    adminId: 'admin-1',
  },
  {
    id: 'project-2',
    name: 'Learning Management Suite',
    description: 'Learning content, enrollment, and academic progress management.',
    startDate: '2026-03-01',
    endDate: '2027-02-28',
    status: 'Active',
    adminId: 'admin-2',
  },
  {
    id: 'project-3',
    name: 'Real Estate Portal',
    description: 'Property listings and lead management for real estate partners.',
    startDate: '2026-11-10',
    endDate: '2027-06-30',
    status: 'Upcoming',
    adminId: 'admin-1',
  },
  {
    id: 'project-4',
    name: 'Vendor Onboarding',
    description: 'A streamlined workflow for vendor applications and approvals.',
    startDate: '2025-02-01',
    endDate: '2025-11-30',
    status: 'Completed',
    adminId: 'admin-3',
  },
  {
    id: 'project-5',
    name: 'Platform Modernization',
    description: 'Modernize platform services and improve operational reliability.',
    startDate: '2026-04-15',
    endDate: '2027-04-14',
    status: 'On Hold',
    adminId: '',
  },
]
