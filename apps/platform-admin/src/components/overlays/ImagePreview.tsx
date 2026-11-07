import {
  useState,
  useEffect,
  useCallback,
  type MouseEvent,
  type KeyboardEvent,
} from 'react'
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  RotateCcw,
} from 'lucide-react'
import './overlays.css'

export interface ImagePreviewProps {
  src: string
  alt?: string
  isOpen: boolean
  onClose: () => void
  title?: string
  zoomable?: boolean
  downloadable?: boolean
}

export function ImagePreview({
  src,
  alt = 'Image preview',
  isOpen,
  onClose,
  title,
  zoomable = true,
  downloadable = true,
}: ImagePreviewProps) {
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)

  const handleClose = useCallback(() => {
    setScale(1)
    setRotation(0)
    onClose()
  }, [onClose])

  useEffect(() => {
    function handleKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleClose])

  if (!isOpen || !src) return null

  const handleZoomIn = (e: MouseEvent) => {
    e.stopPropagation()
    setScale((s) => Math.min(s + 0.25, 3))
  }

  const handleZoomOut = (e: MouseEvent) => {
    e.stopPropagation()
    setScale((s) => Math.max(s - 0.25, 0.5))
  }

  const handleRotate = (e: MouseEvent) => {
    e.stopPropagation()
    setRotation((r) => (r + 90) % 360)
  }

  const handleReset = (e: MouseEvent) => {
    e.stopPropagation()
    setScale(1)
    setRotation(0)
  }

  const handleDownload = (e: MouseEvent) => {
    e.stopPropagation()
    const a = document.createElement('a')
    a.href = src
    a.download = title || 'preview-image'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  return (
    <div
      className="app-lightbox-backdrop"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Image preview'}
    >
      {title && <div className="app-lightbox-title">{title}</div>}

      <div
        className="app-lightbox-toolbar"
        onClick={(e) => e.stopPropagation()}
      >
        {zoomable && (
          <>
            <button
              type="button"
              className="app-lightbox-btn"
              onClick={handleZoomIn}
              title="Zoom In"
              aria-label="Zoom in"
            >
              <ZoomIn size={18} />
            </button>
            <button
              type="button"
              className="app-lightbox-btn"
              onClick={handleZoomOut}
              title="Zoom Out"
              aria-label="Zoom out"
            >
              <ZoomOut size={18} />
            </button>
            <button
              type="button"
              className="app-lightbox-btn"
              onClick={handleReset}
              title="Reset Zoom"
              aria-label="Reset zoom"
            >
              <RotateCcw size={18} />
            </button>
          </>
        )}

        <button
          type="button"
          className="app-lightbox-btn"
          onClick={handleRotate}
          title="Rotate"
          aria-label="Rotate image"
        >
          <RotateCw size={18} />
        </button>

        {downloadable && (
          <button
            type="button"
            className="app-lightbox-btn"
            onClick={handleDownload}
            title="Download Image"
            aria-label="Download image"
          >
            <Download size={18} />
          </button>
        )}

        <button
          type="button"
          className="app-lightbox-btn"
          onClick={handleClose}
          title="Close (Esc)"
          aria-label="Close image preview"
          onKeyDown={(e: KeyboardEvent<HTMLButtonElement>) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              onClose()
            }
          }}
        >
          <X size={18} />
        </button>
      </div>

      <div className="app-lightbox-stage">
        <img
          src={src}
          alt={alt}
          className="app-lightbox-img"
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
          }}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  )
}

export default ImagePreview

