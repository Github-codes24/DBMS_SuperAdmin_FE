import type { ReactNode } from 'react'
import Breadcrumbs, { type BreadcrumbItem } from './Breadcrumbs'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: ReactNode
  breadcrumbs?: boolean | BreadcrumbItem[]
  actions?: ReactNode
  children?: ReactNode
}

export function PageHeader({
  title,
  description,
  icon,
  breadcrumbs = false,
  actions,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col">
      {/* Optional Breadcrumbs */}
      {breadcrumbs && (
        <Breadcrumbs items={Array.isArray(breadcrumbs) ? breadcrumbs : undefined} />
      )}

      <header className="app-page-header">
        <div className="app-page-header-content">
          {icon && <div className="app-page-header-icon">{icon}</div>}
          <div className="app-page-header-text">
            <h1>{title}</h1>
            {description && <p>{description}</p>}
          </div>
        </div>

        {(actions || children) && (
          <div className="app-page-header-actions">
            {actions}
            {children}
          </div>
        )}
      </header>
    </div>
  )
}

export default PageHeader

