import { useState, useRef, useEffect } from 'react'
import { CheckCheck, Trash2, BellOff } from 'lucide-react'
import { type ToastType } from './ToastMessage'
import './notifications.css'

export interface NotificationItem {
  id: string
  type: ToastType
  title: string
  message: string
  timestamp: Date
  read: boolean
}

export interface NotificationPopupProps {
  isOpen: boolean
  onClose: () => void
  notifications: NotificationItem[]
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
  onClearAll: () => void
}

function formatRelativeTime(date: Date): string {
  const diffSec = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (diffSec < 60) return 'Just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour}h ago`
  const diffDay = Math.floor(diffHour / 24)
  return `${diffDay}d ago`
}

export function NotificationPopup({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
}: NotificationPopupProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const displayedNotifications = notifications.filter((item) =>
    filter === 'unread' ? !item.read : true
  )

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div ref={popupRef} className="app-notif-popup" role="menu">
      <div className="app-notif-header">
        <h4 className="app-notif-header-title">Notifications</h4>
        <div className="app-notif-header-actions">
          {unreadCount > 0 && (
            <button
              type="button"
              className="app-notif-link-btn"
              onClick={onMarkAllAsRead}
              title="Mark all as read"
            >
              <CheckCheck size={14} style={{ display: 'inline', marginRight: 3 }} />
              Read all
            </button>
          )}
          {notifications.length > 0 && (
            <button
              type="button"
              className="app-notif-link-btn"
              onClick={onClearAll}
              title="Clear all notifications"
              style={{ color: 'var(--color-slate-500)' }}
            >
              <Trash2 size={13} style={{ display: 'inline', marginRight: 3 }} />
              Clear
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '8px',
          padding: '6px 16px',
          borderBottom: '1px solid var(--color-slate-100)',
          fontSize: '11px',
        }}
      >
        <button
          type="button"
          onClick={() => setFilter('all')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
            fontWeight: filter === 'all' ? 600 : 400,
            color: filter === 'all' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            backgroundColor: filter === 'all' ? 'var(--color-primary-50)' : 'transparent',
          }}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('unread')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: '4px',
            fontWeight: filter === 'unread' ? 600 : 400,
            color: filter === 'unread' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            backgroundColor: filter === 'unread' ? 'var(--color-primary-50)' : 'transparent',
          }}
        >
          Unread ({unreadCount})
        </button>
      </div>

      <ul className="app-notif-list">
        {displayedNotifications.length === 0 ? (
          <li className="app-notif-empty">
            <BellOff size={28} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }} />
            <p style={{ margin: 0 }}>
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </p>
          </li>
        ) : (
          displayedNotifications.map((item) => (
            <li
              key={item.id}
              className={`app-notif-item ${!item.read ? 'app-notif-item--unread' : ''}`}
              onClick={() => onMarkAsRead(item.id)}
            >
              <div className="app-notif-item-body">
                <div className="app-notif-item-title">{item.title}</div>
                <div className="app-notif-item-desc">{item.message}</div>
                <div className="app-notif-item-time">
                  {formatRelativeTime(item.timestamp)}
                </div>
              </div>
              {!item.read && <span className="app-notif-dot" aria-label="Unread" />}
            </li>
          ))
        )}
      </ul>
    </div>
  )
}

export default NotificationPopup
