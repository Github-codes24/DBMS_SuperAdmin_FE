import {
  useState,
  useRef,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'
import { UploadCloud, FileText, X } from 'lucide-react'
import { FormField } from './FormField'
import './forms.css'

export interface FileUploadProps {
  accept?: string
  maxSizeMB?: number
  value?: File | string | null
  onChange?: (file: File | null) => void
  onBase64Change?: (base64: string) => void
  label?: string
  hint?: string
  required?: boolean
  error?: boolean | string
  disabled?: boolean
  className?: string
  id?: string
}

export function FileUpload({
  accept = 'image/*',
  maxSizeMB = 5,
  value,
  onChange,
  onBase64Change,
  label,
  hint,
  required,
  error,
  disabled = false,
  className = '',
  id,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [internalError, setInternalError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const isImage = typeof value === 'string'
    ? value.startsWith('data:image') || value.startsWith('http') || value.endsWith('.png') || value.endsWith('.jpg') || value.endsWith('.webp')
    : value instanceof File && value.type.startsWith('image/')

  const fileName = value instanceof File ? value.name : typeof value === 'string' && value ? 'Uploaded file' : null
  const fileSize = value instanceof File ? `${(value.size / (1024 * 1024)).toFixed(2)} MB` : null

  const processFile = (file: File) => {
    setInternalError('')

    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
      setInternalError(`File size exceeds maximum limit of ${maxSizeMB}MB`)
      return
    }

    if (onChange) {
      onChange(file)
    }

    if (onBase64Change) {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onBase64Change(reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault()
    if (!disabled) setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return

    const file = e.dataTransfer.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleRemove = (e: MouseEvent) => {
    e.stopPropagation()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onChange?.(null)
    onBase64Change?.('')
  }

  const displayError = (typeof error === 'string' ? error : '') || internalError

  const uploadElement = (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        id={id}
        accept={accept}
        disabled={disabled}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <div
        className={[
          'app-file-upload',
          isDragging ? 'app-file-upload--active' : '',
          displayError ? 'app-file-upload--error' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={() => !disabled && fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e: KeyboardEvent) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            fileInputRef.current?.click()
          }
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <UploadCloud size={28} color="var(--color-primary)" />
          <div>
            <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
              Click to upload
            </span>{' '}
            <span style={{ color: 'var(--color-text-secondary)' }}>
              or drag and drop
            </span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            Max size: {maxSizeMB}MB {accept ? `(${accept})` : ''}
          </span>
        </div>
      </div>

      {value && (
        <div className="app-file-upload-preview">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            {isImage ? (
              <img
                src={typeof value === 'string' ? value : URL.createObjectURL(value)}
                alt="File preview"
                className="app-file-upload-thumb"
              />
            ) : (
              <FileText size={24} color="var(--color-slate-500)" />
            )}
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                {fileName}
              </div>
              {fileSize && (
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  {fileSize}
                </div>
              )}
            </div>
          </div>
          {!disabled && (
            <button
              type="button"
              className="app-input-icon-btn"
              onClick={handleRemove}
              aria-label="Remove uploaded file"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  )

  if (label || displayError || hint) {
    return (
      <FormField
        label={label}
        htmlFor={id}
        required={required}
        hint={hint}
        error={displayError}
      >
        {uploadElement}
      </FormField>
    )
  }

  return uploadElement
}

export default FileUpload
