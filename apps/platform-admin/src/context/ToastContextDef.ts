import { createContext, type ReactNode } from 'react'
import {
  type ToastPosition,
} from '../components/notifications/ToastContainer'
import {
  type ToastType,
} from '../components/notifications/ToastMessage'
import {
  type ConfirmVariant,
} from '../components/notifications/ConfirmationDialog'
import { type NotificationItem } from '../components/notifications/NotificationPopup'

export interface ToastOptions {
  title?: string
  duration?: number
  dismissible?: boolean
}

export interface ConfirmOptions {
  title: string
  message: ReactNode
  confirmText?: string
  cancelText?: string
  confirmVariant?: ConfirmVariant
  icon?: ReactNode
}

export interface ToastItemInput {
  type?: ToastType
  title?: string
  message: string
  duration?: number
  dismissible?: boolean
}

export interface ToastFn {
  (options: ToastItemInput): string
  success: (message: string, options?: ToastOptions | string) => string
  error: (message: string, options?: ToastOptions | string) => string
  warning: (message: string, options?: ToastOptions | string) => string
  info: (message: string, options?: ToastOptions | string) => string
}

export interface ToastContextValue {
  toast: ToastFn
  dismissToast: (id: string) => void
  clearAllToasts: () => void
  confirm: (options: ConfirmOptions) => Promise<boolean>
  notifications: NotificationItem[]
  unreadCount: number
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export interface ToastProviderProps {
  children: ReactNode
  position?: ToastPosition
}

