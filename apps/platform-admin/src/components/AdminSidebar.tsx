import { BarChart3, BriefcaseBusiness, ShieldCheck, Users } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { Avatar } from './data-display'
import './adminSidebar.css'

const navigation = [
   { label: 'Dashboard', icon: ShieldCheck, href: '/dashboard' },
  { label: 'User Management', icon: Users, href: '/users' },
  { label: 'Project Management', icon: BriefcaseBusiness, href: '/project-management' },
  { label: 'Roles & Permissions', icon: ShieldCheck, href: '/roles-permissions' },
  { label: 'Reports & Analytics', icon: BarChart3, href: '/reports-analytics' },

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
      <Link className="admin-sidebar-brand" to="/users" aria-label="DBMS Super Admin" onClick={onNavigate}>
        <span className="admin-sidebar-brand-mark">D</span>
        <span>DBMS <strong>ADMIN</strong></span>
      </Link>
      <p className="admin-sidebar-label">WORKSPACE</p>
      <nav className="admin-sidebar-nav" aria-label="Main navigation">
        {navigation.map(({ label, icon: Icon, href }) => {
          const active = pathname === href || (label === 'Project Management' && pathname === '/projects')
          return (
            <Link
              className={`admin-sidebar-link${active ? ' admin-sidebar-link--active' : ''}`}
              to={href}
              key={label}
              aria-current={active ? 'page' : undefined}
              onClick={onNavigate}
            >
              <Icon size={17} strokeWidth={1.8} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>
      <div className="admin-sidebar-profile">
        <Avatar name="Super Admin" size="sm" />
        <span><strong>Super Admin</strong><small>Platform administrator</small></span>
      </div>
    </aside>
  )
}

export default AdminSidebar
