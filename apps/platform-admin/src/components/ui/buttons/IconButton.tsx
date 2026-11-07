import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import { type ButtonVariant, type ButtonSize } from './Button'
import './buttons.css'

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode
  'aria-label': string
  variant?: ButtonVariant
  size?: ButtonSize
  rounded?: boolean
  tooltip?: string
  isLoading?: boolean
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      icon,
      'aria-label': ariaLabel,
      variant = 'secondary',
      size = 'md',
      rounded = false,
      tooltip,
      isLoading = false,
      disabled,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) {
    const isDisabled = disabled || isLoading
    const iconSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16

    const classNames = [
      'app-btn',
      'app-btn-icon',
      `app-btn--${variant}`,
      `app-btn-icon--${size}`,
      rounded ? 'app-btn-icon--rounded' : '',
      isDisabled ? 'app-btn--disabled' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <button
        ref={ref}
        type={type}
        className={classNames}
        aria-label={ariaLabel}
        title={tooltip || ariaLabel}
        disabled={isDisabled}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading ? (
          <Loader2 size={iconSize} className="app-btn-spinner" aria-hidden="true" />
        ) : (
          icon
        )}
      </button>
    )
  }
)

export default IconButton
