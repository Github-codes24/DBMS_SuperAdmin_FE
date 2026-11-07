import {
  useState,
  useCallback,
  useMemo,
} from 'react'
import {
  ToastContainer,
} from '../components/notifications/ToastContainer'
import {
  type ToastItem,
} from '../components/notifications/ToastMessage'
import {
  ConfirmationDialog,
} from '../components/notifications/ConfirmationDialog'
import { type NotificationItem } from '../components/notifications/NotificationPopup'
import {
  ToastContext,
  type ToastProviderProps,
  type ToastOptions,
  type ConfirmOptions,
  type ToastItemInput,
  type ToastFn,
} from './ToastContextDef'

function parseOptions(titleOrOptions?: ToastOptions | string): ToastOptions {
  if (typeof titleOrOptions === 'string') {
    return { title: titleOrOptions }
  }
  return titleOrOptions || {}
}

export function ToastProvider({
  children,
  position = 'top-right',
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  // Confirmation dialog state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean
    options: ConfirmOptions
    resolve: (value: boolean) => void
  }>({
    isOpen: false,
    options: { title: '', message: '' },
    resolve: () => {},
  })

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const clearAllToasts = useCallback(() => {
    setToasts([])
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const showToast = useCallback(
    ({
      type = 'info',
      title,
      message,
      duration,
      dismissible = true,
    }: ToastItemInput) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
      const newToast: ToastItem = {
        id,
        type,
        title,
        message,
        duration,
        dismissible,
      }

      setToasts((prev) => [...prev, newToast])

      // Also record in notification history
      const newNotif: NotificationItem = {
        id: `notif-${id}`,
        type,
        title: title || (type.charAt(0).toUpperCase() + type.slice(1)),
        message,
        timestamp: new Date(),
        read: false,
      }
      setNotifications((prev) => [newNotif, ...prev.slice(0, 49)])

      return id
    },
    []
  )

  const toast = useMemo<ToastFn>(() => {
    return Object.assign(
      (opts: ToastItemInput) => showToast(opts),
      {
        success: (message: string, opts?: ToastOptions | string) =>
          showToast({ type: 'success', message, ...parseOptions(opts) }),
        error: (message: string, opts?: ToastOptions | string) =>
          showToast({ type: 'error', message, ...parseOptions(opts) }),
        warning: (message: string, opts?: ToastOptions | string) =>
          showToast({ type: 'warning', message, ...parseOptions(opts) }),
        info: (message: string, opts?: ToastOptions | string) =>
          showToast({ type: 'info', message, ...parseOptions(opts) }),
      }
    )
  }, [showToast])

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      setConfirmState({
        isOpen: true,
        options,
        resolve,
      })
    })
  }, [])

  const handleConfirmAction = () => {
    confirmState.resolve(true)
    setConfirmState((prev) => ({ ...prev, isOpen: false }))
  }

  const handleCancelAction = () => {
    confirmState.resolve(false)
    setConfirmState((prev) => ({ ...prev, isOpen: false }))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <ToastContext.Provider
      value={{
        toast,
        dismissToast,
        clearAllToasts,
        confirm,
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}

      <ToastContainer
        toasts={toasts}
        onDismiss={dismissToast}
        position={position}
      />

      <ConfirmationDialog
        isOpen={confirmState.isOpen}
        title={confirmState.options.title}
        message={confirmState.options.message}
        confirmText={confirmState.options.confirmText}
        cancelText={confirmState.options.cancelText}
        confirmVariant={confirmState.options.confirmVariant}
        icon={confirmState.options.icon}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
      />
    </ToastContext.Provider>
  )
}

export default ToastProvider
