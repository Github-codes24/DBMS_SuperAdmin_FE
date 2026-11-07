import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import './buttons.css'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'danger-outline'
  | 'ghost'

export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  loadingText?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    children,
    className = '',
    variant = 'primary',
    size = 'md',
    isLoading = false,
    loadingText,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    type = 'button',
    ...props
  },
  ref
) {
  const isDisabled = disabled || isLoading

  const classNames = [
    'app-btn',
    `app-btn--${variant}`,
    `app-btn--${size}`,
    fullWidth ? 'app-btn--full' : '',
    isDisabled ? 'app-btn--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16

  return (
    <button
      ref={ref}
      type={type}
      className={classNames}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 size={iconSize} className="app-btn-spinner" aria-hidden="true" />
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="app-btn-icon-slot">{leftIcon}</span>}
          {children && <span>{children}</span>}
          {rightIcon && <span className="app-btn-icon-slot">{rightIcon}</span>}
        </>
      )}
    </button>
  )
})

export default Button
