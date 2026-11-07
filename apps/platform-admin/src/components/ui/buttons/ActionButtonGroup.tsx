import type { HTMLAttributes, ReactNode } from 'react'
import './buttons.css'

export type ActionGroupAlign = 'left' | 'center' | 'right' | 'between'

export interface ActionButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
  align?: ActionGroupAlign
  wrap?: boolean
  children: ReactNode
}

export function ActionButtonGroup({
  align = 'right',
  wrap = true,
  className = '',
  children,
  ...props
}: ActionButtonGroupProps) {
  const classNames = [
    'app-btn-group',
    `app-btn-group--${align}`,
    !wrap ? 'app-btn-group--nowrap' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classNames} role="group" {...props}>
      {children}
    </div>
  )
}

export default ActionButtonGroup
