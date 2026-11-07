import { useLocation, Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[]
}

const ROUTE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  users: 'User Management',
  'project-management': 'Project Management',
  projects: 'Project Management',
  'roles-permissions': 'Roles & Permissions',
  'reports-analytics': 'Reports & Analytics',
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const location = useLocation()

  // Generate dynamic breadcrumbs if custom items are not passed
  const breadcrumbList: BreadcrumbItem[] = items ?? (() => {
    const segments = location.pathname.split('/').filter(Boolean)
    if (segments.length === 0) return [{ label: 'Dashboard' }]

    const list: BreadcrumbItem[] = [{ label: 'Workspace', href: '/users' }]
    let cumulative = ''

    segments.forEach((seg, index) => {
      cumulative += `/${seg}`
      const isLast = index === segments.length - 1
      const label = ROUTE_LABELS[seg] || seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ')
      list.push({
        label,
        href: isLast ? undefined : cumulative,
      })
    })

    return list
  })()

  return (
    <nav className="app-breadcrumbs" aria-label="Breadcrumb">
      <Link to="/users" className="app-breadcrumb-item" aria-label="Home">
        <Home size={13} aria-hidden="true" />
      </Link>
      <span className="app-breadcrumb-separator" aria-hidden="true">
        <ChevronRight size={12} />
      </span>

      {breadcrumbList.map((item, index) => {
        const isLast = index === breadcrumbList.length - 1
        return (
          <span key={`${item.label}-${index}`} className="inline-flex items-center gap-2">
            {item.href && !isLast ? (
              <Link to={item.href} className="app-breadcrumb-item">
                {item.label}
              </Link>
            ) : (
              <span className={`app-breadcrumb-item ${isLast ? 'app-breadcrumb-item--current' : ''}`}>
                {item.label}
              </span>
            )}
            {!isLast && (
              <span className="app-breadcrumb-separator" aria-hidden="true">
                <ChevronRight size={12} />
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}

export default Breadcrumbs

