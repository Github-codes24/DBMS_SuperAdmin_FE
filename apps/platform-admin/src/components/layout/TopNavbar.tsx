import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, ShieldCheck } from 'lucide-react'
import AuthNavbarAction from '../AuthNavbarAction'
import { getCurrentUser } from '../../features/auth/authService'

interface TopNavbarProps {
  onMenuClick?: () => void
  sectionTitle?: string
  actions?: ReactNode
}

const SECTION_MAP: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/users': 'User Management',
  '/project-management': 'Project Management',
  '/projects': 'Project Management',
  '/roles-permissions': 'Roles & Permissions',
  '/reports-analytics': 'Reports & Analytics',
}

export function TopNavbar({ onMenuClick, sectionTitle, actions }: TopNavbarProps) {
  const location = useLocation()
  const user = getCurrentUser()
  const derivedTitle = sectionTitle || SECTION_MAP[location.pathname] || 'Workspace'

  // User initials
  const initials = user?.name
    ? user.name
        .split(/\s+/)
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'SA'

  return (
    <header className="app-navbar" role="banner">
      <div className="app-navbar-left">
        <button
          className="app-navbar-toggle"
          type="button"
          aria-label="Toggle navigation menu"
          onClick={onMenuClick}
        >
          <Menu size={20} />
        </button>

        <Link to="/users" className="app-navbar-brand" aria-label="DBMS Super Admin">
          <span className="app-navbar-brand-mark">
            <ShieldCheck size={18} strokeWidth={2.2} />
          </span>
          <span>
            DBMS <strong>SUPER ADMIN</strong>
          </span>
        </Link>

        {derivedTitle && (
          <span className="app-navbar-section-tag" aria-label="Current Section">
            {derivedTitle}
          </span>
        )}
      </div>

      <div className="app-navbar-right">
        {actions}

        <div className="app-navbar-profile" title={user?.email || 'superadmin'}>
          <span className="app-navbar-avatar">{initials}</span>
          <span className="app-navbar-profile-name">
            {user?.name || 'Super Admin'}
          </span>
        </div>

        <AuthNavbarAction />
      </div>
    </header>
  )
}

export default TopNavbar

