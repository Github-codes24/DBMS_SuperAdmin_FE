import type { ReactNode } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'
import './dataDisplay.css'

export interface ExpandableTableRowProps {
  isExpanded: boolean
  onToggle: () => void
  colSpan: number
  expandedContent: ReactNode
  children: ReactNode
  className?: string
  showToggleButton?: boolean
}

export function ExpandableTableRow({
  isExpanded,
  onToggle,
  colSpan,
  expandedContent,
  children,
  className = '',
  showToggleButton = true,
}: ExpandableTableRowProps) {
  return (
    <>
      <tr className={`app-expandable-row ${isExpanded ? 'app-expandable-row--open' : ''} ${className}`}>
        {showToggleButton && (
          <td className="app-data-table__expand-cell">
            <button
              type="button"
              className="app-data-table__expand-btn"
              onClick={onToggle}
              aria-expanded={isExpanded}
              aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
            >
              {isExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
            </button>
          </td>
        )}
        {children}
      </tr>
      {isExpanded && (
        <tr className="app-expanded-detail-row">
          <td colSpan={colSpan + (showToggleButton ? 1 : 0)} className="app-expanded-row-content">
            {expandedContent}
          </td>
        </tr>
      )}
    </>
  )
}

