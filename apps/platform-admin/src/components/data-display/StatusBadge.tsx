import type { CSSProperties, ReactNode } from 'react'
import './dataDisplay.css'

export type StatusBadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'primary'
  | 'secondary'
  | 'neutral'

export type StatusBadgeSize = 'sm' | 'md' | 'lg'

export interface StatusBadgeProps {
  status: string
  label?: ReactNode
  variant?: StatusBadgeVariant
  dot?: boolean
  size?: StatusBadgeSize
  className?: string
  style?: CSSProperties
}

/**
 * Automatically infers variant from common status strings when not explicitly provided
 */
function inferVariant(status: string): StatusBadgeVariant {
  const s = status.trim().toLowerCase()
  switch (s) {
    case 'active':
    case 'completed':
    case 'published':
    case 'success':
    case 'enabled':
    case 'approved':
    case 'online':
      return 'success'
    case 'inactive':
    case 'disabled':
    case 'archived':
    case 'closed':
    case 'offline':
      return 'secondary'
    case 'pending':
    case 'upcoming':
    case 'in progress':
    case 'in-progress':
    case 'review':
    case 'waiting':
      return 'warning'
    case 'error':
    case 'rejected':
    case 'failed':
    case 'blocked':
    case 'cancelled':
    case 'canceled':
      return 'danger'
    case 'on hold':
    case 'on-hold':
    case 'paused':
    case 'info':
      return 'info'
    case 'superadmin':
    case 'admin':
    case 'manager':
    case 'featured':
      return 'primary'
    default:
      return 'neutral'
  }
}

export function StatusBadge({
  status,
  label,
  variant,
  dot = true,
  size = 'md',
  className = '',
  style,
}: StatusBadgeProps) {
  const resolvedVariant = variant || inferVariant(status)

  return (
    <span
      className={`app-status-badge app-status-badge--${resolvedVariant} app-status-badge--${size} ${className}`}
      style={style}
    >
      {dot && <span className="app-status-badge__dot" aria-hidden="true" />}
      <span>{label !== undefined ? label : status}</span>
    </span>
  )
}
