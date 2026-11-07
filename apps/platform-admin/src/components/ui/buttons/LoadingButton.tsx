import { forwardRef } from 'react'
import { Button, type ButtonProps } from './Button'

export interface LoadingButtonProps extends ButtonProps {
  isLoading: boolean
  loadingText?: string
}

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  function LoadingButton({ isLoading, loadingText = 'Processing...', children, ...props }, ref) {
    return (
      <Button ref={ref} isLoading={isLoading} loadingText={loadingText} {...props}>
        {children}
      </Button>
    )
  }
)

export default LoadingButton

