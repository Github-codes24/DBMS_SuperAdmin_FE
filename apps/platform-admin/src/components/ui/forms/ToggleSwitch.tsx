import type { ReactNode, KeyboardEvent } from 'react'
import { ValidationMessage } from './ValidationMessage'
import './forms.css'

export interface ToggleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: ReactNode
  description?: string
  disabled?: boolean
  id?: string
  name?: string
  error?: boolean | string
  className?: string
}

export function ToggleSwitch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  id,
  name,
  error,
  className = '',
}: ToggleSwitchProps) {
  const handleClick = () => {
    if (!disabled) {
      onChange(!checked)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onChange(!checked)
    }
  }

  const hasError = Boolean(error)
  const errorMessage = typeof error === 'string' ? error : undefined

  return (
    <div className={className}>
      <div
        className={`app-switch-wrapper ${disabled ? 'app-switch--disabled' : ''}`}
        onClick={handleClick}
      >
        <button
          type="button"
          id={id}
          name={name}
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onKeyDown={handleKeyDown}
          className={[
            'app-switch',
            checked ? 'app-switch--checked' : '',
            disabled ? 'app-switch--disabled' : '',
            hasError ? 'app-input--error' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <span className="app-switch-thumb" />
        </button>

        {(label || description) && (
          <div className="app-selection-text">
            {label && <span className="app-selection-label">{label}</span>}
            {description && (
              <span className="app-selection-desc">{description}</span>
            )}
          </div>
        )}
      </div>

      {errorMessage && (
        <ValidationMessage type="error" message={errorMessage} />
      )}
    </div>
  )
}

export default ToggleSwitch
