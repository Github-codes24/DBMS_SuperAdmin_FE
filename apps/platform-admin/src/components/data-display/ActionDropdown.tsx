import type { ReactNode } from 'react'
import { MoreVertical } from 'lucide-react'
import { DropdownMenu, type DropdownMenuItem, type DropdownPlacement } from '../overlays'
import './dataDisplay.css'

export interface ActionDropdownItem {
  label: ReactNode
  icon?: ReactNode
  onClick: () => void
  disabled?: boolean
  danger?: boolean
  divider?: boolean
}

export interface ActionDropdownProps {
  items: ActionDropdownItem[]
  trigger?: ReactNode
  placement?: DropdownPlacement
  className?: string
  ariaLabel?: string
}

export function ActionDropdown({
  items,
  trigger,
  placement = 'bottom-end',
  className = '',
  ariaLabel = 'Actions menu',
}: ActionDropdownProps) {
  const menuItems: DropdownMenuItem[] = items.map((item) => ({
    label: item.label,
    icon: item.icon,
    onClick: item.onClick,
    disabled: item.disabled,
    danger: item.danger,
    divider: item.divider,
  }))

  const defaultTrigger = (
    <button
      type="button"
      className="app-action-trigger-btn"
      aria-label={ariaLabel}
      title="More actions"
    >
      <MoreVertical size={16} />
    </button>
  )

  return (
    <DropdownMenu
      trigger={trigger || defaultTrigger}
      items={menuItems}
      placement={placement}
      className={className}
    />
  )
}

