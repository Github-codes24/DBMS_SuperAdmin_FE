import { SkeletonLoader } from './SkeletonLoader'
import './feedback.css'

export type CardSkeletonVariant = 'stat' | 'project' | 'standard'

export interface CardSkeletonProps {
  count?: number
  variant?: CardSkeletonVariant
  className?: string
}

export function CardSkeleton({
  count = 4,
  variant = 'stat',
  className = '',
}: CardSkeletonProps) {
  return (
    <div className={`app-card-skeleton-grid ${className}`}>
      {Array.from({ length: count }).map((_, idx) => {
        if (variant === 'stat') {
          return (
            <div key={idx} className="app-card-skeleton">
              <div className="app-card-skeleton__header">
                <SkeletonLoader variant="text" width="50%" height={14} />
                <SkeletonLoader variant="rounded" width={38} height={38} />
              </div>
              <SkeletonLoader variant="text" width="40%" height={32} />
              <SkeletonLoader variant="text" width="65%" height={12} />
            </div>
          )
        }

        if (variant === 'project') {
          return (
            <div key={idx} className="app-card-skeleton">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <SkeletonLoader variant="rounded" width={48} height={48} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <SkeletonLoader variant="text" width="70%" height={18} />
                  <SkeletonLoader variant="rounded" width={60} height={18} />
                </div>
              </div>
              <SkeletonLoader variant="text" lines={2} height={12} />
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px solid #f1f5f9' }}>
                <SkeletonLoader variant="text" width="30%" height={14} />
                <SkeletonLoader variant="rounded" width={80} height={28} />
              </div>
            </div>
          )
        }

        // Standard variant
        return (
          <div key={idx} className="app-card-skeleton">
            <SkeletonLoader variant="text" width="60%" height={20} />
            <SkeletonLoader variant="text" lines={3} height={14} />
            <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 10 }}>
              <SkeletonLoader variant="rounded" width="45%" height={32} />
              <SkeletonLoader variant="rounded" width="45%" height={32} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

