import {
  useState,
  useRef,
  useEffect,
  type ReactNode,
  type MouseEvent,
  type CSSProperties,
} from 'react'
import './overlays.css'

export type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right'
export type PopoverAlign = 'start' | 'center' | 'end'

export interface PopoverProps {
  trigger: ReactNode
  content: ReactNode
  isOpen?: boolean
  onOpenChange?: (open: boolean) => void
  placement?: PopoverPlacement
  align?: PopoverAlign
  closeOnClickOutside?: boolean
  closeOnEscape?: boolean
  className?: string
  contentClassName?: string
}

export function Popover({
  trigger,
  content,
  isOpen: controlledIsOpen,
  onOpenChange,
  placement = 'bottom',
  align = 'start',
  closeOnClickOutside = true,
  closeOnEscape = true,
  className = '',
  contentClassName = '',
}: PopoverProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isControlled = controlledIsOpen !== undefined
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen

  const containerRef = useRef<HTMLDivElement>(null)

  const setIsOpen = (next: boolean) => {
    if (!isControlled) {
      setInternalIsOpen(next)
    }
    onOpenChange?.(next)
  }

  useEffect(() => {
    function handleClickOutside(e: globalThis.MouseEvent) {
      if (
        closeOnClickOutside &&
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    function handleKeyDown(e: globalThis.KeyboardEvent) {
      if (closeOnEscape && e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, closeOnClickOutside, closeOnEscape])

  const getPositionStyles = (): CSSProperties => {
    const style: CSSProperties = {}

    if (placement === 'bottom') {
      style.top = 'calc(100% + 6px)'
      if (align === 'start') style.left = 0
      else if (align === 'end') style.right = 0
      else {
        style.left = '50%'
        style.transform = 'translateX(-50%)'
      }
    } else if (placement === 'top') {
      style.bottom = 'calc(100% + 6px)'
      if (align === 'start') style.left = 0
      else if (align === 'end') style.right = 0
      else {
        style.left = '50%'
        style.transform = 'translateX(-50%)'
      }
    } else if (placement === 'left') {
      style.right = 'calc(100% + 6px)'
      if (align === 'start') style.top = 0
      else if (align === 'end') style.bottom = 0
      else {
        style.top = '50%'
        style.transform = 'translateY(-50%)'
      }
    } else if (placement === 'right') {
      style.left = 'calc(100% + 6px)'
      if (align === 'start') style.top = 0
      else if (align === 'end') style.bottom = 0
      else {
        style.top = '50%'
        style.transform = 'translateY(-50%)'
      }
    }

    return style
  }

  return (
    <div ref={containerRef} className={`app-popover-anchor ${className}`}>
      <div
        role="button"
        tabIndex={0}
        onClick={(e: MouseEvent) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsOpen(!isOpen)
          }
        }}
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`app-popover-content ${contentClassName}`}
          style={getPositionStyles()}
          role="region"
        >
          {content}
        </div>
      )}
    </div>
  )
}

export default Popover

