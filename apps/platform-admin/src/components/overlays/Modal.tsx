import {
  useEffect,
  useId,
  type ReactNode,
  type MouseEvent,
  type KeyboardEvent,
} from 'react'
import { X } from 'lucide-react'
import './overlays.css'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: ReactNode
  kicker?: string
  description?: ReactNode
  footer?: ReactNode
  size?: ModalSize
  closeOnBackdropClick?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  children: ReactNode
  className?: string
  bodyClassName?: string
}

export function Modal({
  isOpen,
  onClose,
  title,
  kicker,
  description,
  footer,
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  children,
  className = '',
  bodyClassName = '',
}: ModalProps) {
  const generatedId = useId()
  const titleId = `modal-title-${generatedId}`
  const descId = `modal-desc-${generatedId}`

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

  return (
    <div
      className="app-overlay-backdrop"
      onMouseDown={handleBackdropMouseDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descId : undefined}
    >
      <div
        className={`app-modal app-modal--${size} ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="app-modal-header">
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
                aria-label="Close dialog"
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

        <div className={`app-modal-body ${bodyClassName}`}>{children}</div>

        {footer && <div className="app-modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

export default Modal

