import { BarChart3, LayoutDashboard, ShieldCheck, Users } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import './adminSidebar.css'

const navigation = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '#dashboard' },
  { label: 'User Management', icon: Users, href: '/users' },
  { label: 'Roles & Permissions', icon: ShieldCheck, href: '/roles-permissions' },
  { label: 'Reports', icon: BarChart3, href: '#reports' },
]

interface AdminSidebarProps {
  drawer?: boolean
  open?: boolean
  onNavigate?: () => void
}

function AdminSidebar({ drawer = false, open = false, onNavigate }: AdminSidebarProps) {
  const { pathname } = useLocation()

  return (
    <aside className={`admin-sidebar${drawer ? ' admin-sidebar--drawer' : ' admin-sidebar--compact'}${open ? ' admin-sidebar--open' : ''}`}>
      <a className="admin-sidebar-brand" href="/" aria-label="DBMS Super Admin">
        <span className="admin-sidebar-brand-mark">D</span>
        <span>DBMS <strong>ADMIN</strong></span>
      </a>
      <p className="admin-sidebar-label">WORKSPACE</p>
      <nav className="admin-sidebar-nav" aria-label="Main navigation">
        {navigation.map(({ label, icon: Icon, href }) => {
          const active = pathname === href
          const className = `admin-sidebar-link${active ? ' admin-sidebar-link--active' : ''}`

          return href.startsWith('/') ? (
            <Link
              className={className}
              to={href}
              key={label}
              aria-current={active ? 'page' : undefined}
              onClick={onNavigate}
            >
              <Icon size={17} strokeWidth={1.8} />
              <span>{label}</span>
            </Link>
          ) : (
            <a className={className} href={href} key={label} onClick={onNavigate}>
              <Icon size={17} strokeWidth={1.8} />
              <span>{label}</span>
            </a>
          )
        })}
      </nav>
      <div className="admin-sidebar-profile">
        <span className="admin-sidebar-avatar">SA</span>
        <span><strong>Super Admin</strong><small>Platform administrator</small></span>
      </div>
    </aside>
  )
}

export default AdminSidebar
