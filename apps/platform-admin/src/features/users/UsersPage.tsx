import { useMemo, useState, type FormEvent } from 'react'
import './users.css'

type UserStatus = 'Active' | 'Inactive'
type UserRole = 'Admin' | 'Telecaller'

interface UserRecord {
  id: string
  userId: string
  name: string
  email: string
  phone: string
  role: UserRole
  projects: string[]
  status: UserStatus
  createdAt: string
}

type UserFormValues = Pick<UserRecord, 'name' | 'email' | 'phone' | 'role' | 'projects'>

const PAGE_SIZE = 4
const PROJECT_OPTIONS = ['CRS', 'CRM', 'LTS', 'Real Estate', 'Edu - Merit', 'DBMS']

const initialUsers: UserRecord[] = [
  { id: 'demo-001', userId: 'ADM001', name: 'Aarav Mehta', email: 'aarav.mehta@example.com', phone: '+91 98765 43210', role: 'Admin', projects: ['Project North'], status: 'Active', createdAt: '2026-09-12' },
  { id: 'demo-002', userId: 'TC001', name: 'Ananya Sharma', email: 'ananya.sharma@example.com', phone: '+91 98765 12340', role: 'Telecaller', projects: ['Project North', 'Project East'], status: 'Active', createdAt: '2026-09-18' },
  { id: 'demo-003', userId: 'TC002', name: 'Kabir Rao', email: 'kabir.rao@example.com', phone: '+91 98765 67890', role: 'Telecaller', projects: [], status: 'Inactive', createdAt: '2026-09-22' },
  { id: 'demo-004', userId: 'ADM002', name: 'Diya Kapoor', email: 'diya.kapoor@example.com', phone: '+91 98765 24680', role: 'Admin', projects: ['Project West'], status: 'Active', createdAt: '2026-10-01' },
  { id: 'demo-005', userId: 'TC003', name: 'Ishaan Patel', email: 'ishaan.patel@example.com', phone: '+91 98765 13579', role: 'Telecaller', projects: ['Project East'], status: 'Active', createdAt: '2026-10-08' },
  { id: 'demo-006', userId: 'TC004', name: 'Mira Desai', email: 'mira.desai@example.com', phone: '+91 98765 97531', role: 'Telecaller', projects: ['Project South'], status: 'Inactive', createdAt: '2026-10-14' },
]

const emptyForm: UserFormValues = { name: '', email: '', phone: '', role: 'Telecaller', projects: [] }

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value))
}

function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
}

function UserManagementPage() {
  const [users, setUsers] = useState(initialUsers)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [form, setForm] = useState<UserFormValues>(emptyForm)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [viewingUser, setViewingUser] = useState<UserRecord | null>(null)
  const [formError, setFormError] = useState('')
  const [toast, setToast] = useState('')

  const filteredUsers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return users.filter((user) => {
      const matchesSearch =
        !normalizedSearch ||
        [user.userId, user.name, user.email, user.phone].some((value) =>
          value.toLowerCase().includes(normalizedSearch),
        )
      const matchesRole = roleFilter === 'All' || user.role === roleFilter
      const matchesStatus = statusFilter === 'All' || user.status === statusFilter
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [roleFilter, search, statusFilter, users])

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE))
  const pageUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function updateFilter(setter: (value: string) => void, value: string) {
    setter(value)
    setPage(1)
  }

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setFormError('')
    setIsFormOpen(true)
  }

  function openEdit(user: UserRecord) {
    setEditingId(user.id)
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      projects: [...user.projects],
    })
    setFormError('')
    setIsFormOpen(true)
  }

  function saveUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form.name.trim()) {
      setFormError('Full name is required.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setFormError('Enter a valid email address.')
      return
    }
    const assignedProjects = form.projects.map((project) => project.trim()).filter(Boolean)
    if (assignedProjects.length === 0) {
      setFormError('At least one assigned project is required.')
      return
    }

    if (editingId) {
      setUsers((current) =>
        current.map((user) => user.id === editingId
          ? { ...user, ...form, name: form.name.trim(), email: form.email.trim(), projects: assignedProjects }
          : user),
      )
      setToast('User updated successfully.')
    } else {
      const count = users.length + 1
      const userId = form.role === 'Admin'
        ? `ADM${String(users.filter((user) => user.role === 'Admin').length + 1).padStart(3, '0')}`
        : `TC${String(users.filter((user) => user.role === 'Telecaller').length + 1).padStart(3, '0')}`
      setUsers((current) => [{
        id: `demo-${Date.now()}-${count}`,
        userId,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role: form.role,
        projects: assignedProjects,
        status: 'Active',
        createdAt: new Date().toISOString(),
      }, ...current])
      setPage(1)
      setToast('User created successfully.')
    }
    setEditingId(null)
    setIsFormOpen(false)
  }

  function toggleStatus(user: UserRecord) {
    const nextStatus: UserStatus = user.status === 'Active' ? 'Inactive' : 'Active'
    if (!window.confirm(`${nextStatus === 'Inactive' ? 'Deactivate' : 'Activate'} ${user.name}?`)) return
    setUsers((current) => current.map((record) =>
      record.id === user.id ? { ...record, status: nextStatus } : record,
    ))
    setToast(`User ${nextStatus.toLowerCase()} successfully.`)
  }

  return (
    <div className="user-admin-shell">
      <header className="user-admin-navbar">
        <span className="user-admin-navbar-title">DBMS <strong>SUPER ADMIN</strong></span>
        <span className="user-admin-navbar-section">USER ACCESS</span>
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
            <a className="user-admin-nav-link user-admin-nav-link--active" href="/" aria-current="page"><span aria-hidden="true">♙</span> Users</a>
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
          <p className="page-description">Create and manage platform administrator and telecaller accounts.</p>
        </div>
        <button className="button button--primary create-button" type="button" onClick={openCreate}>
          <span aria-hidden="true">＋</span> Create Admin / Telecaller ID
        </button>
      </section>

      {toast && <div className="toast user-toast" role="status">{toast}</div>}

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
              <option value="Admin">Admin</option>
              <option value="Telecaller">Telecaller</option>
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
          <div><h2>Platform users</h2><span className="count-pill">{filteredUsers.length} users</span></div>
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
                  <td><span className={`role-badge role-badge--${user.role.toLowerCase()}`}><span className="role-glyph" aria-hidden="true">◈</span>{user.role}</span></td>
                  <td className="secondary-cell">{user.phone || '—'}</td>
                  <td className="project-cell">{user.projects.length ? user.projects.join(', ') : '—'}</td>
                  <td><span className={`status-badge status-badge--${user.status.toLowerCase()}`}><span className="status-dot" aria-hidden="true" />{user.status}</span></td>
                  <td className="secondary-cell date-cell">{formatDate(user.createdAt)}</td>
                  <td><div className="row-actions">
                    <button className="icon-button" type="button" title="View details" aria-label={`View ${user.name}`} onClick={() => setViewingUser(user)}>↗</button>
                    <button className="icon-button" type="button" title="Edit user" aria-label={`Edit ${user.name}`} onClick={() => openEdit(user)}>✎</button>
                    <button className={`icon-button ${user.status === 'Active' ? 'icon-button--danger' : 'icon-button--success'}`} type="button" title={user.status === 'Active' ? 'Deactivate user' : 'Activate user'} aria-label={`${user.status === 'Active' ? 'Deactivate' : 'Activate'} ${user.name}`} onClick={() => toggleStatus(user)}>{user.status === 'Active' ? '⊘' : '✓'}</button>
                  </div></td>
                </tr>
              ))}
              {pageUsers.length === 0 && <tr><td colSpan={9} className="user-no-results">No users match your search or filters.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span>Showing <strong>{filteredUsers.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, filteredUsers.length)}</strong> of <strong>{filteredUsers.length}</strong> users</span>
          <div className="pagination">
            <button className="page-button" type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>‹</button>
            <span>Page <strong>{page}</strong> of <strong>{pageCount}</strong></span>
            <button className="page-button" type="button" aria-label="Next page" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))}>›</button>
          </div>
        </div>
      </section>

      <footer className="user-page-footer">DBMS SUPER ADMIN <span>•</span> USER DIRECTORY <span>•</span> UI PREVIEW</footer>

      {isFormOpen && (
        <div className="modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setIsFormOpen(false)
        }}>
          <section className="modal-panel" role="dialog" aria-modal="true" aria-labelledby="user-form-title">
            <div className="modal-header">
              <div><p className="eyebrow">ACCESS CONTROL</p><h2 id="user-form-title">{editingId ? 'Edit user details' : 'Create user account'}</h2></div>
              <button type="button" className="modal-close" onClick={() => setIsFormOpen(false)} aria-label="Close">×</button>
            </div>
            <form className="user-form modal-body" onSubmit={saveUser} noValidate>
              <p className="form-demo-hint">This preview form updates only the sample data shown on this screen.</p>
              {formError && <div className="inline-alert inline-alert--error" role="alert">{formError}</div>}
              <label className="field"><span>Full name <span className="required-mark">*</span></span><input autoComplete="name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></label>
              <label className="field"><span>Email address <span className="required-mark">*</span></span><input type="email" autoComplete="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} /></label>
              <label className="field"><span>Phone number <span className="field-optional">Optional</span></span><input type="tel" autoComplete="tel" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} /></label>
              <label className="field"><span>Role <span className="required-mark">*</span></span><select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as UserRole }))}><option>Admin</option><option>Telecaller</option></select></label>
              <label className="field assigned-projects-field">
                <span>Assigned projects <span className="required-mark">*</span></span>
                <select
                  required
                  aria-required="true"
                  aria-invalid={formError === 'At least one assigned project is required.'}
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
                  <option value="">Select a project</option>
                  {PROJECT_OPTIONS.map((project) => (
                    <option key={project} value={project} disabled={form.projects.includes(project)}>
                      {project}{form.projects.includes(project) ? ' (assigned)' : ''}
                    </option>
                  ))}
                </select>
                {form.projects.length > 0 && (
                  <div className="selected-projects" aria-label="Selected projects">
                    {form.projects.map((project) => (
                      <span className="selected-project-chip" key={project}>
                        {project}
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
                    : 'Required. Select one or more projects.'}
                </span>
              </label>
              <div className="modal-actions"><button className="button button--secondary" type="button" onClick={() => setIsFormOpen(false)}>Cancel</button><button className="button button--primary" type="submit">{editingId ? 'Save changes' : 'Create user'}</button></div>
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
        </main>
        </div>
      </div>
    </div>
  )
}

export default UserManagementPage
