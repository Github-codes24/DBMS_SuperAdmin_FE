import { Search, X } from 'lucide-react'
import type { ChangeEvent } from 'react'
import './dataDisplay.css'

export interface TableSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onClear?: () => void
  disabled?: boolean
  className?: string
  autoFocus?: boolean
}

export function TableSearch({
  value,
  onChange,
  placeholder = 'Search records...',
  onClear,
  disabled = false,
  className = '',
  autoFocus = false,
}: TableSearchProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handleClear = () => {
    onChange('')
    onClear?.()
  }

  return (
    <div className={`app-table-search ${className}`}>
      <Search size={15} className="app-table-search__icon" aria-hidden="true" />
      <input
        type="text"
        className="app-table-search__input"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        aria-label={placeholder}
      />
      {value && (
        <button
          type="button"
          className="app-table-search__clear"
          onClick={handleClear}
          aria-label="Clear search"
          disabled={disabled}
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}

