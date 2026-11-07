import type { ReactNode } from 'react'
import './dataDisplay.css'

export interface InformationCardProps {
  title: ReactNode
  subtitle?: ReactNode
  icon?: ReactNode
  badge?: ReactNode
  children: ReactNode
  footer?: ReactNode
  className?: string
  bodyClassName?: string
}

export function InformationCard({
  title,
  subtitle,
  icon,
  badge,
  children,
  footer,
  className = '',
  bodyClassName = '',
}: InformationCardProps) {
  return (
    <section className={`app-info-card ${className}`}>
      <div className="app-info-card__header">
        <div className="app-info-card__title-wrap">
          {icon && <span style={{ display: 'inline-flex', color: 'var(--color-primary, #f96321)' }}>{icon}</span>}
          <div>
            <h3 className="app-info-card__title">{title}</h3>
            {subtitle && <p className="app-info-card__subtitle">{subtitle}</p>}
          </div>
        </div>
        {badge && <div className="app-info-card__badge">{badge}</div>}
      </div>

      <div className={`app-info-card__body ${bodyClassName}`}>{children}</div>

      {footer && <div className="app-info-card__footer">{footer}</div>}
    </section>
  )
}

