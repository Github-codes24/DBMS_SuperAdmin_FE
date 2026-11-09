import { useLocation, Link } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[]
}

const MODULE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  users: 'User Management',
  'project-management': 'Project Management',
  projects: 'Project Management',
  'roles-permissions': 'Roles & Permissions',
  'reports-analytics': 'Reports',
  reports: 'Reports',
  settings: 'Settings',
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const location = useLocation()

  // Generate standardized breadcrumbs matching the Project Management reference pattern
  const breadcrumbList: BreadcrumbItem[] = items ?? (() => {
    const segments = location.pathname.split('/').filter(Boolean)
    const rootSegment = segments[0]?.toLowerCase()

    const moduleLabel = rootSegment
      ? (MODULE_LABELS[rootSegment] || rootSegment.charAt(0).toUpperCase() + rootSegment.slice(1).replace(/-/g, ' '))
      : 'Dashboard'

    return [
      { label: 'Workspace', href: '/users' },
      { label: moduleLabel },
    ]
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
