import { useLocation, Link } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { getCurrentUser } from '../../features/auth/authService'
import {
  type NavigationItem,
  DEFAULT_NAVIGATION_ITEMS,
} from './navigation'

export type { NavigationItem }

interface SidebarProps {
  items?: NavigationItem[]
  isOpen?: boolean
  onClose?: () => void
  onNavigate?: () => void
}

export function Sidebar({
  items = DEFAULT_NAVIGATION_ITEMS,
  isOpen = false,
  onClose,
  onNavigate,
}: SidebarProps) {
  const { pathname } = useLocation()
  const user = getCurrentUser()
  const userRole = (user?.role || 'superadmin').toLowerCase()

  // Filter navigation items by role if roles are specified
  const filteredItems = items.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true
    return item.roles.map((r) => r.toLowerCase()).includes(userRole)
  })

  const initials = user?.name
    ? user.name
        .split(/\s+/)
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : 'SA'

  const handleLinkClick = () => {
    if (onNavigate) onNavigate()
    if (onClose) onClose()
  }

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <button
          className="app-sidebar-backdrop"
          type="button"
          aria-label="Close navigation sidebar"
          onClick={onClose}
        />
      )}

      <aside className={`app-sidebar ${isOpen ? 'app-sidebar--open' : ''}`} aria-label="Sidebar navigation">
        <Link
          className="app-sidebar-brand"
          to="/users"
          aria-label="DBMS Admin Home"
          onClick={handleLinkClick}
        >
          <span className="app-navbar-brand-mark">
            <ShieldCheck size={16} strokeWidth={2.2} />
          </span>
          <span>
            DBMS <strong>ADMIN</strong>
          </span>
        </Link>

        <p className="app-sidebar-label">WORKSPACE</p>

        <nav className="app-sidebar-nav" aria-label="Main navigation">
          {filteredItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href ||
              (item.aliases && item.aliases.includes(pathname))

            return (
              <Link
                key={item.href}
                to={item.href}
                className={`app-sidebar-link ${isActive ? 'app-sidebar-link--active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={handleLinkClick}
              >
                <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} aria-hidden="true" />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="app-sidebar-link-badge">{item.badge}</span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="app-sidebar-footer">
          <div className="app-sidebar-profile">
            <span className="app-navbar-avatar">{initials}</span>
            <div className="app-sidebar-profile-info">
              <span className="app-sidebar-profile-name">
                {user?.name || 'Super Admin'}
              </span>
              <span className="app-sidebar-profile-role">
                {user?.role === 'superadmin' ? 'Platform Administrator' : user?.role || 'Administrator'}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar

