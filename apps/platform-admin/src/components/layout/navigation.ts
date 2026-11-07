import {
  BarChart3,
  BriefcaseBusiness,
  ShieldCheck,
  Users,
  LayoutDashboard,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export interface NavigationItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: string | number
  roles?: string[]
  aliases?: string[]
}

export const DEFAULT_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    roles: ['superadmin', 'admin', 'user'],
  },
  {
    label: 'User Management',
    icon: Users,
    href: '/users',
    roles: ['superadmin', 'admin'],
  },
  {
    label: 'Project Management',
    icon: BriefcaseBusiness,
    href: '/project-management',
    aliases: ['/projects'],
    roles: ['superadmin'],
  },
  {
    label: 'Roles & Permissions',
    icon: ShieldCheck,
    href: '/roles-permissions',
    roles: ['superadmin'],
  },
  {
    label: 'Reports & Analytics',
    icon: BarChart3,
    href: '/reports-analytics',
    aliases: ['/reports'],
    roles: ['superadmin', 'admin'],
  },
  {
    label: 'Settings',
    icon: Settings,
    href: '/settings',
    aliases: ['/settings/appearance'],
    roles: ['superadmin', 'admin', 'user'],
  },
]

