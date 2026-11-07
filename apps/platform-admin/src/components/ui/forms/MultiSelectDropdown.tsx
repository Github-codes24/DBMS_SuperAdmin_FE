import {
  useState,
  useRef,
  useEffect,
  useId,
  type MouseEvent,
  type KeyboardEvent,
} from 'react'
import { ChevronDown, Search, X, Check } from 'lucide-react'
import { FormField } from './FormField'
import './forms.css'

export interface MultiSelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface MultiSelectDropdownProps {
  options: MultiSelectOption[]
  value: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  maxDisplay?: number
  error?: boolean | string
  label?: string
  required?: boolean
  hint?: string
  disabled?: boolean
  clearable?: boolean
  className?: string
  id?: string
}

export function MultiSelectDropdown({
  options,
  value = [],
  onChange,
  placeholder = 'Select options...',
  searchPlaceholder = 'Search...',
  maxDisplay = 2,
  error,
  label,
  required,
  hint,
  disabled = false,
  clearable = true,
  className = '',
  id: customId,
}: MultiSelectDropdownProps) {
  const generatedId = useId()
  const id = customId || generatedId

  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleClickOutside(event: globalThis.MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    } else {
      setSearchTerm('')
    }
  }, [isOpen])

  const selectedOptions = options.filter((opt) => value.includes(opt.value))

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleToggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue))
    } else {
      onChange([...value, optionValue])
    }
  }

  const handleRemove = (e: MouseEvent, optionValue: string) => {
    e.stopPropagation()
    onChange(value.filter((v) => v !== optionValue))
  }

  const handleClearAll = (e: MouseEvent) => {
    e.stopPropagation()
    onChange([])
  }

  const handleSelectAll = () => {
    const allEnabledValues = options
      .filter((opt) => !opt.disabled)
      .map((opt) => opt.value)
    onChange(allEnabledValues)
  }

  const hasError = Boolean(error)
  const errorMessage = typeof error === 'string' ? error : undefined

  const displayedTags = selectedOptions.slice(0, maxDisplay)
  const remainingCount = selectedOptions.length - maxDisplay

  const dropdownElement = (
    <div
      ref={containerRef}
      className={`app-dropdown-container ${className}`}
    >
      <div
        id={id}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        onKeyDown={(e: KeyboardEvent<HTMLDivElement>) => {
          if (disabled) return
          if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
            e.preventDefault()
            setIsOpen(true)
          }
        }}
        className={[
          'app-dropdown-trigger',
          isOpen ? 'app-dropdown-trigger--open' : '',
          hasError ? 'app-input--error' : '',
          disabled ? 'app-input:disabled' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="app-dropdown-tags">
          {selectedOptions.length === 0 ? (
            <span style={{ color: 'var(--color-text-subtle)' }}>
              {placeholder}
            </span>
          ) : (
            <>
              {displayedTags.map((opt) => (
                <span key={opt.value} className="app-dropdown-tag">
                  {opt.label}
                  {!disabled && (
                    <button
                      type="button"
                      className="app-dropdown-tag-remove"
                      onClick={(e) => handleRemove(e, opt.value)}
                      aria-label={`Remove ${opt.label}`}
                    >
                      <X size={11} />
                    </button>
                  )}
                </span>
              ))}
              {remainingCount > 0 && (
                <span className="app-dropdown-tag" style={{ fontWeight: 600 }}>
                  +{remainingCount} more
                </span>
              )}
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {clearable && selectedOptions.length > 0 && !disabled && (
            <button
              type="button"
              className="app-input-icon-btn"
              onClick={handleClearAll}
              aria-label="Clear all selections"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown
            size={14}
            style={{
              transition: 'transform 150ms ease',
              transform: isOpen ? 'rotate(180deg)' : 'none',
              color: 'var(--color-text-muted)',
            }}
          />
        </div>
      </div>

      {isOpen && !disabled && (
        <div className="app-dropdown-menu" role="listbox">
          <div className="app-dropdown-search-box">
            <div className="app-input-wrapper">
              <span className="app-input-left-icon">
                <Search size={14} />
              </span>
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="app-input app-input--sm app-input-has-left-icon"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: '6px',
                fontSize: '11px',
              }}
            >
              <button
                type="button"
                className="app-preset-btn"
                onClick={handleSelectAll}
              >
                Select All
              </button>
              <button
                type="button"
                className="app-preset-btn"
                onClick={handleClearAll}
              >
                Clear All
              </button>
            </div>
          </div>

          <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
            {filteredOptions.length === 0 ? (
              <div
                style={{
                  padding: '12px',
                  textAlign: 'center',
                  fontSize: '12px',
                  color: 'var(--color-text-muted)',
                }}
              >
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = value.includes(opt.value)
                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => !opt.disabled && handleToggle(opt.value)}
                    className={[
                      'app-dropdown-item',
                      isSelected ? 'app-dropdown-item--selected' : '',
                      opt.disabled ? 'app-dropdown-item--disabled' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <Check size={14} color="var(--color-primary)" />
                    )}
                  </div>
                )
              })
            )}
          </div>
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
        {dropdownElement}
      </FormField>
    )
  }

  return dropdownElement
}

export default MultiSelectDropdown
