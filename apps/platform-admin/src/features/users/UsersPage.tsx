import { useEffect, useState, type FormEvent } from 'react'
import { BarChart3 } from 'lucide-react'
import './users.css'
import {
  createUser,
  deleteUser,
  getUser,
  listProjects,
  listUsers,
  resetUserPassword,
  updateUser,
  updateUserStatus,
} from './services/userService'
import type { SelectOption, User } from './types/user.types'

type UserStatus = 'Active' | 'Inactive'
const ROLE_OPTIONS = [
  'Admin',
  'Super Admin-LTS',
  'Super Admin-CRM',
  'Super Admin-CRS',
  'Super Admin-Real estate',
  'Super Admin-Edu-Merit',
  'Super Admin-Dbms',
] as const

const DEMO_PROJECT_OPTIONS: SelectOption[] = [
  'CRS',
  'CRM',
  'LTS',
  'Real Estate',
  'Edu - Merit',
  'DBMS',
].map((name) => ({ id: name, name }))

interface UserRecord {
  id: string
  userId: string
  name: string
  email: string
  phone: string
  role: string
  projects: string[]
  status: UserStatus
  createdAt: string
}

type UserFormValues = Pick<UserRecord, 'name' | 'email' | 'phone' | 'role'> & {
  password: string
  projects: string[]
}

const PAGE_SIZE = 10

const emptyForm: UserFormValues = { name: '', email: '', phone: '', password: '', role: ROLE_OPTIONS[0], projects: [] }

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'An unexpected error occurred.'
}

function fromApiUser(user: User, projectOptions: SelectOption[]): UserRecord {
  return {
    id: user.id,
    userId: user.id,
    name: user.fullName,
    email: user.email,
    phone: user.phoneNumber,
    role: ROLE_OPTIONS.find((role) => role.toLowerCase() === user.role.toLowerCase()) ?? user.role,
    projects: user.assignedProjects.map((project) =>
      projectOptions.find((option) => option.id === project.id)?.name ?? project.name,
    ),
    status: user.status === 'active' ? 'Active' : 'Inactive',
    createdAt: user.createdAt,
  }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value))
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

function UserManagementPage() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [projectOptions, setProjectOptions] = useState<SelectOption[]>(DEMO_PROJECT_OPTIONS)
  const [projectError, setProjectError] = useState('')
  const [form, setForm] = useState<UserFormValues>(emptyForm)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [viewingUser, setViewingUser] = useState<UserRecord | null>(null)
  const [passwordResetUser, setPasswordResetUser] = useState<UserRecord | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [passwordResetError, setPasswordResetError] = useState('')
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [formError, setFormError] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    listUsers({
      page,
      pageSize: PAGE_SIZE,
      search: search.trim(),
      role: roleFilter === 'All' ? '' : roleFilter,
      status: statusFilter === 'All' ? '' : statusFilter.toLowerCase(),
    }, controller.signal)
      .then((result) => {
        setUsers(result.users.map((user) => fromApiUser(user, projectOptions)))
        setTotalUsers(result.total)
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setLoadError(getErrorMessage(error))
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
    return () => controller.abort()
  }, [page, projectOptions, refreshKey, roleFilter, search, statusFilter])

  useEffect(() => {
    const controller = new AbortController()
    listProjects(controller.signal)
      .then((projects) => {
        if (projects.length > 0) setProjectOptions(projects)
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setProjectError(getErrorMessage(error))
      })
    return () => controller.abort()
  }, [])

  const pageCount = Math.max(1, Math.ceil(totalUsers / PAGE_SIZE))
  const pageUsers = users

  function updateFilter(setter: (value: string) => void, value: string) {
    setIsLoading(true)
    setLoadError('')
    setter(value)
    setPage(1)
    setToast('')
    setActionError('')
  }

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setFormError('')
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    setForm((current) => ({ ...current, password: '' }))
  }

  function openEdit(user: UserRecord) {
    setEditingId(user.id)
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      password: '',
      projects: user.projects.map((projectName) =>
        projectOptions.find((option) => option.name === projectName)?.id ?? projectName,
      ),
    })
    setFormError('')
    setIsFormOpen(true)
  }

  async function saveUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.name.trim()) {
      setFormError('Full name is required.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setFormError('Enter a valid email address.')
      return
    }
    if (!editingId && !form.password.trim()) {
      setFormError('Password is required.')
      return
    }
    const assignedProjects = form.projects.map((project) => project.trim()).filter(Boolean)
    if (assignedProjects.length === 0) {
      setFormError('At least one assigned project is required.')
      return
    }

    setIsSaving(true)
    setFormError('')
    try {
      const input = {
        fullName: form.name.trim(),
        email: form.email.trim(),
        phoneNumber: form.phone.trim(),
        role: form.role,
        assignedProjects,
      }
      if (editingId) {
        await updateUser(editingId, input)
        setToast('User updated successfully.')
      } else {
        await createUser({ ...input, password: form.password })
        setToast('User created successfully.')
      }
      setIsLoading(true)
      setLoadError('')
      setPage(1)
      setRefreshKey((current) => current + 1)
      setEditingId(null)
      setIsFormOpen(false)
    } catch (error) {
      setFormError(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  async function toggleStatus(user: UserRecord) {
    const nextStatus: UserStatus = user.status === 'Active' ? 'Inactive' : 'Active'
    if (!window.confirm(`${nextStatus === 'Inactive' ? 'Deactivate' : 'Activate'} ${user.name}?`)) return
    setActionError('')
    try {
      await updateUserStatus(user.id, nextStatus === 'Active' ? 'inactive' : 'active')
      setToast(`User ${nextStatus.toLowerCase()} successfully.`)
      setIsLoading(true)
      setLoadError('')
      setRefreshKey((current) => current + 1)
    } catch (error) {
      setActionError(getErrorMessage(error))
    }
  }

  async function openView(user: UserRecord) {
    setActionError('')
    try {
      const details = await getUser(user.id)
      setViewingUser(fromApiUser(details, projectOptions))
    } catch (error) {
      setActionError(getErrorMessage(error))
    }
  }

  async function submitPasswordReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!passwordResetUser || !newPassword.trim()) {
      setPasswordResetError('A new password is required.')
      return
    }

    setIsResettingPassword(true)
    setPasswordResetError('')
    try {
      await resetUserPassword(passwordResetUser.id, newPassword)
      setToast(`Password reset for ${passwordResetUser.name}.`)
      setPasswordResetUser(null)
      setNewPassword('')
    } catch (error) {
      setPasswordResetError(getErrorMessage(error))
    } finally {
      setIsResettingPassword(false)
    }
  }

  function closePasswordReset() {
    setPasswordResetUser(null)
    setNewPassword('')
    setPasswordResetError('')
  }

  async function removeUser(user: UserRecord) {
    if (!window.confirm(`Delete ${user.name}? This action cannot be undone.`)) return
    setActionError('')
    try {
      await deleteUser(user.id)
      setToast('User deleted successfully.')
      if (page > 1 && totalUsers - 1 <= (page - 1) * PAGE_SIZE) {
        setIsLoading(true)
        setLoadError('')
        setPage((current) => current - 1)
      } else {
        setIsLoading(true)
        setLoadError('')
        setRefreshKey((current) => current + 1)
      }
    } catch (error) {
      setActionError(getErrorMessage(error))
    }
  }

  return (
    <div className="user-admin-shell">
      <header className="user-admin-navbar">
        <span className="user-admin-navbar-title">DBMS <strong>SUPER ADMIN</strong></span>
        <span className="user-admin-navbar-section">USER MANAGEMENT</span>
        <span className="user-admin-navbar-user"><span aria-hidden="true" /> Super Admin</span>
      </header>
      <div className="user-admin-body">
        <aside className="user-admin-sidebar">
          <a className="user-admin-brand" href="/" aria-label="DBMS Super Admin">
            <span className="user-admin-brand-mark">D</span>
            <span>DBMS <strong>ADMIN</strong></span>
          </a>
          <p className="user-admin-nav-label">WORKSPACE</p>
          <nav className="user-admin-nav" aria-label="Main navigation">
            <a className="user-admin-nav-link" href="#dashboard"><span aria-hidden="true">▦</span> Dashboard</a>
            <a className="user-admin-nav-link user-admin-nav-link--active" href="/" aria-current="page"><span aria-hidden="true">♙</span> User Management</a>
            <a className="user-admin-nav-link" href="#role-permission"><span aria-hidden="true">♧</span> Role &amp; Permission</a>
            <a className="user-admin-nav-link" href="/reports-analytics"><span aria-hidden="true"><BarChart3 size={15} /></span> Reports &amp; Analytics</a>
          </nav>
          <div className="user-admin-sidebar-profile">
            <span className="user-admin-profile-avatar">SA</span>
            <span><strong>Super Admin</strong><small>Platform administrator</small></span>
          </div>
        </aside>

        <div className="user-admin-main">
        <main className="page-content user-management-page">
      <section className="page-heading user-page-heading">
        <div>
          <div className="user-heading-kicker"><span className="kicker-line" /> ACCESS CONTROL</div>
          <h1>User Management</h1>
          <p className="page-description">Create and manage platform super admin accounts.</p>
        </div>
        <button className="button button--primary create-button" type="button" onClick={openCreate}>
          <span aria-hidden="true">＋</span> Create Admin
        </button>
      </section>

      {toast && <div className="toast user-toast" role="status">{toast}</div>}
      {actionError && <div className="inline-alert inline-alert--error" role="alert">{actionError}</div>}
      {loadError && <div className="inline-alert inline-alert--error" role="alert">{loadError}</div>}

      <section className="users-card user-filter-card" aria-label="User search and filters">
        <label className="search-box user-search">
          <span className="search-icon" aria-hidden="true">⌕</span>
          <span className="visually-hidden">Search by ID, name, email, or phone</span>
          <input
            type="search"
            placeholder="Search by ID, name, email, phone..."
            value={search}
            onChange={(event) => updateFilter(setSearch, event.target.value)}
          />
          {search && <button className="clear-search" type="button" onClick={() => updateFilter(setSearch, '')} aria-label="Clear search">×</button>}
        </label>
        <div className="user-filters">
          <div className="filter-caption"><span className="filter-glyph" aria-hidden="true">☷</span> Filters</div>
          <label className="filter-select">
            <span className="visually-hidden">Filter by role</span>
            <select value={roleFilter} onChange={(event) => updateFilter(setRoleFilter, event.target.value)}>
              <option value="All">All roles</option>
              {ROLE_OPTIONS.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
          </label>
          <label className="filter-select">
            <span className="visually-hidden">Filter by status</span>
            <select value={statusFilter} onChange={(event) => updateFilter(setStatusFilter, event.target.value)}>
              <option value="All">All statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </label>
        </div>
      </section>

      <section className="users-card user-table-card" aria-label="Platform users">
        <div className="user-table-heading">
          <div><h2>Platform users</h2><span className="count-pill">{totalUsers} users</span></div>
          <span className="table-heading-caption">SUPER ADMIN DIRECTORY</span>
        </div>
        <div className="table-scroll">
          <table className="users-table user-management-table">
            <thead><tr>
              <th scope="col">USER ID</th>
              <th scope="col">USER</th>
              <th scope="col">EMAIL ADDRESS</th>
              <th scope="col">ROLE</th>
              <th scope="col">PHONE</th>
              <th scope="col">PROJECTS</th>
              <th scope="col">STATUS</th>
              <th scope="col">CREATED DATE</th>
              <th scope="col"><span className="visually-hidden">Actions</span></th>
            </tr></thead>
            <tbody>
              {pageUsers.map((user) => (
                <tr key={user.id}>
                  <td><span className="user-id-chip">{user.userId}</span></td>
                  <td><div className="user-cell">
                    <span className="user-avatar" aria-hidden="true">{initials(user.name)}</span>
                    <span className="user-identity"><strong>{user.name}</strong><span>Platform account</span></span>
                  </div></td>
                  <td><span className="user-email"><span className="email-glyph" aria-hidden="true">✉</span>{user.email}</span></td>
                  <td><span className="role-badge"><span className="role-glyph" aria-hidden="true">◈</span>{user.role}</span></td>
                  <td className="secondary-cell">{user.phone || '—'}</td>
                  <td className="project-cell">{user.projects.length ? user.projects.join(', ') : '—'}</td>
                  <td><span className={`status-badge status-badge--${user.status.toLowerCase()}`}><span className="status-dot" aria-hidden="true" />{user.status}</span></td>
                  <td className="secondary-cell date-cell">{formatDate(user.createdAt)}</td>
                  <td><div className="row-actions">
                    <button className="icon-button" type="button" title="View details" aria-label={`View ${user.name}`} onClick={() => void openView(user)}>↗</button>
                    <button className="icon-button" type="button" title="Edit user" aria-label={`Edit ${user.name}`} onClick={() => openEdit(user)}>✎</button>
                    <button className="icon-button" type="button" title="Reset password" aria-label={`Reset password for ${user.name}`} onClick={() => { setPasswordResetUser(user); setNewPassword(''); setPasswordResetError('') }}>↻</button>
                    <button className={`icon-button ${user.status === 'Active' ? 'icon-button--danger' : 'icon-button--success'}`} type="button" title={user.status === 'Active' ? 'Deactivate user' : 'Activate user'} aria-label={`${user.status === 'Active' ? 'Deactivate' : 'Activate'} ${user.name}`} onClick={() => toggleStatus(user)}>{user.status === 'Active' ? '⊘' : '✓'}</button>
                    <button className="icon-button icon-button--danger" type="button" title="Delete user" aria-label={`Delete ${user.name}`} onClick={() => removeUser(user)}>×</button>
                  </div></td>
                </tr>
              ))}
              {isLoading && <tr><td colSpan={9} className="user-no-results">Loading users...</td></tr>}
              {!isLoading && !loadError && pageUsers.length === 0 && <tr><td colSpan={9} className="user-no-results">No users match your search or filters.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span>Showing <strong>{totalUsers ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, totalUsers)}</strong> of <strong>{totalUsers}</strong> users</span>
          <div className="pagination">
            <button className="page-button" type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => { setIsLoading(true); setLoadError(''); setPage((current) => Math.max(1, current - 1)) }}>‹</button>
            <span>Page <strong>{page}</strong> of <strong>{pageCount}</strong></span>
            <button className="page-button" type="button" aria-label="Next page" disabled={page >= pageCount} onClick={() => { setIsLoading(true); setLoadError(''); setPage((current) => Math.min(pageCount, current + 1)) }}>›</button>
          </div>
        </div>
      </section>

      <footer className="user-page-footer">DBMS SUPER ADMIN <span>•</span> USER DIRECTORY</footer>

      {isFormOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeForm()
        }}>
          <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="user-form-title">
            <div className="modal-header">
              <div><p className="eyebrow">ACCESS CONTROL</p><h2 id="user-form-title">{editingId ? 'Edit user details' : 'Create user account'}</h2></div>
              <button type="button" className="modal-close" onClick={closeForm} aria-label="Close">×</button>
            </div>
            <form className="user-form modal-body" onSubmit={saveUser} noValidate>
              <p className="form-demo-hint">Changes are saved to the platform user directory.</p>
              {formError && <div className="inline-alert inline-alert--error" role="alert">{formError}</div>}
              <label className="field"><span>Full name <span className="required-mark">*</span></span><input autoComplete="name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></label>
              <label className="field"><span>Email address <span className="required-mark">*</span></span><input type="email" autoComplete="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} /></label>
              {!editingId && <label className="field"><span>Password <span className="required-mark">*</span></span><input type="password" autoComplete="new-password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} required /></label>}
              <label className="field"><span>Phone number <span className="field-optional">Optional</span></span><input type="tel" autoComplete="tel" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} /></label>
              <label className="field"><span>Role <span className="required-mark">*</span></span><select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}>{ROLE_OPTIONS.map((role) => <option key={role} value={role}>{role}</option>)}</select></label>
              <label className="field assigned-projects-field">
                <span>Assigned projects <span className="required-mark">*</span></span>
                <select
                  required
                  aria-required="true"
                  aria-invalid={formError === 'At least one assigned project is required.'}
                  disabled={projectOptions.length === 0}
                  value=""
                  onChange={(event) => {
                    const selectedProject = event.target.value
                    if (!selectedProject) return
                    setForm((current) => ({
                      ...current,
                      projects: current.projects.includes(selectedProject)
                        ? current.projects
                        : [...current.projects, selectedProject],
                    }))
                    if (formError === 'At least one assigned project is required.') setFormError('')
                  }}
                >
                  <option value="">{projectOptions.length ? 'Select a project' : 'Projects unavailable'}</option>
                  {projectOptions.map((project) => (
                    <option key={project.id} value={project.id} disabled={form.projects.includes(project.id)}>
                      {project.name}{form.projects.includes(project.id) ? ' (assigned)' : ''}
                    </option>
                  ))}
                </select>
                {form.projects.length > 0 && (
                  <div className="selected-projects" aria-label="Selected projects">
                    {form.projects.map((project) => (
                      <span className="selected-project-chip" key={project}>
                        {projectOptions.find((option) => option.id === project)?.name ?? project}
                        <button
                          type="button"
                          aria-label={`Remove ${project}`}
                          onClick={() => setForm((current) => ({
                            ...current,
                            projects: current.projects.filter((assigned) => assigned !== project),
                          }))}
                        >×</button>
                      </span>
                    ))}
                  </div>
                )}
                <span className={`field-hint ${formError === 'At least one assigned project is required.' ? 'field-error' : ''}`}>
                  {formError === 'At least one assigned project is required.'
                    ? formError
                    : projectError || 'Required. Select one or more projects.'}
                </span>
              </label>
              <div className="modal-actions"><button className="button button--secondary" type="button" onClick={closeForm}>Cancel</button><button className="button button--primary" type="submit" disabled={isSaving || projectOptions.length === 0}>{isSaving ? 'Saving...' : editingId ? 'Save changes' : 'Create user'}</button></div>
            </form>
          </section>
        </div>
      )}

      {viewingUser && (
        <div className="modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setViewingUser(null)
        }}>
          <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="user-detail-title">
            <div className="modal-header">
              <div><p className="eyebrow">USER PROFILE</p><h2 id="user-detail-title">{viewingUser.name}</h2></div>
              <button type="button" className="modal-close" onClick={() => setViewingUser(null)} aria-label="Close">×</button>
            </div>
            <div className="modal-body">
              <dl className="details-grid">
                <div><dt>User ID</dt><dd>{viewingUser.userId}</dd></div>
                <div><dt>Full name</dt><dd>{viewingUser.name}</dd></div>
                <div><dt>Email address</dt><dd>{viewingUser.email}</dd></div>
                <div><dt>Phone number</dt><dd>{viewingUser.phone || 'Not provided'}</dd></div>
                <div><dt>Role</dt><dd>{viewingUser.role}</dd></div>
                <div><dt>Account status</dt><dd>{viewingUser.status}</dd></div>
                <div><dt>Assigned projects</dt><dd>{viewingUser.projects.length ? viewingUser.projects.join(', ') : 'None'}</dd></div>
                <div><dt>Created date</dt><dd>{formatDate(viewingUser.createdAt)}</dd></div>
              </dl>
              <div className="modal-actions"><button className="button button--secondary" type="button" onClick={() => setViewingUser(null)}>Close</button></div>
            </div>
          </section>
        </div>
      )}

      {passwordResetUser && (
        <div className="modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closePasswordReset()
        }}>
          <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="password-reset-title">
            <div className="modal-header">
              <div><p className="eyebrow">ACCOUNT SECURITY</p><h2 id="password-reset-title">Reset password</h2></div>
              <button type="button" className="modal-close" onClick={closePasswordReset} aria-label="Close">×</button>
            </div>
            <form className="user-form modal-body" onSubmit={submitPasswordReset}>
              <p>Set a new password for {passwordResetUser.name}.</p>
              {passwordResetError && <div className="inline-alert inline-alert--error" role="alert">{passwordResetError}</div>}
              <label className="field"><span>New password <span className="required-mark">*</span></span><input type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /></label>
              <div className="modal-actions"><button className="button button--secondary" type="button" onClick={closePasswordReset}>Cancel</button><button className="button button--primary" type="submit" disabled={isResettingPassword}>{isResettingPassword ? 'Saving...' : 'Reset password'}</button></div>
            </form>
          </section>
        </div>
      )}
        </main>
        </div>
      </div>
    </div>
  )
}

export default UserManagementPage
