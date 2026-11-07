import { useEffect, type ReactNode } from 'react'
import { AlertTriangle, Trash2, HelpCircle } from 'lucide-react'
import { Button } from '../ui/buttons/Button'
import { SecondaryButton } from '../ui/buttons/SecondaryButton'
import './notifications.css'

export type ConfirmVariant = 'danger' | 'warning' | 'primary'

export interface ConfirmationDialogProps {
  isOpen: boolean
  title: string
  message: ReactNode
  confirmText?: string
  cancelText?: string
  confirmVariant?: ConfirmVariant
  isLoading?: boolean
  icon?: ReactNode
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

export function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger',
  isLoading = false,
  icon,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onCancel()
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
  }, [isOpen, isLoading, onCancel])

  if (!isOpen) return null

  const renderIconBadge = () => {
    if (icon) return icon

    switch (confirmVariant) {
      case 'danger':
        return (
          <div className="app-dialog-icon-badge app-dialog-icon-badge--danger">
            <Trash2 size={24} aria-hidden="true" />
          </div>
        )
      case 'warning':
        return (
          <div className="app-dialog-icon-badge app-dialog-icon-badge--warning">
            <AlertTriangle size={24} aria-hidden="true" />
          </div>
        )
      case 'primary':
      default:
        return (
          <div className="app-dialog-icon-badge app-dialog-icon-badge--primary">
            <HelpCircle size={24} aria-hidden="true" />
          </div>
        )
    }
  }

  const getButtonVariant = () => {
    if (confirmVariant === 'danger') return 'danger'
    return 'primary'
  }

  return (
    <div
      className="app-dialog-backdrop"
      onClick={() => {
        if (!isLoading) onCancel()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        className="app-dialog-card"
        onClick={(e) => e.stopPropagation()}
      >
        {renderIconBadge()}

        <h3 id="confirm-dialog-title" className="app-dialog-title">
          {title}
        </h3>

        <div className="app-dialog-message">{message}</div>

        <div className="app-dialog-actions">
          <SecondaryButton
            type="button"
            disabled={isLoading}
            onClick={onCancel}
          >
            {cancelText}
          </SecondaryButton>
          <Button
            type="button"
            variant={getButtonVariant()}
            isLoading={isLoading}
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationDialog

