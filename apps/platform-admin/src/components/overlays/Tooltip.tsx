import {
  useState,
  useRef,
  useId,
  type ReactNode,
} from 'react'
import './overlays.css'

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

export interface TooltipProps {
  content: ReactNode
  children: ReactNode
  placement?: TooltipPlacement
  delayMs?: number
  className?: string
}

export function Tooltip({
  content,
  children,
  placement = 'top',
  delayMs = 200,
  className = '',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const id = useId()

  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => {
      setIsVisible(true)
    }, delayMs)
  }

  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    setIsVisible(false)
  }

  if (!content) return <>{children}</>

  return (
    <div
      className={`app-tooltip-wrapper ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      aria-describedby={isVisible ? id : undefined}
    >
      {children}
      {isVisible && (
        <div
          id={id}
          className={`app-tooltip app-tooltip--${placement}`}
          role="tooltip"
        >
          {content}
        </div>
      )}
    </div>
  )
}

export default Tooltip

