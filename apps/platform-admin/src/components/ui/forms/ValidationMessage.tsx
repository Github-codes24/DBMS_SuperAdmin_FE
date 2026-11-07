import type { HTMLAttributes, ReactNode } from 'react'
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import './forms.css'

export type ValidationMessageType = 'error' | 'warning' | 'success' | 'info'

export interface ValidationMessageProps extends HTMLAttributes<HTMLDivElement> {
  type?: ValidationMessageType
  message?: string
  children?: ReactNode
  icon?: ReactNode
}

export function ValidationMessage({
  type = 'error',
  message,
  children,
  icon,
  className = '',
  ...props
}: ValidationMessageProps) {
  const content = message || children
  if (!content) return null

  const renderIcon = () => {
    if (icon !== undefined) return icon
    switch (type) {
      case 'warning':
        return <AlertTriangle size={13} aria-hidden="true" />
      case 'success':
        return <CheckCircle2 size={13} aria-hidden="true" />
      case 'info':
        return <Info size={13} aria-hidden="true" />
      case 'error':
      default:
        return <AlertCircle size={13} aria-hidden="true" />
    }
  }

  return (
    <div
      className={`app-validation-msg app-validation-msg--${type} ${className}`}
      role={type === 'error' ? 'alert' : 'status'}
      {...props}
    >
      {renderIcon()}
      <span>{content}</span>
    </div>
  )
}

export default ValidationMessage
