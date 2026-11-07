import { ArrowRight } from 'lucide-react'
import { DatePicker } from './DatePicker'
import { FormField } from './FormField'
import './forms.css'

export interface DateRangePickerProps {
  fromDate: string
  toDate: string
  onRangeChange: (from: string, to: string) => void
  presets?: boolean
  label?: string
  error?: boolean | string
  hint?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getDaysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return formatDate(d)
}

function getThisMonthStart(): string {
  const d = new Date()
  return formatDate(new Date(d.getFullYear(), d.getMonth(), 1))
}

const PRESET_OPTIONS = [
  { label: 'Today', getRange: () => ({ from: getDaysAgo(0), to: getDaysAgo(0) }) },
  { label: 'Last 7 Days', getRange: () => ({ from: getDaysAgo(6), to: getDaysAgo(0) }) },
  { label: 'Last 30 Days', getRange: () => ({ from: getDaysAgo(29), to: getDaysAgo(0) }) },
  { label: 'This Month', getRange: () => ({ from: getThisMonthStart(), to: getDaysAgo(0) }) },
  { label: 'Last 3 Months', getRange: () => ({ from: getDaysAgo(89), to: getDaysAgo(0) }) },
]

export function DateRangePicker({
  fromDate,
  toDate,
  onRangeChange,
  presets = true,
  label,
  error,
  hint,
  required,
  disabled = false,
  className = '',
}: DateRangePickerProps) {
  const activePreset = PRESET_OPTIONS.find((preset) => {
    const range = preset.getRange()
    return range.from === fromDate && range.to === toDate
  })?.label ?? null

  const handlePresetClick = (preset: (typeof PRESET_OPTIONS)[0]) => {
    const { from, to } = preset.getRange()
    onRangeChange(from, to)
  }

  const rangeIsInvalid = Boolean(fromDate && toDate && fromDate > toDate)
  const validationError = rangeIsInvalid
    ? 'From date cannot be after To date'
    : typeof error === 'string'
      ? error
      : undefined

  const pickerElement = (
    <div className={`app-date-range-container ${className}`}>
      <div className="app-date-range-row">
        <DatePicker
          value={fromDate}
          max={toDate || undefined}
          disabled={disabled}
          placeholder="Start date"
          onChange={(val) => {
            onRangeChange(val, toDate)
          }}
          aria-label="Start date"
        />
        <ArrowRight size={16} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
        <DatePicker
          value={toDate}
          min={fromDate || undefined}
          disabled={disabled}
          placeholder="End date"
          onChange={(val) => {
            onRangeChange(fromDate, val)
          }}
          aria-label="End date"
        />
      </div>

      {presets && (
        <div className="app-date-range-presets" role="group" aria-label="Date range presets">
          {PRESET_OPTIONS.map((preset) => {
            const isActive = activePreset === preset.label
            return (
              <button
                key={preset.label}
                type="button"
                disabled={disabled}
                onClick={() => handlePresetClick(preset)}
                className={`app-preset-btn ${isActive ? 'app-preset-btn--active' : ''}`}
              >
                {preset.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )

  if (label || validationError || hint) {
    return (
      <FormField
        label={label}
        required={required}
        hint={hint}
        error={validationError}
      >
        {pickerElement}
      </FormField>
    )
  }

  return pickerElement
}

export default DateRangePicker
