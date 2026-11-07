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

export interface SearchableOption {
  value: string | number
  label: string
  sublabel?: string
  disabled?: boolean
}

export interface SearchableDropdownProps {
  options: SearchableOption[]
  value?: string | number
  onChange: (value: string | number) => void
  placeholder?: string
  searchPlaceholder?: string
  error?: boolean | string
  label?: string
  required?: boolean
  hint?: string
  disabled?: boolean
  clearable?: boolean
  className?: string
  id?: string
}

export function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  searchPlaceholder = 'Search...',
  error,
  label,
  required,
  hint,
  disabled = false,
  clearable = true,
  className = '',
  id: customId,
}: SearchableDropdownProps) {
  const generatedId = useId()
  const id = customId || generatedId

  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (opt.sublabel && opt.sublabel.toLowerCase().includes(searchTerm.toLowerCase()))
  )

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

  const handleSelect = (option: SearchableOption) => {
    if (option.disabled) return
    onChange(option.value)
    setIsOpen(false)
  }

  const handleClear = (e: MouseEvent) => {
    e.stopPropagation()
    onChange('')
  }

  const hasError = Boolean(error)
  const errorMessage = typeof error === 'string' ? error : undefined

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
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: selectedOption
              ? 'var(--color-text-primary)'
              : 'var(--color-text-subtle)',
          }}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {clearable && selectedOption && !disabled && (
            <button
              type="button"
              className="app-input-icon-btn"
              onClick={handleClear}
              aria-label="Clear selection"
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
                const isSelected = opt.value === value
                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt)}
                    className={[
                      'app-dropdown-item',
                      isSelected ? 'app-dropdown-item--selected' : '',
                      opt.disabled ? 'app-dropdown-item--disabled' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <div>
                      <div>{opt.label}</div>
                      {opt.sublabel && (
                        <div
                          style={{
                            fontSize: '11px',
                            color: 'var(--color-text-muted)',
                          }}
                        >
                          {opt.sublabel}
                        </div>
                      )}
                    </div>
                    {isSelected && <Check size={14} color="var(--color-primary)" />}
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

export default SearchableDropdown
