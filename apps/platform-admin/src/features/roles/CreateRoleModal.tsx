import { useEffect, useState, type FormEvent } from 'react'
import { ChevronDown, ShieldCheck, X } from 'lucide-react'
import './createRoleModal.css'

interface CreateRoleModalProps {
  onClose: () => void
  onCreate: (title: string) => boolean
}

function CreateRoleModal({ onClose, onCreate }: CreateRoleModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [cloneFrom, setCloneFrom] = useState('')
  const [titleError, setTitleError] = useState('')

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim()) {
      setTitleError('Role title is required.')
      return
    }

    if (!onCreate(title.trim())) {
      setTitleError('A role with this title already exists.')
      return
    }

    onClose()
  }

  return (
    <div
      className="create-role-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className="create-role-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-role-title"
      >
        <header className="create-role-header">
          <div className="create-role-heading">
            <ShieldCheck size={20} strokeWidth={2} aria-hidden="true" />
            <h2 id="create-role-title">Create New Role</h2>
          </div>
          <button className="create-role-close" type="button" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className="create-role-fields">
            <label className="create-role-field">
              <span>Role Title <strong>*</strong></span>
              <input
                autoFocus
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value)
                  if (event.target.value.trim()) setTitleError('')
                }}
                placeholder="e.g. Regional Supervisor"
                aria-invalid={Boolean(titleError)}
                aria-describedby={titleError ? 'create-role-title-error' : undefined}
              />
              {titleError && <span className="create-role-error" id="create-role-title-error">{titleError}</span>}
            </label>

            <label className="create-role-field">
              <span>Description</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Briefly describe the responsibilities of this role..."
              />
            </label>

            <label className="create-role-field">
              <span>Clone Initial Permissions From</span>
              <span className="create-role-select-wrap">
                <select value={cloneFrom} onChange={(event) => setCloneFrom(event.target.value)}>
                  <option value="">Select a role (optional)</option>
                  <option value="none">None (Start with no permissions)</option>
                  <option value="admin">Admin</option>
                  <option value="telecaller">Telecaller</option>
                  <option value="regional-supervisor">Regional Supervisor</option>
                </select>
                <ChevronDown size={16} aria-hidden="true" />
              </span>
            </label>
          </div>

          <footer className="create-role-footer">
            <button className="create-role-cancel" type="button" onClick={onClose}>Cancel</button>
            <button className="create-role-submit" type="submit">Create Role</button>
          </footer>
        </form>
      </section>
    </div>
  )
}

export default CreateRoleModal
