import type { ButtonHTMLAttributes, MouseEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { Button, type ButtonSize, type ButtonVariant } from './Button'

export interface BackButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string
  fallbackUrl?: string
  variant?: ButtonVariant
  size?: ButtonSize
}

export function BackButton({
  label = 'Back',
  fallbackUrl,
  variant = 'ghost',
  size = 'sm',
  onClick,
  ...props
}: BackButtonProps) {
  const navigate = useNavigate()

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(event)
    } else {
      if (window.history.length > 1) {
        navigate(-1)
      } else if (fallbackUrl) {
        navigate(fallbackUrl)
      } else {
        navigate('/dashboard')
      }
    }
  }

  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16

  return (
    <Button
      variant={variant}
      size={size}
      leftIcon={<ChevronLeft size={iconSize} aria-hidden="true" />}
      onClick={handleClick}
      aria-label={label}
      {...props}
    >
      {label}
    </Button>
  )
}

export default BackButton
