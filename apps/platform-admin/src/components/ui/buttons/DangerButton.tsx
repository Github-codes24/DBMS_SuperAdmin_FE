import { forwardRef } from 'react'
import { Button, type ButtonProps } from './Button'

export interface DangerButtonProps extends Omit<ButtonProps, 'variant'> {
  outline?: boolean
}

export const DangerButton = forwardRef<HTMLButtonElement, DangerButtonProps>(
  function DangerButton({ outline = false, ...props }, ref) {
    return <Button ref={ref} variant={outline ? 'danger-outline' : 'danger'} {...props} />
  }
)

export default DangerButton

