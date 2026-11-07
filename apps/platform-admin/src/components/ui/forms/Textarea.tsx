import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { FormField } from './FormField'
import './forms.css'

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean | string
  showCount?: boolean
  label?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    error,
    showCount = false,
    label,
    hint,
    required,
    className = '',
    id,
    value,
    maxLength,
    disabled,
    rows = 3,
    ...props
  },
  ref
) {
  const hasError = Boolean(error)
  const errorMessage = typeof error === 'string' ? error : undefined

  const currentLength = typeof value === 'string' ? value.length : 0

  const textareaElement = (
    <div style={{ width: '100%' }}>
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        maxLength={maxLength}
        disabled={disabled}
        value={value}
        className={[
          'app-textarea',
          hasError ? 'app-textarea--error' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-invalid={hasError || undefined}
        {...props}
      />
      {showCount && maxLength && (
        <div className="app-textarea-counter">
          {currentLength} / {maxLength}
        </div>
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
        {textareaElement}
      </FormField>
    )
  }

  return textareaElement
})

export default Textarea
