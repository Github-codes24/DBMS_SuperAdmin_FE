import {
  useEffect,
  useId,
  type ReactNode,
  type MouseEvent,
  type KeyboardEvent,
} from 'react'
import { X } from 'lucide-react'
import './overlays.css'

export type DrawerPlacement = 'right' | 'left' | 'top' | 'bottom'

export interface SideDrawerProps {
  isOpen: boolean
  onClose: () => void
  title?: ReactNode
  kicker?: string
  description?: ReactNode
  footer?: ReactNode
  placement?: DrawerPlacement
  width?: string | number
  height?: string | number
  closeOnBackdropClick?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  children: ReactNode
  className?: string
  bodyClassName?: string
}

export function SideDrawer({
  isOpen,
  onClose,
  title,
  kicker,
  description,
  footer,
  placement = 'right',
  width = 440,
  height,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  children,
  className = '',
  bodyClassName = '',
}: SideDrawerProps) {
  const generatedId = useId()
  const titleId = `drawer-title-${generatedId}`
  const descId = `drawer-desc-${generatedId}`

  useEffect(() => {
    function handleKeyDown(e: globalThis.KeyboardEvent) {
      if (closeOnEscape && e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, closeOnEscape, onClose])

  if (!isOpen) return null

  const handleBackdropMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose()
    }
  }

  const dimensionStyle: React.CSSProperties = {}
  if (placement === 'right' || placement === 'left') {
    dimensionStyle.width = typeof width === 'number' ? `${width}px` : width
  } else {
    dimensionStyle.height = height ? (typeof height === 'number' ? `${height}px` : height) : 'auto'
  }

  return (
    <>
      <div
        className="app-drawer-backdrop"
        onMouseDown={handleBackdropMouseDown}
        aria-hidden="true"
      />

      <aside
        className={`app-drawer app-drawer--${placement} ${className}`}
        style={dimensionStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
      >
        {(title || showCloseButton) && (
          <div className="app-drawer-header">
            <div className="app-modal-title-wrap">
              {kicker && <span className="app-modal-kicker">{kicker}</span>}
              {title && (
                <h3 id={titleId} className="app-modal-title">
                  {title}
                </h3>
              )}
              {description && (
                <p id={descId} className="app-modal-description">
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                className="app-modal-close-btn"
                onClick={onClose}
                aria-label="Close drawer"
                onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onClose()
                  }
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}

        <div className={`app-drawer-body ${bodyClassName}`}>{children}</div>

        {footer && <div className="app-drawer-footer">{footer}</div>}
      </aside>
    </>
  )
}

export default SideDrawer

