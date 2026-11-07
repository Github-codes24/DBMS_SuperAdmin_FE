import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Modal } from '../../components/overlays';
import { TextInput, Textarea, SelectDropdown } from '../../components/ui/forms';
import { PrimaryButton, SecondaryButton } from '../../components/ui/buttons';
import { AlertMessage } from '../../components/notifications';
import './createRoleModal.css';

function CreateRoleModal({ mode, roleOptions, roleId, initialTitle = '', initialDescription = '', onClose, onSubmit, }) {
    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);
    const [cloneFrom, setCloneFrom] = useState('');
    const [titleError, setTitleError] = useState('');
    const [requestError, setRequestError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event) {
        if (event) event.preventDefault();
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

    const cloneOptions = [
      { value: '', label: 'None (Start with no permissions)' },
      ...roleOptions.map((role) => ({ value: role.id, label: role.name })),
    ];

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
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            <SecondaryButton onClick={onClose} disabled={isSubmitting}>
              Cancel
            </SecondaryButton>
            <PrimaryButton
              type="submit"
              disabled={isSubmitting}
              isLoading={isSubmitting}
              loadingText="Saving..."
              onClick={handleSubmit}
            >
              {mode === 'create' ? 'Create Role' : 'Save Role'}
            </PrimaryButton>
          </div>
        }
      >
        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <TextInput
            label="Role Title"
            required
            autoFocus
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              if (event.target.value.trim()) setTitleError('');
            }}
            placeholder="e.g. Regional Supervisor"
            error={titleError}
          />

          <Textarea
            label="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Briefly describe the responsibilities of this role..."
            rows={3}
          />

          {mode === 'create' && (
            <SelectDropdown
              label="Clone Initial Permissions From"
              options={cloneOptions}
              value={cloneFrom}
              onChange={(event) => setCloneFrom(event.target.value)}
            />
          )}

          {requestError && (
            <AlertMessage variant="error" message={requestError} />
          )}
        </form>
      </Modal>
    );
}

export default CreateRoleModal;
