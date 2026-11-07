import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { FormField } from './FormField'
import './forms.css'

export type InputSize = 'sm' | 'md' | 'lg'

export interface TextInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize
  error?: boolean | string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  clearable?: boolean
  onClear?: () => void
  label?: string
  hint?: string
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  {
    size = 'md',
    error,
    leftIcon,
    rightIcon,
    clearable = false,
    onClear,
    label,
    hint,
    required,
    className = '',
    id,
    value,
    disabled,
    ...props
  },
  ref
) {
  const hasError = Boolean(error)
  const errorMessage = typeof error === 'string' ? error : undefined

  const inputElement = (
    <div className="app-input-wrapper">
      {leftIcon && <span className="app-input-left-icon">{leftIcon}</span>}
      <input
        ref={ref}
        id={id}
        disabled={disabled}
        value={value}
        className={[
          'app-input',
          `app-input--${size}`,
          leftIcon ? 'app-input-has-left-icon' : '',
          rightIcon || (clearable && value) ? 'app-input-has-right-icon' : '',
          hasError ? 'app-input--error' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-invalid={hasError || undefined}
        {...props}
      />
      {clearable && Boolean(value) && !disabled && (
        <span className="app-input-right-icon">
          <button
            type="button"
            className="app-input-icon-btn"
            onClick={onClear}
            aria-label="Clear input"
            tabIndex={-1}
          >
            <X size={14} />
          </button>
        </span>
      )}
      {!clearable && rightIcon && (
        <span className="app-input-right-icon">{rightIcon}</span>
      )}
    </div>
  )

  if (label || errorMessage || hint) {
    return (
      <FormField
        label={label}
        htmlFor={id}
        required={required}
        hint={hint}
        error={errorMessage}
      >
        {inputElement}
      </FormField>
    )
  }

  return inputElement
})

export default TextInput
