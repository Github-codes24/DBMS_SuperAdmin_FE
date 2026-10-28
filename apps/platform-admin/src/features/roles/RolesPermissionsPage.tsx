import { useMemo, useState } from 'react'
import {
  ChevronDown,
  Menu,
  Plus,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react'
import AdminSidebar from '../../components/AdminSidebar'
import CreateRoleModal from './CreateRoleModal'
import './rolesPermissions.css'

const modules = [
  { name: 'Dashboard', description: 'View the platform overview and key activity.' },
  { name: 'User Management', description: 'Manage user accounts and information.' },
  { name: 'Roles & Permissions', description: 'Manage role access and permissions.' },
  { name: 'Reports', description: 'View and generate platform reports.' },
]

const permissionColumns = ['View Access', 'Edit / Update', 'Import Data', 'Delete Access'] as const
const fullPermissionHeaders = ['Full Access', ...permissionColumns] as const
const initialRoleOptions = [
  'Platform > SuperAdmin',
  'Admin',
  'DBMS > SuperAdmin',
  'LTS > SuperAdmin',
  'Real estate > SuperAdmin',
  'Edu-Merit > SuperAdmin',
] 
type Permission = (typeof permissionColumns)[number]
type PermissionState = Record<string, Record<Permission, boolean>>

const createPermissions = (enabled = false): PermissionState =>
  Object.fromEntries(modules.map(({ name }) => [
    name,
    Object.fromEntries(permissionColumns.map((permission) => [permission, enabled])),
  ])) as PermissionState

function RolesPermissionsPage() {
  const [roleOptions, setRoleOptions] = useState<string[]>(initialRoleOptions)
  const [selectedRole, setSelectedRole] = useState(initialRoleOptions[0])
  const [permissionState, setPermissionState] = useState<Record<string, PermissionState>>(
    () => Object.fromEntries(initialRoleOptions.map((role) => [
      role,
      createPermissions(role === 'Platform > SuperAdmin'),
    ])),
  )
  const [filter, setFilter] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  const visibleModules = useMemo(
    () => modules.filter(({ name, description }) => `${name} ${description}`.toLowerCase().includes(filter.trim().toLowerCase())),
    [filter],
  )
  const activePermissions = Object.values(permissionState[selectedRole]).reduce(
    (total, modulePermissions) => total + Object.values(modulePermissions).filter(Boolean).length,
    0,
  )
  const showFullAccess = selectedRole === 'Platform > SuperAdmin'
  const tableHeaders = showFullAccess ? fullPermissionHeaders : permissionColumns
  const totalPermissions = modules.length * permissionColumns.length

  function setModulePermissions(moduleName: string, value: boolean) {
    setPermissionState((current) => ({
      ...current,
      [selectedRole]: {
        ...current[selectedRole],
        [moduleName]: Object.fromEntries(permissionColumns.map((permission) => [permission, value])) as Record<Permission, boolean>,
      },
    }))
  }

  function setPermission(moduleName: string, permission: Permission) {
    setPermissionState((current) => ({
      ...current,
      [selectedRole]: {
        ...current[selectedRole],
        [moduleName]: {
          ...current[selectedRole][moduleName],
          [permission]: !current[selectedRole][moduleName][permission],
        },
      },
    }))
  }

  function createRole(title: string) {
    if (roleOptions.some((role) => role.toLowerCase() === title.toLowerCase())) return false

    setRoleOptions((current) => [...current, title])
    setPermissionState((current) => ({ ...current, [title]: createPermissions() }))
    setSelectedRole(title)
    setSaveMessage('')
    return true
  }

  return (
    <div className="roles-page">
      <header className="roles-navbar">
        <button className="roles-menu-button" type="button" aria-label="Open navigation menu" onClick={() => setSidebarOpen(true)}>
          <Menu size={21} />
        </button>
        <div className="roles-brand">
          <span className="roles-brand-mark"><ShieldCheck size={19} /></span>
          <span>DBMS <strong>SUPER ADMIN</strong></span>
        </div>
        <div className="roles-navbar-section">ROLES &amp; PERMISSIONS</div>
        <button className="roles-profile" type="button">
          <span className="roles-profile-avatar">SA</span>
          <span>Super Admin</span>
          <ChevronDown size={15} />
        </button>
      </header>

      <div className="roles-workspace">
        {sidebarOpen && <button className="roles-backdrop" type="button" aria-label="Close navigation menu" onClick={() => setSidebarOpen(false)} />}
        <AdminSidebar drawer open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />

        <main className="roles-main">
          <section className="roles-header-card">
            <div className="roles-header-copy">
              <div className="roles-title-row">
                <span className="roles-title-icon"><ShieldCheck size={25} strokeWidth={2} /></span>
                <div className="roles-title-text">
                  <div className="roles-heading-line">
                    <h1>Roles &amp; Permissions Management</h1>
                    <span className="roles-access-badge">Super Admin Access Only</span>
                  </div>
                  <p>Only Super Admin has master access to assign and manage module permissions (View, Edit, Import, Delete) for Admin and Telecaller roles.</p>
                </div>
              </div>
            </div>
            <div className="roles-header-actions">
              <div className="roles-logged-in"><i /> <span>Logged in: <strong>Super Admin</strong></span></div>
              <button className="roles-action-button roles-add-button" type="button" onClick={() => setIsCreateRoleOpen(true)}>
                <Plus size={16} />Add New Role
              </button>
              <button className="roles-action-button roles-save-button" type="button"><Save size={16} />Save Permissions</button>
            </div>
          </section>

          <section className="roles-permissions-card" aria-label="Roles permissions">
            <div className="roles-toolbar">
              <div className="roles-role-info">
                <div className="roles-role-avatar"><ShieldCheck size={20} /></div>
                <div className="roles-role-copy">
                  <div className="roles-role-title">
                    <h2>Roles</h2>
                    <label className="roles-role-select-wrap">
                      <span className="roles-visually-hidden">Select role</span>
                      <select
                        className="roles-role-select"
                        value={selectedRole}
                        onChange={(event) => setSelectedRole(event.target.value)}
                        aria-label="Select role"
                      >
                        {roleOptions.map((role) => <option key={role} value={role}>{role}</option>)}
                      </select>
                      <ChevronDown size={14} aria-hidden="true" />
                    </label>
                    <span className="roles-count-badge">{activePermissions} of {totalPermissions} Privileges Active</span>
                  </div>
                  <p>Configure module-specific access rights for this role below.</p>
                </div>
              </div>
              <div className="roles-toolbar-controls">
                <label className="roles-search">
                  <Search size={15} />
                  <input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter modules..." aria-label="Filter modules" />
                </label>
                <button className="roles-control-button roles-reset-button" type="button" onClick={() => {
                  setPermissionState((current) => ({ ...current, [selectedRole]: createPermissions() }))
                  setFilter('')
                }}>
                  <RotateCcw size={14} />Reset
                </button>
              </div>
            </div>

            <div className="roles-table-scroll">
              <table className={`roles-table${showFullAccess ? '' : ' roles-table--without-full-access'}`}>
                <colgroup>
                  <col className="roles-module-column" />
                  {tableHeaders.map((permission) => <col key={permission} />)}
                </colgroup>
                <thead>
                  <tr>
                    <th scope="col">Module / Resource</th>
                    {tableHeaders.map((permission) => <th scope="col" key={permission}>{permission}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {visibleModules.map(({ name, description }) => (
                    <tr key={name}>
                      <td className="roles-module-cell">
                        <div className="roles-module-name">{name}</div>
                        <div className="roles-module-description">{description}</div>
                      </td>
                      {showFullAccess && (
                        <td className="roles-select-cell">
                          <button className="roles-select-all" type="button" onClick={() => {
                            const allSelected = permissionColumns.every((permission) => permissionState[selectedRole][name][permission])
                            setModulePermissions(name, !allSelected)
                          }}>Select All</button>
                        </td>
                      )}
                      {permissionColumns.map((permission) => {
                        const checked = permissionState[selectedRole][name][permission]
                        return (
                          <td className="roles-permission-cell" key={permission}>
                            <button
                              className={`roles-permission-toggle${checked ? ' roles-permission-toggle--checked' : ''}`}
                              type="button"
                              aria-label={`${name}: ${permission}`}
                              aria-pressed={checked}
                              onClick={() => setPermission(name, permission)}
                            >
                              {checked ? <Check size={16} strokeWidth={2.6} /> : <X size={15} strokeWidth={2.3} />}
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                  {visibleModules.length === 0 && (
                    <tr><td className="roles-empty-cell" colSpan={tableHeaders.length + 1}>No modules match “{filter}”.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="roles-card-footer">
              <span><i /> Changes are local to this page and won’t be saved automatically.</span>
              <div className="roles-footer-actions">
                <span>{saveMessage || `${visibleModules.length} modules`}</span>
                <button className="roles-action-button roles-save-button" type="button" onClick={() => setSaveMessage('Preview only — changes are not saved.')}>
                  <Save size={15} />Save Changes
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
      {isCreateRoleOpen && (
        <CreateRoleModal
          onClose={() => setIsCreateRoleOpen(false)}
          onCreate={createRole}
        />
      )}
    </div>
  )
}

export default RolesPermissionsPage
