import { useState, type CSSProperties } from 'react'
import './dataDisplay.css'

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type AvatarShape = 'circle' | 'rounded' | 'square'
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy'

export interface AvatarProps {
  src?: string
  name?: string
  size?: AvatarSize
  shape?: AvatarShape
  status?: AvatarStatus
  theme?: string
  className?: string
  style?: CSSProperties
  onClick?: () => void
  alt?: string
}

function getInitials(name?: string): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function Avatar({
  src,
  name,
  size = 'md',
  shape = 'circle',
  status,
  theme,
  className = '',
  style,
  onClick,
  alt,
}: AvatarProps) {
  const [hasError, setHasError] = useState(false)
  const trimmedSrc = src?.trim()

  const avatarStyle: CSSProperties = {
    ...style,
    ...(theme ? { background: theme } : {}),
    ...(onClick ? { cursor: 'pointer' } : {}),
  }

  return (
    <div
      className={`app-avatar-wrap ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div
        className={`app-avatar app-avatar--${size} app-avatar--${shape}`}
        style={avatarStyle}
        title={name}
      >
        {trimmedSrc && !hasError ? (
          <img
            src={trimmedSrc}
            alt={alt || name || 'Avatar'}
            onError={() => setHasError(true)}
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>

      {status && (
        <span
          className={`app-avatar__status-dot app-avatar__status-dot--${status}`}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  )
}

