import { useState, type ReactNode } from 'react'
import { Copy, Check } from 'lucide-react'
import './dataDisplay.css'

export interface DetailItem {
  label: ReactNode
  value: ReactNode
  icon?: ReactNode
  copyable?: boolean
  copyValue?: string
  fullWidth?: boolean
}

export interface DataDetailViewProps {
  items: DetailItem[]
  columns?: 1 | 2 | 3 | 4
  emptyText?: string
  className?: string
}

export function DataDetailView({
  items,
  columns = 2,
  emptyText = 'Not provided',
  className = '',
}: DataDetailViewProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch {
      // fallback
    }
  }

  return (
    <dl className={`app-detail-view app-detail-view--cols-${columns} ${className}`}>
      {items.map((item, idx) => {
        const isCopied = copiedIndex === idx
        const valueToCopy = item.copyValue || (typeof item.value === 'string' ? item.value : '')
        const displayValue = item.value !== null && item.value !== undefined && item.value !== '' ? item.value : emptyText

        return (
          <div
            key={idx}
            className={`app-detail-item ${item.fullWidth ? 'app-detail-item--full' : ''}`}
          >
            <dt className="app-detail-item__label">
              {item.icon && <span style={{ display: 'inline-flex', opacity: 0.85 }}>{item.icon}</span>}
              <span>{item.label}</span>
            </dt>
            <dd className="app-detail-item__value">
              <span>{displayValue}</span>
              {item.copyable && valueToCopy && (
                <button
                  type="button"
                  className="app-detail-item__copy-btn"
                  onClick={() => handleCopy(valueToCopy, idx)}
                  title={isCopied ? 'Copied!' : 'Copy to clipboard'}
                  aria-label={isCopied ? 'Copied' : `Copy ${item.label}`}
                >
                  {isCopied ? (
                    <Check size={13} color="#10b981" />
                  ) : (
                    <Copy size={13} />
                  )}
                </button>
              )}
            </dd>
          </div>
        )
      })}
    </dl>
  )
}
