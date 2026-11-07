import { useState, useRef, useEffect, type ReactNode, type MouseEvent } from 'react'
import './overlays.css'

export interface DropdownMenuItem {
  label: ReactNode
  icon?: ReactNode
  onClick?: () => void
  disabled?: boolean
  danger?: boolean
  divider?: boolean
}

export type DropdownPlacement =
  | 'bottom-start'
  | 'bottom-end'
  | 'top-start'
  | 'top-end'

export interface DropdownMenuProps {
  trigger: ReactNode
  items: DropdownMenuItem[]
  placement?: DropdownPlacement
  closeOnSelect?: boolean
  className?: string
}

export function DropdownMenu({
  trigger,
  items,
  placement = 'bottom-end',
  closeOnSelect = true,
  className = '',
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: globalThis.MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    function handleKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
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
  }, [isOpen])

  const getPositionStyles = (): React.CSSProperties => {
    const isTop = placement.startsWith('top')
    const isEnd = placement.endsWith('end')

    return {
      [isTop ? 'bottom' : 'top']: 'calc(100% + 4px)',
      [isEnd ? 'right' : 'left']: 0,
    }
  }

  const handleItemClick = (e: MouseEvent, item: DropdownMenuItem) => {
    e.stopPropagation()
    if (item.disabled) return
    item.onClick?.()
    if (closeOnSelect) {
      setIsOpen(false)
    }
  }

  return (
    <div ref={containerRef} className={`app-popover-anchor ${className}`}>
      <div
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={(e) => {
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
          className="app-popover-content"
          style={getPositionStyles()}
          role="menu"
        >
          <ul className="app-menu-dropdown">
            {items.map((item, index) => {
              if (item.divider) {
                return (
                  <li
                    key={`divider-${index}`}
                    className="app-menu-divider"
                    role="separator"
                  />
                )
              }

              return (
                <li key={`item-${index}`} role="none">
                  <button
                    type="button"
                    role="menuitem"
                    disabled={item.disabled}
                    onClick={(e) => handleItemClick(e, item)}
                    className={[
                      'app-menu-item',
                      item.danger ? 'app-menu-item--danger' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {item.icon && <span style={{ display: 'inline-flex', flexShrink: 0 }}>{item.icon}</span>}
                    <span>{item.label}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

export default DropdownMenu

