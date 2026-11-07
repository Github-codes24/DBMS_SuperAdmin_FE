import type { CSSProperties } from 'react'
import './feedback.css'

export type SkeletonVariant = 'text' | 'circular' | 'rounded' | 'rectangular'
export type SkeletonAnimation = 'pulse' | 'wave' | 'none'

export interface SkeletonLoaderProps {
  variant?: SkeletonVariant
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  animation?: SkeletonAnimation
  lines?: number
  className?: string
  style?: CSSProperties
}

export function SkeletonLoader({
  variant = 'text',
  width,
  height,
  borderRadius,
  animation = 'wave',
  lines = 1,
  className = '',
  style,
}: SkeletonLoaderProps) {
  const formatDimension = (val?: string | number): string | undefined => {
    if (val === undefined) return undefined
    return typeof val === 'number' ? `${val}px` : val
  }

  const baseStyle: CSSProperties = {
    ...style,
    width: formatDimension(width),
    height: formatDimension(height),
    borderRadius: formatDimension(borderRadius),
  }

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`app-skeleton-lines ${className}`}>
        {Array.from({ length: lines }).map((_, i) => {
          // Stagger the width of the last line for realistic paragraph appearance
          const isLast = i === lines - 1
          const lineWidth = isLast ? '75%' : '100%'

          return (
            <span
              key={i}
              className={`app-skeleton app-skeleton--text app-skeleton--${animation}`}
              style={{
                ...baseStyle,
                width: width !== undefined && isLast ? `calc(${formatDimension(width)} * 0.75)` : lineWidth,
              }}
              aria-hidden="true"
            />
          )
        })}
      </div>
    )
  }

  return (
    <span
      className={`app-skeleton app-skeleton--${variant} app-skeleton--${animation} ${className}`}
      style={baseStyle}
      aria-hidden="true"
    />
  )
}

