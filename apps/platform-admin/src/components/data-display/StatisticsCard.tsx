import type { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import './dataDisplay.css'

export type StatCardTone =
  | 'orange'
  | 'green'
  | 'purple'
  | 'blue'
  | 'neutral'
  | 'danger'

export interface StatTrend {
  value: string | number
  label?: string
  direction?: 'up' | 'down' | 'neutral'
}

export interface StatisticsCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  tone?: StatCardTone
  trend?: StatTrend
  subtitle?: string
  loading?: boolean
  onClick?: () => void
  className?: string
}

export function StatisticsCard({
  title,
  value,
  icon,
  tone = 'orange',
  trend,
  subtitle,
  loading = false,
  onClick,
  className = '',
}: StatisticsCardProps) {
  const isClickable = Boolean(onClick)

  return (
    <article
      className={`app-stat-card app-stat-card--${tone} ${isClickable ? 'app-stat-card--clickable' : ''} ${className}`}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      <div className="app-stat-card__header">
        <p className="app-stat-card__label">{title}</p>
        {icon && <div className="app-stat-card__icon-wrap">{icon}</div>}
      </div>

      <div className="app-stat-card__body">
        {loading ? (
          <div
            style={{
              height: '32px',
              width: '50%',
              background: '#f1f5f9',
              borderRadius: '6px',
              marginBottom: '8px',
            }}
          />
        ) : (
          <h3 className="app-stat-card__value">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
        )}
      </div>

      {(trend || subtitle) && (
        <div className="app-stat-card__footer">
          {trend && (
            <span
              className={`app-stat-card__trend app-stat-card__trend--${trend.direction || 'up'}`}
            >
              {trend.direction === 'down' ? (
                <TrendingDown size={13} />
              ) : trend.direction === 'neutral' ? (
                <Minus size={13} />
              ) : (
                <TrendingUp size={13} />
              )}
              {trend.value}
            </span>
          )}
          <span>{trend?.label || subtitle}</span>
        </div>
      )}
    </article>
  )
}

