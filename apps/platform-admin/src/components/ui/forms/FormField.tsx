import type { HTMLAttributes, ReactNode } from 'react'
import { ValidationMessage } from './ValidationMessage'
import './forms.css'

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  label?: ReactNode
  htmlFor?: string
  required?: boolean
  optional?: boolean
  hint?: string
  error?: string
  success?: string
  inline?: boolean
  children: ReactNode
}

export function FormField({
  label,
  htmlFor,
  required = false,
  optional = false,
  hint,
  error,
  success,
  inline = false,
  children,
  className = '',
  ...props
}: FormFieldProps) {
  return (
    <div
      className={`app-form-field ${inline ? 'app-form-field--inline' : ''} ${className}`}
      {...props}
    >
      {label && (
        <div className="app-form-label-row">
          <label htmlFor={htmlFor} className="app-form-label">
            {label}
            {required && (
              <span className="app-form-required" aria-hidden="true">
                *
              </span>
            )}
          </label>
          {optional && <span className="app-form-optional">(optional)</span>}
        </div>
      )}

      {children}

      {hint && !error && <p className="app-form-hint">{hint}</p>}

      {error ? (
        <ValidationMessage type="error" message={error} />
      ) : success ? (
        <ValidationMessage type="success" message={success} />
      ) : null}
    </div>
  )
}

export default FormField
