import { forwardRef } from 'react'
import { Button, type ButtonProps } from './Button'

export interface LoadingButtonProps extends Omit<ButtonProps, 'isLoading'> {
  isLoading?: boolean
  loading?: boolean
  loadingText?: string
}

export const LoadingButton = forwardRef<HTMLButtonElement, LoadingButtonProps>(
  function LoadingButton({ isLoading, loading, loadingText = 'Processing...', children, ...props }, ref) {
    const activeLoading = isLoading ?? loading ?? false
    return (
      <Button ref={ref} isLoading={activeLoading} loadingText={loadingText} {...props}>
        {children}
      </Button>
    )
  }
)

export default LoadingButton

