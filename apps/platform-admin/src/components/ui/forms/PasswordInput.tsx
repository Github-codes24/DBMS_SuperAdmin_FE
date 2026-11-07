import { useState, forwardRef } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { TextInput, type TextInputProps } from './TextInput'

export interface PasswordInputProps extends Omit<TextInputProps, 'type'> {
  showToggle?: boolean
  showIcon?: boolean
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    {
      showToggle = true,
      showIcon = false,
      autoComplete = 'current-password',
      ...props
    },
    ref
  ) {
    const [showPassword, setShowPassword] = useState(false)

    const toggleButton = showToggle ? (
      <button
        type="button"
        className="app-input-icon-btn"
        onClick={() => setShowPassword((prev) => !prev)}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    ) : null

    return (
      <TextInput
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        autoComplete={autoComplete}
        leftIcon={showIcon ? <Lock size={15} /> : props.leftIcon}
        rightIcon={toggleButton}
        {...props}
      />
    )
  }
)

export default PasswordInput
