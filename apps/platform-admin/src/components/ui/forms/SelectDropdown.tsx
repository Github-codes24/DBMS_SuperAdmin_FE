import { forwardRef, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { FormField } from './FormField'
import { type InputSize } from './TextInput'
import './forms.css'

export interface SelectOption {
  value: string | number
  label: string
  disabled?: boolean
}

export interface SelectDropdownProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  options: SelectOption[]
  placeholder?: string
  error?: boolean | string
  size?: InputSize
  label?: string
  hint?: string
}

export const SelectDropdown = forwardRef<HTMLSelectElement, SelectDropdownProps>(
  function SelectDropdown(
    {
      options,
      placeholder,
      error,
      size = 'md',
      label,
      hint,
      required,
      className = '',
      id,
      disabled,
      value,
      children,
      ...props
    },
    ref
  ) {
    const hasError = Boolean(error)
    const errorMessage = typeof error === 'string' ? error : undefined

    const selectElement = (
      <div className="app-select-wrapper">
        <select
          ref={ref}
          id={id}
          disabled={disabled}
          value={value}
          className={[
            'app-select',
            `app-input--${size}`,
            hasError ? 'app-input--error' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          aria-invalid={hasError || undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled hidden={required}>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
          {children}
        </select>
        <span className="app-select-chevron">
          <ChevronDown size={14} aria-hidden="true" />
        </span>
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
          {selectElement}
        </FormField>
      )
    }

    return selectElement
  }
)

export default SelectDropdown
