import { forwardRef } from 'react'
import { Button, type ButtonProps } from './Button'

export type PrimaryButtonProps = Omit<ButtonProps, 'variant'>

export const PrimaryButton = forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  function PrimaryButton(props, ref) {
    return <Button ref={ref} variant="primary" {...props} />
  }
)

export default PrimaryButton
