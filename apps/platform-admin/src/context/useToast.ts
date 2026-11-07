import { useContext } from 'react'
import { ToastContext } from './ToastContextDef'

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function useConfirm() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useConfirm must be used within a ToastProvider')
  }
  return { confirm: context.confirm }
}
