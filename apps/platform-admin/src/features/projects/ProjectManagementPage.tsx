import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import {
  ArrowDownUp,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CircleCheck,
  Clock3,
  Eye,
  FolderKanban,
  Mail,
  Menu,
  CalendarClock,
  PauseCircle,
  Pencil,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  UserRoundPlus,
  UsersRound,
  X,
} from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'
import {
  initialProjectAdmins,
  initialProjects,
  projectStatuses,
  type ManagedProject,
  type ProjectAdmin,
  type ProjectAdminStatus,
  type ProjectStatus,
} from './projectData'
import './projectManagement.css'
import { getFromStorage, saveToStorage } from '../../utils/storage'

type ProjectForm = Omit<ManagedProject, 'id'>
type ProjectAdminForm = Omit<ProjectAdmin, 'id'>
type SortField = 'name' | 'startDate'

const PROJECT_DATA_STORAGE_KEY = 'platform-admin.project-management'

interface ProjectManagementData {
  projects: ManagedProject[]
  admins: ProjectAdmin[]
}

const initialProjectData: ProjectManagementData = {
  projects: initialProjects,
  admins: initialProjectAdmins,
}

const emptyProjectForm: ProjectForm = {
  name: '',
  description: '',
  startDate: '',
  endDate: '',
  status: 'Upcoming',
  adminId: '',
}

const emptyAdminForm: ProjectAdminForm = {
  name: '',
  email: '',
  phone: '',
  username: '',
  status: 'Active',
  projectIds: [],
}

function formatDate(value: string) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T12:00:00`))
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] ?? '').join('').toUpperCase()
}

function isProjectAdminActive(admin: ProjectAdmin) {
  return admin.status.toLowerCase() === 'active' || admin.isActive === true
}

function ProjectManagementPage() {
  const [initialData] = useState(() => {
    try {
      return { data: getFromStorage(PROJECT_DATA_STORAGE_KEY, initialProjectData), error: '' }
    } catch (error) {
      return {
        data: initialProjectData,
        error: error instanceof Error ? error.message : 'Could not load saved project data.',
      }
    }
  })
  const [projects, setProjects] = useState(initialData.data.projects)
  const [admins, setAdmins] = useState(initialData.data.admins)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | ProjectStatus>('All')
  const [sortField, setSortField] = useState<SortField>('name')
  const [sortAscending, setSortAscending] = useState(true)
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [adminModalOpen, setAdminModalOpen] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null)
  const [projectForm, setProjectForm] = useState<ProjectForm>(emptyProjectForm)
  const [adminForm, setAdminForm] = useState<ProjectAdminForm>(emptyAdminForm)
  const [projectError, setProjectError] = useState('')
  const [adminError, setAdminError] = useState('')
  const [notice, setNotice] = useState(initialData.error)
  const [viewProject, setViewProject] = useState<ManagedProject | null>(null)
  const [viewAdmin, setViewAdmin] = useState<ProjectAdmin | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    function syncSavedData(event: StorageEvent) {
      if (event.key !== PROJECT_DATA_STORAGE_KEY) return
      try {
        const savedData = getFromStorage(PROJECT_DATA_STORAGE_KEY, initialProjectData)
        setProjects(savedData.projects)
        setAdmins(savedData.admins)
        setNotice('')
      } catch (error) {
        setNotice(error instanceof Error ? error.message : 'Could not load saved project data.')
      }
    }

    window.addEventListener('storage', syncSavedData)
    return () => window.removeEventListener('storage', syncSavedData)
  }, [])

  function persistProjectData(nextProjects: ManagedProject[], nextAdmins: ProjectAdmin[]) {
    try {
      saveToStorage(PROJECT_DATA_STORAGE_KEY, { projects: nextProjects, admins: nextAdmins })
      setProjects(nextProjects)
      setAdmins(nextAdmins)
      return true
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not save project data.')
      return false
    }
  }

  const visibleProjects = useMemo(() => {
    const query = search.trim().toLowerCase()
    return projects
      .filter((project) => statusFilter === 'All' || project.status === statusFilter)
      .filter((project) => !query || project.name.toLowerCase().includes(query))
      .sort((left, right) => {
        const comparison = left[sortField].localeCompare(right[sortField])
        return sortAscending ? comparison : -comparison
      })
  }, [projects, search, sortAscending, sortField, statusFilter])

  const counts = {
    totalProjects: projects.length,
    activeProjects: projects.filter((project) => project.status === 'Active').length,
    completedProjects: projects.filter((project) => project.status === 'Completed').length,
    holdProjects: projects.filter((project) => {
      const status = project.status.trim().toLowerCase().replace(/[\s-]+/g, '_')
      return status === 'hold' || status === 'on_hold'
    }).length,
    upcomingProjects: projects.filter((project) => project.status.trim().toLowerCase() === 'upcoming').length,
    totalAdmins: admins.length,
  }

  function projectName(projectId: string) {
    return projects.find((project) => project.id === projectId)?.name
  }

  function assignedAdmin(adminId: string) {
    return admins.find((admin) => admin.id === adminId)
  }

  function openAddProject() {
    setEditingProjectId(null)
    setProjectForm(emptyProjectForm)
    setProjectError('')
    setProjectModalOpen(true)
  }

  function openEditProject(project: ManagedProject) {
    const { id, ...values } = project
    setEditingProjectId(id)
    setProjectForm(values)
    setProjectError('')
    setProjectModalOpen(true)
  }

  function saveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = projectForm.name.trim()
    if (!name) {
      setProjectError('Project name is required.')
      return
    }
    if (projectForm.startDate && projectForm.endDate && projectForm.endDate < projectForm.startDate) {
      setProjectError('End date cannot be earlier than start date.')
      return
    }

    const projectId = editingProjectId ?? `project-${Date.now()}`
    const nextProject: ManagedProject = { ...projectForm, id: projectId, name }
    const nextProjects = editingProjectId
      ? projects.map((project) => project.id === editingProjectId ? nextProject : project)
      : [nextProject, ...projects]
    const nextAdmins = admins.map((admin) => ({
      ...admin,
      projectIds: admin.id === nextProject.adminId
        ? [...new Set([...admin.projectIds, projectId])]
        : admin.projectIds.filter((assignedId) => assignedId !== projectId),
    }))
    if (!persistProjectData(nextProjects, nextAdmins)) return
    setProjectModalOpen(false)
    setNotice(editingProjectId ? 'Project updated.' : 'Project added.')
  }

  function deleteProject(project: ManagedProject) {
    if (!window.confirm(`Delete “${project.name}”? This will remove its Project Admin assignment.`)) return
    const nextProjects = projects.filter((item) => item.id !== project.id)
    const nextAdmins = admins.map((admin) => ({
      ...admin,
      projectIds: admin.projectIds.filter((projectId) => projectId !== project.id),
    }))
    if (!persistProjectData(nextProjects, nextAdmins)) return
    setNotice(`“${project.name}” deleted.`)
  }

  function openAddAdmin() {
    setEditingAdminId(null)
    setAdminForm(emptyAdminForm)
    setAdminError('')
    setAdminModalOpen(true)
  }

  function openEditAdmin(admin: ProjectAdmin) {
    const { id, ...values } = admin
    setEditingAdminId(id)
    setAdminForm(values)
    setAdminError('')
    setAdminModalOpen(true)
  }

  function saveAdmin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = adminForm.name.trim()
    const email = adminForm.email.trim().toLowerCase()
    if (!name || !email) {
      setAdminError('Full name and email address are required.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setAdminError('Enter a valid email address.')
      return
    }
    if (admins.some((admin) => admin.id !== editingAdminId && admin.email.toLowerCase() === email)) {
      setAdminError('A Project Admin with this email already exists.')
      return
    }

    const adminId = editingAdminId ?? `admin-${Date.now()}`
    const nextAdmin: ProjectAdmin = { ...adminForm, id: adminId, name, email }
    const withoutSelectedAssignments = admins
      .filter((admin) => admin.id !== adminId)
      .map((admin) => ({
        ...admin,
        projectIds: admin.projectIds.filter((projectId) => !adminForm.projectIds.includes(projectId)),
      }))
    const nextAdmins = [nextAdmin, ...withoutSelectedAssignments]
    const nextProjects = projects.map((project) => {
      const selectedForProject = adminForm.projectIds.includes(project.id)
      if (selectedForProject) return { ...project, adminId }
      if (project.adminId === adminId) return { ...project, adminId: '' }
      return project
    })
    if (!persistProjectData(nextProjects, nextAdmins)) return
    setAdminModalOpen(false)
    setNotice(editingAdminId ? 'Project Admin updated.' : 'Project Admin added as demo data.')
  }

  function toggleAdminStatus(admin: ProjectAdmin) {
    const nextStatus: ProjectAdminStatus = admin.status === 'Active' ? 'Inactive' : 'Active'
    if (!window.confirm(`${nextStatus === 'Inactive' ? 'Deactivate' : 'Activate'} ${admin.name}?`)) return
    const nextAdmins = admins.map((item) => item.id === admin.id ? { ...item, status: nextStatus } : item)
    if (!persistProjectData(projects, nextAdmins)) return
    setNotice(`${admin.name} is now ${nextStatus.toLowerCase()}.`)
  }

  function deleteAdmin(admin: ProjectAdmin) {
    if (!window.confirm(`Delete Project Admin ${admin.name}? Their project assignments will be cleared.`)) return
    const nextAdmins = admins.filter((item) => item.id !== admin.id)
    const nextProjects = projects.map((project) => project.adminId === admin.id ? { ...project, adminId: '' } : project)
    if (!persistProjectData(nextProjects, nextAdmins)) return
    setNotice(`${admin.name} deleted; project assignments cleared.`)
  }

  function toggleProjectSelection(projectId: string) {
    setAdminForm((current) => ({
      ...current,
      projectIds: current.projectIds.includes(projectId)
        ? current.projectIds.filter((id) => id !== projectId)
        : [...current.projectIds, projectId],
    }))
  }

  function changeSort(field: SortField) {
    if (sortField === field) {
      setSortAscending((current) => !current)
      return
    }
    setSortField(field)
    setSortAscending(true)
  }

  return (
    <div className="projects-page">
      <header className="projects-navbar">
        <button className="projects-menu-button" type="button" aria-label="Open navigation menu" onClick={() => setSidebarOpen(true)}>
          <Menu size={21} />
        </button>
        <div className="projects-brand">
          <span className="projects-brand-mark"><BriefcaseBusiness size={17} /></span>
          <span>DBMS <strong>SUPER ADMIN</strong></span>
        </div>
        <div className="projects-navbar-section">PROJECT MANAGEMENT</div>
        <div className="projects-profile"><span className="projects-profile-avatar">SA</span><span>Super Admin</span></div>
      </header>

      <div className="projects-workspace">
        {sidebarOpen && <button className="projects-backdrop" type="button" aria-label="Close navigation menu" onClick={() => setSidebarOpen(false)} />}
        <AdminSidebar drawer open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />

        <main className="projects-main">
          <section className="projects-header-card">
            <div className="projects-heading-copy">
              <span className="projects-heading-icon"><FolderKanban size={24} /></span>
              <div>
                <h1>Project Management</h1>
                <p>Manage projects and their assigned Project Admins.</p>
              </div>
            </div>
            <div className="projects-heading-actions">
              <button className="projects-button projects-button--secondary" type="button" onClick={openAddAdmin}>
                <UserRoundPlus size={15} /> Add Project Admin
              </button>
              <button className="projects-button projects-button--primary" type="button" onClick={openAddProject}>
                <Plus size={16} /> Add Project
              </button>
            </div>
          </section>

          <div className="projects-demo-notice">
            <ShieldCheck size={15} aria-hidden="true" />
            <span>Demo data only — changes are held in this browser session and are not saved to a server.</span>
          </div>

          {notice && <div className="projects-toast" role="status"><Check size={15} aria-hidden="true" />{notice}<button type="button" aria-label="Dismiss message" onClick={() => setNotice('')}><X size={14} /></button></div>}

          <section className="projects-summary-grid" aria-label="Project summary">
            <SummaryCard title="Total Projects" value={counts.totalProjects} icon={<FolderKanban size={18} />} tone="orange" />
            <SummaryCard title="Active Projects" value={counts.activeProjects} icon={<CircleCheck size={18} />} tone="green" />
            <SummaryCard title="Completed Projects" value={counts.completedProjects} icon={<Clock3 size={18} />} tone="purple" />
            <SummaryCard title="Total Project Admins" value={counts.totalAdmins} icon={<UsersRound size={18} />} tone="blue" />
            <SummaryCard title="Hold Projects" value={counts.holdProjects} icon={<PauseCircle size={18} />} tone="orange" />
            <SummaryCard title="Upcoming Projects" value={counts.upcomingProjects} icon={<CalendarClock size={18} />} tone="green" />
          </section>

          <section className="projects-card">
            <div className="projects-section-heading">
              <div><h2>Projects</h2><p>Review project details, timeline, status, and ownership.</p></div>
              <button className="projects-button projects-button--primary projects-mobile-add" type="button" onClick={openAddProject}><Plus size={15} /> Add Project</button>
            </div>
            <div className="projects-toolbar">
              <label className="projects-search">
                <Search size={15} aria-hidden="true" />
                <span className="projects-visually-hidden">Search projects by name</span>
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search project name..." />
              </label>
              <label className="projects-filter">
                <span className="projects-visually-hidden">Filter projects by status</span>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'All' | ProjectStatus)}>
                  <option value="All">All statuses</option>
                  {projectStatuses.map((status) => <option key={status}>{status}</option>)}
                </select>
                <ChevronDown size={14} aria-hidden="true" />
              </label>
              <button className="projects-sort-button" type="button" onClick={() => changeSort(sortField === 'name' ? 'startDate' : 'name')} title={`Sort by ${sortField === 'name' ? 'start date' : 'project name'}`}>
                <ArrowDownUp size={14} /> Sort: {sortField === 'name' ? 'Name' : 'Start date'} <span>{sortAscending ? '↑' : '↓'}</span>
              </button>
            </div>

            <div className="projects-table-scroll">
              <table className="projects-table">
                <thead>
                  <tr>
                    <th><button type="button" onClick={() => changeSort('name')}>Project Name <ArrowDownUp size={12} /></button></th>
                    <th>Description</th>
                    <th>Assigned Project Admin</th>
                    <th><button type="button" onClick={() => changeSort('startDate')}>Start Date <ArrowDownUp size={12} /></button></th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th><span className="projects-visually-hidden">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {visibleProjects.map((project) => {
                    const admin = assignedAdmin(project.adminId)
                    return (
                      <tr key={project.id}>
                        <td><strong className="projects-name">{project.name}</strong></td>
                        <td className="projects-description-cell">{project.description || '—'}</td>
                        <td>{admin ? <span className="projects-admin-person"><span className="projects-avatar">{initials(admin.name)}</span>{admin.name}</span> : <span className="projects-unassigned">Unassigned</span>}</td>
                        <td>{formatDate(project.startDate)}</td>
                        <td>{formatDate(project.endDate)}</td>
                        <td><span className={`projects-status projects-status--${project.status.toLowerCase().replace(' ', '-')}`}>{project.status}</span></td>
                        <td>
                          <div className="projects-row-actions">
                            <button type="button" aria-label={`View ${project.name}`} title="View project" onClick={() => setViewProject(project)}><Eye size={15} /></button>
                            <button type="button" aria-label={`Edit ${project.name}`} title="Edit project" onClick={() => openEditProject(project)}><Pencil size={14} /></button>
                            <button type="button" aria-label={`Delete ${project.name}`} title="Delete project" onClick={() => deleteProject(project)}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {visibleProjects.length === 0 && <tr><td className="projects-empty-state" colSpan={7}>{projects.length === 0 ? 'No projects yet. Add a project to get started.' : 'No projects match your search or filters.'}</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="projects-table-footer">Showing {visibleProjects.length} of {projects.length} projects</div>
          </section>

          <section className="projects-card">
            <div className="projects-section-heading">
              <div><h2>Project Admins</h2><p>Manage account details and project assignments.</p></div>
              <button className="projects-button projects-button--secondary" type="button" onClick={openAddAdmin}><UserRoundPlus size={15} /> Add Project Admin</button>
            </div>
            <div className="projects-table-scroll">
              <table className="projects-table projects-admins-table">
                <thead><tr><th>Admin Name</th><th>Email</th><th>Phone Number</th><th>Projects</th><th>Account Status</th><th><span className="projects-visually-hidden">Actions</span></th></tr></thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin.id}>
                      <td><span className="projects-admin-person"><span className="projects-avatar">{initials(admin.name)}</span><strong>{admin.name}</strong></span></td>
                      <td>{admin.email}</td>
                      <td>{admin.phone || '—'}</td>
                      <td>{admin.projectIds.map((id) => projectName(id)).filter(Boolean).join(', ') || <span className="projects-unassigned">Unassigned</span>}</td>
                      <td><span className={`projects-status projects-status--${admin.status.toLowerCase()}`}>{admin.status}</span></td>
                      <td>
                        <div className="projects-row-actions">
                          <button type="button" aria-label={`View ${admin.name}`} title="View details" onClick={() => setViewAdmin(admin)}><Eye size={15} /></button>
                          <button type="button" aria-label={`Edit ${admin.name}`} title="Edit details and assignments" onClick={() => openEditAdmin(admin)}><Pencil size={14} /></button>
                          <button type="button" aria-label={`${admin.status === 'Active' ? 'Deactivate' : 'Activate'} ${admin.name}`} title={admin.status === 'Active' ? 'Deactivate account' : 'Activate account'} onClick={() => toggleAdminStatus(admin)}><UserRound size={14} /></button>
                          <button type="button" aria-label={`Delete ${admin.name}`} title="Delete admin" onClick={() => deleteAdmin(admin)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {admins.length === 0 && <tr><td className="projects-empty-state" colSpan={6}>No Project Admins yet. Add an admin to assign projects.</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="projects-table-footer">Showing {admins.length} Project Admin{admins.length === 1 ? '' : 's'}</div>
          </section>
          <p className="projects-footer-note">Project Admin accounts are demonstration records only. Use the secure account invitation flow when backend support is available.</p>
        </main>
      </div>

      {projectModalOpen && (
        <div className="projects-modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setProjectModalOpen(false) }}>
          <section className="projects-modal" role="dialog" aria-modal="true" aria-labelledby="project-form-title">
            <ModalHeading id="project-form-title" title={editingProjectId ? 'Edit Project' : 'Add Project'} onClose={() => setProjectModalOpen(false)} />
            <form onSubmit={saveProject} noValidate>
              <div className="projects-form-grid">
                <label className="projects-field projects-field--wide"><span>Project Name <b>*</b></span><input autoFocus value={projectForm.name} onChange={(event) => setProjectForm((current) => ({ ...current, name: event.target.value }))} placeholder="e.g. Customer Portal Revamp" required /></label>
                <label className="projects-field"><span>Project Status</span><select value={projectForm.status} onChange={(event) => setProjectForm((current) => ({ ...current, status: event.target.value as ProjectStatus }))}>{projectStatuses.map((status) => <option key={status}>{status}</option>)}</select></label>
                <label className="projects-field projects-field--wide"><span>Description</span><textarea rows={3} value={projectForm.description} onChange={(event) => setProjectForm((current) => ({ ...current, description: event.target.value }))} placeholder="Briefly describe the project..." /></label>
                <label className="projects-field"><span>Start Date</span><input type="date" value={projectForm.startDate} onChange={(event) => setProjectForm((current) => ({ ...current, startDate: event.target.value }))} /></label>
                <label className="projects-field"><span>End Date</span><input type="date" min={projectForm.startDate || undefined} value={projectForm.endDate} onChange={(event) => setProjectForm((current) => ({ ...current, endDate: event.target.value }))} /></label>
                <label className="projects-field projects-field--wide"><span>Project Admin</span><select value={projectForm.adminId} onChange={(event) => setProjectForm((current) => ({ ...current, adminId: event.target.value }))}><option value="">Select</option>{admins.filter(isProjectAdminActive).map((admin) => <option key={admin.id} value={admin.id}>{admin.name}</option>)}</select></label>
              </div>
              {projectError && <p className="projects-form-error" role="alert">{projectError}</p>}
              <ModalActions onCancel={() => setProjectModalOpen(false)} submitLabel={editingProjectId ? 'Save Changes' : 'Save Project'} />
            </form>
          </section>
        </div>
      )}

      {adminModalOpen && (
        <div className="projects-modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setAdminModalOpen(false) }}>
          <section className="projects-modal" role="dialog" aria-modal="true" aria-labelledby="admin-form-title">
            <ModalHeading id="admin-form-title" title={editingAdminId ? 'Edit Project Admin' : 'Add Project Admin'} onClose={() => setAdminModalOpen(false)} />
            <p className="projects-form-demo-note">Demo only. This does not create login credentials or invite an account.</p>
            <form onSubmit={saveAdmin} noValidate>
              <div className="projects-form-grid">
                <label className="projects-field projects-field--wide"><span>Full Name <b>*</b></span><input autoFocus value={adminForm.name} onChange={(event) => setAdminForm((current) => ({ ...current, name: event.target.value }))} placeholder="Enter full name" required /></label>
                <label className="projects-field"><span>Email Address <b>*</b></span><input type="email" value={adminForm.email} onChange={(event) => setAdminForm((current) => ({ ...current, email: event.target.value }))} placeholder="name@example.com" required /></label>
                <label className="projects-field"><span>Phone Number</span><input type="tel" value={adminForm.phone} onChange={(event) => setAdminForm((current) => ({ ...current, phone: event.target.value }))} placeholder="+1 555 0100" /></label>
                <label className="projects-field"><span>Username</span><input value={adminForm.username} onChange={(event) => setAdminForm((current) => ({ ...current, username: event.target.value }))} placeholder="Optional" /></label>
                <label className="projects-field"><span>Account Status</span><select value={adminForm.status} onChange={(event) => setAdminForm((current) => ({ ...current, status: event.target.value as ProjectAdminStatus }))}><option>Active</option><option>Inactive</option></select></label>
                <fieldset className="projects-project-select projects-field--wide">
                  <legend> Projects</legend>
                  {projects.length === 0
                    ? <p className="projects-unassigned">Add a project before assigning one.</p>
                    : projects.map((project) => (
                      <label key={project.id}>
                        <input type="checkbox" checked={adminForm.projectIds.includes(project.id)} onChange={() => toggleProjectSelection(project.id)} />
                        <span>{project.name}{project.adminId && project.adminId !== editingAdminId && <small>Reassigned from {assignedAdmin(project.adminId)?.name ?? 'another admin'}</small>}</span>
                      </label>
                    ))}
                </fieldset>
              </div>
              {adminError && <p className="projects-form-error" role="alert">{adminError}</p>}
              <ModalActions onCancel={() => setAdminModalOpen(false)} submitLabel={editingAdminId ? 'Save Changes' : 'Add Project Admin'} />
            </form>
          </section>
        </div>
      )}

      {viewProject && (
        <div className="projects-modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setViewProject(null) }}>
          <section className="projects-modal projects-details-modal" role="dialog" aria-modal="true" aria-labelledby="project-details-title">
            <ModalHeading id="project-details-title" title={viewProject.name} onClose={() => setViewProject(null)} />
            <p className="projects-details-description">{viewProject.description || 'No project description provided.'}</p>
            <dl className="projects-details-grid">
              <Detail label="Project Status" value={viewProject.status} />
              <Detail label="Start Date" value={formatDate(viewProject.startDate)} />
              <Detail label="End Date" value={formatDate(viewProject.endDate)} />
              <Detail label="Assigned Admin" value={assignedAdmin(viewProject.adminId)?.name ?? 'Unassigned'} />
            </dl>
            <ModalActions onCancel={() => setViewProject(null)} cancelLabel="Close" hideSubmit />
          </section>
        </div>
      )}

      {viewAdmin && (
        <div className="projects-modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setViewAdmin(null) }}>
          <section className="projects-modal projects-details-modal" role="dialog" aria-modal="true" aria-labelledby="admin-details-title">
            <ModalHeading id="admin-details-title" title={viewAdmin.name} onClose={() => setViewAdmin(null)} />
            <p className="projects-form-demo-note">Project Admin demo record — no login credentials are stored.</p>
            <dl className="projects-details-grid">
              <Detail label="Email" value={viewAdmin.email} icon={<Mail size={14} />} />
              <Detail label="Phone" value={viewAdmin.phone || 'Not provided'} icon={<Phone size={14} />} />
              <Detail label="Username" value={viewAdmin.username || 'Not set'} />
              <Detail label="Account Status" value={viewAdmin.status} />
              <Detail label="Assigned Projects" value={viewAdmin.projectIds.map((id) => projectName(id)).filter(Boolean).join(', ') || 'Unassigned'} />
            </dl>
            <ModalActions onCancel={() => setViewAdmin(null)} cancelLabel="Close" hideSubmit />
          </section>
        </div>
      )}
    </div>
  )
}

interface SummaryCardProps {
  title: string
  value: number
  icon: ReactNode
  tone: 'orange' | 'green' | 'purple' | 'blue'
}

function SummaryCard({ title, value, icon, tone }: SummaryCardProps) {
  return (
    <article className="projects-summary-card">
      <div className="projects-summary-top"><span>{title}</span><span className={`projects-summary-icon projects-summary-icon--${tone}`}>{icon}</span></div>
      <strong>{value.toLocaleString()}</strong>
      <small>Across the platform</small>
    </article>
  )
}

function ModalHeading({ id, title, onClose }: { id: string; title: string; onClose: () => void }) {
  return (
    <div className="projects-modal-heading">
      <div><span className="projects-modal-kicker">PROJECT MANAGEMENT</span><h2 id={id}>{title}</h2></div>
      <button type="button" aria-label="Close dialog" onClick={onClose}><X size={18} /></button>
    </div>
  )
}

function ModalActions({
  onCancel,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  hideSubmit = false,
}: {
  onCancel: () => void
  submitLabel?: string
  cancelLabel?: string
  hideSubmit?: boolean
}) {
  return (
    <div className="projects-modal-actions">
      <button className="projects-button projects-button--secondary" type="button" onClick={onCancel}>{cancelLabel}</button>
      {!hideSubmit && <button className="projects-button projects-button--primary" type="submit"><Check size={15} />{submitLabel}</button>}
    </div>
  )
}

function Detail({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return <div><dt>{label}</dt><dd>{icon}{value}</dd></div>
}

export default ProjectManagementPage
