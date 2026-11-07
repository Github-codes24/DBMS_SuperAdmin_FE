import { useState } from 'react';
import { ChevronDown, ShieldCheck } from 'lucide-react';
import { Modal } from '../../components/overlays';
import './createRoleModal.css';
function CreateRoleModal({ mode, roleOptions, roleId, initialTitle = '', initialDescription = '', onClose, onSubmit, }) {
    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);
    const [cloneFrom, setCloneFrom] = useState('');
    const [titleError, setTitleError] = useState('');
    const [requestError, setRequestError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    async function handleSubmit(event) {
        event.preventDefault();
        if (!title.trim()) {
            setTitleError('Role title is required.');
            return;
        }
        if (roleOptions.some((role) => role.name.toLowerCase() === title.trim().toLowerCase() && (mode === 'create' || role.id !== roleId))) {
            setTitleError('A role with this title already exists.');
            return;
        }
        setIsSubmitting(true);
        setRequestError('');
        try {
            await onSubmit(title.trim(), description.trim(), cloneFrom);
            onClose();
        }
        catch (error) {
            setRequestError(error instanceof Error ? error.message : 'Could not create the role.');
        }
        finally {
            setIsSubmitting(false);
        }
    }
    return (
      <Modal
        isOpen={true}
        onClose={onClose}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={20} strokeWidth={2} aria-hidden="true" />
            <span>{mode === 'create' ? 'Create New Role' : 'Edit Role'}</span>
          </div>
        }
        size="md"
        closeOnEscape={!isSubmitting}
        closeOnBackdropClick={!isSubmitting}
      >
        <form onSubmit={handleSubmit} noValidate>
          <div className="create-role-fields">
            <label className="create-role-field">
              <span>Role Title <strong>*</strong></span>
              <input
                autoFocus
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  if (event.target.value.trim()) setTitleError('');
                }}
                placeholder="e.g. Regional Supervisor"
                aria-invalid={Boolean(titleError)}
                aria-describedby={titleError ? 'create-role-title-error' : undefined}
              />
              {titleError && (
                <span className="create-role-error" id="create-role-title-error">
                  {titleError}
                </span>
              )}
            </label>

            <label className="create-role-field">
              <span>Description</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Briefly describe the responsibilities of this role..."
              />
            </label>

            {mode === 'create' && (
              <label className="create-role-field">
                <span>Clone Initial Permissions From</span>
                <span className="create-role-select-wrap">
                  <select value={cloneFrom} onChange={(event) => setCloneFrom(event.target.value)}>
                    <option value="">None (Start with no permissions)</option>
                    {roleOptions.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} aria-hidden="true" />
                </span>
              </label>
            )}
          </div>

          {requestError && (
            <p className="create-role-error" role="alert">
              {requestError}
            </p>
          )}

          <footer className="create-role-footer">
            <button
              className="create-role-cancel"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button className="create-role-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Role' : 'Save Role'}
            </button>
          </footer>
        </form>
      </Modal>
    );
}
export default CreateRoleModal;
