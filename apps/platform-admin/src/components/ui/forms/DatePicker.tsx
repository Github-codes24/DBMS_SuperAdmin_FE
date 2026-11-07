import { forwardRef } from 'react'
import { Calendar } from 'lucide-react'
import { TextInput, type TextInputProps } from './TextInput'

export interface DatePickerProps extends Omit<TextInputProps, 'type' | 'onChange'> {
  value?: string
  onChange?: (value: string) => void
  min?: string
  max?: string
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  function DatePicker(
    {
      value,
      onChange,
      min,
      max,
      leftIcon = <Calendar size={15} aria-hidden="true" />,
      ...props
    },
    ref
  ) {
    return (
      <TextInput
        ref={ref}
        type="date"
        value={value}
        min={min}
        max={max}
        leftIcon={leftIcon}
        onChange={(e) => onChange?.(e.target.value)}
        {...props}
      />
    )
  }
)

export default DatePicker

