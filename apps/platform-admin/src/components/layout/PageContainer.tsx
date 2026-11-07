import type { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
  variant?: 'boxed' | 'fluid'
  className?: string
}

export function PageContainer({
  children,
  variant = 'fluid',
  className = '',
}: PageContainerProps) {
  return (
    <div
      className={`app-page-container app-page-container--${variant} ${className}`}
    >
      {children}
    </div>
  )
}

export default PageContainer

