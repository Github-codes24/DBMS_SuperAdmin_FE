import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { FormField } from './FormField'
import './forms.css'

export interface RadioButtonProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode
  description?: string
  error?: boolean | string
}

export const RadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(
  function RadioButton(
    {
      label,
      description,
      error,
      checked,
      disabled,
      className = '',
      id,
      ...props
    },
    ref
  ) {
    const hasError = Boolean(error)

    return (
      <label className={`app-selection-control ${className}`}>
        <input
          ref={ref}
          type="radio"
          id={id}
          checked={checked}
          disabled={disabled}
          className={[
            'app-selection-input',
            'app-radio-input',
            hasError ? 'app-input--error' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
        {(label || description) && (
          <span className="app-selection-text">
            {label && <span className="app-selection-label">{label}</span>}
            {description && (
              <span className="app-selection-desc">{description}</span>
            )}
          </span>
        )}
      </label>
    )
  }
)

export interface RadioGroupProps {
  label?: string
  required?: boolean
  error?: string
  hint?: string
  children: ReactNode
  className?: string
  direction?: 'row' | 'column'
}

export function RadioGroup({
  label,
  required,
  error,
  hint,
  children,
  className = '',
  direction = 'column',
}: RadioGroupProps) {
  return (
    <FormField label={label} required={required} error={error} hint={hint}>
      <div
        role="radiogroup"
        style={{
          display: 'flex',
          flexDirection: direction,
          gap: direction === 'row' ? '16px' : '10px',
        }}
        className={className}
      >
        {children}
      </div>
    </FormField>
  )
}

export default RadioButton
