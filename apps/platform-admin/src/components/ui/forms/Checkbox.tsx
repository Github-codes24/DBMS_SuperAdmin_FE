import {
  forwardRef,
  useEffect,
  useRef,
  type InputHTMLAttributes,
  type ReactNode,
  type RefObject,
} from 'react'
import { Check, Minus } from 'lucide-react'
import { ValidationMessage } from './ValidationMessage'
import './forms.css'

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode
  description?: string
  indeterminate?: boolean
  error?: boolean | string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    label,
    description,
    indeterminate = false,
    error,
    checked,
    disabled,
    className = '',
    id,
    ...props
  },
  forwardedRef
) {
  const innerRef = useRef<HTMLInputElement>(null)
  const ref = (forwardedRef || innerRef) as RefObject<HTMLInputElement | null>

  useEffect(() => {
    if (ref && 'current' in ref && ref.current) {
      ref.current.indeterminate = Boolean(indeterminate)
    }
  }, [ref, indeterminate])

  const hasError = Boolean(error)
  const errorMessage = typeof error === 'string' ? error : undefined

  return (
    <div className={`app-selection-wrapper ${className}`}>
      <label className="app-selection-control">
        <input
          ref={forwardedRef}
          type="checkbox"
          id={id}
          checked={checked}
          disabled={disabled}
          className={[
            'app-selection-input',
            'app-checkbox-input',
            hasError ? 'app-input--error' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
        {indeterminate ? (
          <Minus
            size={12}
            color="#fff"
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              transform: 'translate(3px, 5px)',
            }}
          />
        ) : checked ? (
          <Check
            size={12}
            color="#fff"
            strokeWidth={3}
            style={{
              position: 'absolute',
              pointerEvents: 'none',
              transform: 'translate(3px, 5px)',
            }}
          />
        ) : null}

        {(label || description) && (
          <span className="app-selection-text">
            {label && <span className="app-selection-label">{label}</span>}
            {description && (
              <span className="app-selection-desc">{description}</span>
            )}
          </span>
        )}
      </label>

      {errorMessage && <ValidationMessage type="error" message={errorMessage} />}
    </div>
  )
})

export default Checkbox
