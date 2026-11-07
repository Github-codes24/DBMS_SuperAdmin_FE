import { forwardRef } from 'react'
import { Button, type ButtonProps } from './Button'

export type SecondaryButtonProps = Omit<ButtonProps, 'variant'>

export const SecondaryButton = forwardRef<HTMLButtonElement, SecondaryButtonProps>(
  function SecondaryButton(props, ref) {
    return <Button ref={ref} variant="secondary" {...props} />
  }
)

export default SecondaryButton
