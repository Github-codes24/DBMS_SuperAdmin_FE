import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users as UsersIcon, Plus } from 'lucide-react'
import ResponsiveLayout from '../../components/layout/ResponsiveLayout'
import { useToast, useConfirm } from '../../context'
import { AlertMessage } from '../../components/notifications'
import { Modal, SideDrawer } from '../../components/overlays'
import { Avatar, StatusBadge } from '../../components/data-display'
import { TableSkeletonRows, EmptyState, NoSearchResults } from '../../components/feedback'
import { PrimaryButton, SecondaryButton } from '../../components/ui/buttons'
import './users.css'
import {
  createUser,
  deleteUser,
  getUser,
  getUserAudit,
  listUsers,
  resetUserPassword,
  updateUser,
  updateUserStatus,
  updateUsersStatus,
  AuthenticationError,
  listRoles,
} from './services/userService'
import type { SelectOption, User } from './types/user.types'

type UserStatus = 'Active' | 'Inactive'
const ROLE_OPTIONS = [
  { value: 'superadmin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'user', label: 'User' },
] as const

const DEMO_PROJECT_OPTIONS: SelectOption[] = [
  'CRS',
  'CRM',
  'LTS',
  'Real Estate',
  'Edu - Merit',
  'DBMS',
].map((name) => ({ id: name, name }))
const projectOptions = DEMO_PROJECT_OPTIONS

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

type UserFormValues = Pick<UserRecord, 'name' | 'email' | 'role'> & {
  password: string
  projects: string[]
}

const PAGE_SIZE = 10

const emptyForm: UserFormValues = { name: '', email: '', password: '', role: ROLE_OPTIONS[0].value, projects: [] }

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
    role: ROLE_OPTIONS.find((role) => role.value === user.role.toLowerCase())?.label ?? user.role,
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

function formatDateTime(value?: string) {
  if (!value) return 'Not recorded'
  const timestamp = Date.parse(value)
  return Number.isNaN(timestamp)
    ? value
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(timestamp)
}

function formatAuditValue(value: unknown) {
  if (value == null) return ''
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

function UserManagementPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<UserRecord[]>([])
  const [selectedUsers, setSelectedUsers] = useState<Map<string, UserRecord>>(() => new Map())
  const [isBulkUpdating, setIsBulkUpdating] = useState(false)
  const [isProjectAssignmentOpen, setIsProjectAssignmentOpen] = useState(false)
  const [selectedProjectsToAdd, setSelectedProjectsToAdd] = useState<string[]>([])
  const [isAssigningProjects, setIsAssigningProjects] = useState(false)
  const [projectAssignmentError, setProjectAssignmentError] = useState('')
  const [roleOptions, setRoleOptions] = useState<{ value: string; label: string }[]>([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [refreshKey, setRefreshKey] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [form, setForm] = useState<UserFormValues>(emptyForm)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [viewingUser, setViewingUser] = useState<User | null>(null)
  const [viewingUserPreview, setViewingUserPreview] = useState<UserRecord | null>(null)
  const [isLoadingUserDetails, setIsLoadingUserDetails] = useState(false)
  const [userDetailsError, setUserDetailsError] = useState('')
  const [userActivityError, setUserActivityError] = useState('')
  const userDetailsRequestId = useRef(0)
  const [passwordResetUser, setPasswordResetUser] = useState<UserRecord | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [passwordResetError, setPasswordResetError] = useState('')
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [formError, setFormError] = useState('')
  const { toast } = useToast()
  const { confirm } = useConfirm()


  
useEffect(() => {
  listRoles()
    .then((response: any) => {
      const items = response.data.data ?? []

      setRoleOptions(
        items.map((role: any) => ({
          value: role._id,
          label: role.name,
        }))
      )
    })
    .catch((error) => {
      console.error('Failed to fetch roles:', error)
    })
}, [])


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
        if (controller.signal.aborted) return
        if (error instanceof AuthenticationError) {
          setLoadError(getErrorMessage(error))
          return
        }
        setLoadError(getErrorMessage(error))
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
    return () => controller.abort()
  }, [navigate, page, refreshKey, roleFilter, search, statusFilter])

  const pageCount = Math.max(1, Math.ceil(totalUsers / PAGE_SIZE))
  const pageUsers = users
  const selectedIds = Array.from(selectedUsers.keys())
  const allPageUsersSelected = pageUsers.length > 0 && pageUsers.every((user) => selectedUsers.has(user.id))

  function updateSelectedUser(user: UserRecord) {
    setSelectedUsers((current) => {
      if (!current.has(user.id)) return current
      const next = new Map(current)
      next.set(user.id, user)
      return next
    })
  }

  function toggleUserSelection(user: UserRecord, selected: boolean) {
    setSelectedUsers((current) => {
      const next = new Map(current)
      if (selected) next.set(user.id, user)
      else next.delete(user.id)
      return next
    })
  }

  function togglePageSelection(selected: boolean) {
    setSelectedUsers((current) => {
      const next = new Map(current)
      for (const user of pageUsers) {
        if (selected) next.set(user.id, user)
        else next.delete(user.id)
      }
      return next
    })
  }

  function openProjectAssignment() {
    setSelectedProjectsToAdd([])
    setProjectAssignmentError('')
    setIsProjectAssignmentOpen(true)
  }

  function closeProjectAssignment() {
    if (isAssigningProjects) return
    setIsProjectAssignmentOpen(false)
    setSelectedProjectsToAdd([])
    setProjectAssignmentError('')
  }

  function toggleProjectToAdd(projectId: string) {
    setSelectedProjectsToAdd((current) => current.includes(projectId)
      ? current.filter((id) => id !== projectId)
      : [...current, projectId])
  }

  async function assignProjectsToSelectedUsers(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (selectedIds.length === 0 || selectedProjectsToAdd.length === 0) return

    setIsAssigningProjects(true)
    setProjectAssignmentError('')
    try {
      const results = await Promise.allSettled(
        Array.from(selectedUsers.entries(), async ([id, user]) => {
          const currentProjectIds = user.projects.map((projectName) =>
            projectOptions.find((project) => project.name === projectName)?.id ?? projectName,
          )
          const assignedProjects = Array.from(new Set([...currentProjectIds, ...selectedProjectsToAdd]))
          if (assignedProjects.length === currentProjectIds.length) {
            return { id, updatedRecord: null }
          }

          const role = roleOptions.find((option) => option.label === user.role)?.value ?? user.role
          const updatedUser = await updateUser(id, {
            fullName: user.name,
            email: user.email,
            role,
            assignedProjects,
          })
          return { id, updatedRecord: fromApiUser(updatedUser, projectOptions) }
        }),
      )

      const authenticationFailure = results.find(
        (result) => result.status === 'rejected' && result.reason instanceof AuthenticationError,
      )
      if (authenticationFailure) {
        navigate('/login', { replace: true })
        return
      }

      const successfulResults = results.filter(
        (result): result is PromiseFulfilledResult<{ id: string; updatedRecord: UserRecord | null }> =>
          result.status === 'fulfilled',
      )
      const failedResults = results.filter(
        (result): result is PromiseRejectedResult => result.status === 'rejected',
      )
      const updatedRecords = successfulResults
        .map((result) => result.value.updatedRecord)
        .filter((record): record is UserRecord => record !== null)
      const failedIds = new Set(
        results.flatMap((result, index) => result.status === 'rejected' ? [selectedIds[index]] : []),
      )

      if (updatedRecords.length > 0) {
        setUsers((current) => current.map((user) =>
          updatedRecords.find((updated) => updated.id === user.id) ?? user,
        ))
        setIsLoading(true)
        setLoadError('')
        setRefreshKey((current) => current + 1)
        toast.success(`${updatedRecords.length} user${updatedRecords.length === 1 ? '' : 's'} updated with the selected projects.`)
      } else if (failedResults.length === 0) {
        toast.success('The selected projects are already assigned to all selected users.')
      }

      setSelectedUsers((current) => new Map(
        Array.from(current.entries()).filter(([id]) => failedIds.has(id)),
      ))
      if (failedResults.length > 0) {
        const firstError = getErrorMessage(failedResults[0].reason)
        setProjectAssignmentError(
          `${failedResults.length} user${failedResults.length === 1 ? '' : 's'} could not be updated. ${firstError}`,
        )
      } else {
        setIsProjectAssignmentOpen(false)
        setSelectedProjectsToAdd([])
      }
    } finally {
      setIsAssigningProjects(false)
    }
  }

  async function changeSelectedUsersStatus(isActive: boolean) {
    if (selectedIds.length === 0) return
    const status = isActive ? 'activate' : 'deactivate'
    const confirmed = await confirm({
      title: `${isActive ? 'Activate' : 'Deactivate'} selected users`,
      message: `Are you sure you want to ${status} ${selectedIds.length} selected user${selectedIds.length === 1 ? '' : 's'}?`,
      confirmText: isActive ? 'Activate selected' : 'Deactivate selected',
      confirmVariant: isActive ? 'primary' : 'warning',
    })
    if (!confirmed) return

    setIsBulkUpdating(true)
    setActionError('')
    try {
      const result = await updateUsersStatus(selectedIds, isActive)
      if (result.usedIndividualFallback) {
        const updatedRecords = result.updatedUsers.map((user) => fromApiUser(user, projectOptions))
        const failedIds = new Set(result.failures.map((failure) => failure.userId))
        if (updatedRecords.length > 0) {
          setUsers((current) => current.map((user) =>
            updatedRecords.find((updated) => updated.id === user.id) ?? user,
          ))
          toast.success(
            `${updatedRecords.length} selected user${updatedRecords.length === 1 ? ' has' : 's have'} been ${isActive ? 'activated' : 'deactivated'} successfully.`,
          )
        }
        setSelectedUsers((current) => new Map(
          Array.from(current.entries()).filter(([id]) => failedIds.has(id)),
        ))
        if (result.failures.length > 0) {
          setActionError(
            `The bulk status route was not found. ${result.failures.length} user${result.failures.length === 1 ? '' : 's'} could not be updated individually. ${getErrorMessage(result.failures[0].error)}`,
          )
        }
      } else {
        toast.success(`${selectedIds.length} selected user${selectedIds.length === 1 ? ' has' : 's have'} been ${isActive ? 'activated' : 'deactivated'} successfully.`)
        setSelectedUsers(new Map())
      }
      setIsLoading(true)
      setLoadError('')
      setRefreshKey((current) => current + 1)
    } catch (error) {
      if (error instanceof AuthenticationError) {
        navigate('/login', { replace: true })
        return
      }
      setActionError(getErrorMessage(error))
    } finally {
      setIsBulkUpdating(false)
    }
  }

  function updateFilter(setter: (value: string) => void, value: string) {
    setIsLoading(true)
    setLoadError('')
    setter(value)
    setPage(1)
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
      role: roleOptions.find((role) => role.label === user.role)?.value ?? user.role,
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
    if (form.name.trim().length < 2 || form.name.trim().length > 100) {
      setFormError('Full name must be between 2 and 100 characters.')
      return
    }
    if (
      form.email.trim().length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      setFormError('Enter a valid email address (maximum 254 characters).')
      return
    }
    if (!editingId && (form.password.length < 8 || form.password.length > 128)) {
      setFormError('Password must be between 8 and 128 characters.')
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
        role: form.role,
        assignedProjects,
      }
      if (editingId) {
        const updatedUser = await updateUser(editingId, input)
        const updatedRecord = fromApiUser(updatedUser, projectOptions)
        setUsers((current) => current.map((user) =>
          user.id === updatedRecord.id ? updatedRecord : user,
        ))
        updateSelectedUser(updatedRecord)
        toast.success('User updated successfully.')
      } else {
        const createdUser = await createUser({ ...input, password: form.password })
        const createdRecord = fromApiUser(createdUser, projectOptions)
        setUsers((current) => [
          createdRecord,
          ...current.filter((user) => user.id !== createdRecord.id),
        ].slice(0, PAGE_SIZE))
        setTotalUsers((current) => current + 1)
        toast.success('User created successfully.')
        setSearch('')
        setRoleFilter('All')
        setStatusFilter('All')
        setPage(1)
      }
      setLoadError('')
      setEditingId(null)
      setIsFormOpen(false)
    } catch (error) {
      if (error instanceof AuthenticationError) {
        navigate('/login', { replace: true })
        return
      }
      setFormError(getErrorMessage(error))
    } finally {
      setIsSaving(false)
    }
  }

  async function changeUserStatus(user: UserRecord, nextStatus: UserStatus) {
    if (nextStatus === user.status) return
    setActionError('')
    try {
      const updatedUser = await updateUserStatus(user.id, nextStatus === 'Active' ? 'active' : 'inactive')
      const updatedRecord = fromApiUser(updatedUser, projectOptions)
      setUsers((current) => current.map((currentUser) =>
        currentUser.id === updatedRecord.id ? updatedRecord : currentUser,
      ))
      updateSelectedUser(updatedRecord)
      toast.success(`${user.name} has been ${nextStatus === 'Active' ? 'activated' : 'deactivated'} successfully.`)
    } catch (error) {
      if (error instanceof AuthenticationError) {
        setActionError(getErrorMessage(error))
        return
      }
      setActionError(getErrorMessage(error))
    }
  }

  async function toggleStatus(user: UserRecord) {
    const nextStatus: UserStatus = user.status === 'Active' ? 'Inactive' : 'Active'
    const action = nextStatus === 'Inactive' ? 'deactivate' : 'activate'
    const confirmed = await confirm({
      title: `${action === 'deactivate' ? 'Deactivate' : 'Activate'} ${user.name}?`,
      message: `This will ${action} ${user.name}'s account. Do you want to continue?`,
      confirmText: action === 'deactivate' ? 'Yes, deactivate' : 'Yes, activate',
      confirmVariant: nextStatus === 'Inactive' ? 'warning' : 'primary',
    })
    if (!confirmed) return
    await changeUserStatus(user, nextStatus)
  }

  async function openView(user: UserRecord) {
    const requestId = ++userDetailsRequestId.current
    setViewingUserPreview(user)
    setViewingUser(null)
    setUserDetailsError('')
    setUserActivityError('')
    setIsLoadingUserDetails(true)
    try {
      const details = await getUser(user.id)
      if (requestId !== userDetailsRequestId.current) return

      if (details.activityHistory !== undefined) {
        setViewingUser(details)
        return
      }

      try {
        const activity = await getUserAudit(user.id, 1, 25)
        if (requestId === userDetailsRequestId.current) {
          setViewingUser({ ...details, activityHistory: activity })
        }
      } catch (error) {
        if (requestId !== userDetailsRequestId.current) return
        if (error instanceof AuthenticationError) {
          navigate('/login', { replace: true })
          return
        }
        setViewingUser(details)
        setUserActivityError(getErrorMessage(error))
      }
    } catch (error) {
      if (requestId !== userDetailsRequestId.current) return
      if (error instanceof AuthenticationError) {
        navigate('/login', { replace: true })
        return
      }
      setUserDetailsError(getErrorMessage(error))
    } finally {
      if (requestId === userDetailsRequestId.current) setIsLoadingUserDetails(false)
    }
  }

  function closeUserDetails() {
    userDetailsRequestId.current += 1
    setViewingUser(null)
    setViewingUserPreview(null)
    setIsLoadingUserDetails(false)
    setUserDetailsError('')
    setUserActivityError('')
  }

  async function submitPasswordReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!passwordResetUser || !newPassword.trim()) {
      setPasswordResetError('A new password is required.')
      return
    }
    if (newPassword.length < 8 || newPassword.length > 128) {
      setPasswordResetError('Password must be between 8 and 128 characters.')
      return
    }

    setIsResettingPassword(true)
    setPasswordResetError('')
    try {
      await resetUserPassword(passwordResetUser.id, newPassword)
      toast.success(`Password reset for ${passwordResetUser.name}.`)
      setPasswordResetUser(null)
      setNewPassword('')
    } catch (error) {
      if (error instanceof AuthenticationError) {
        navigate('/login', { replace: true })
        return
      }
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
    const confirmed = await confirm({
      title: 'Delete User',
      message: `Are you sure you want to delete ${user.name}? This action cannot be undone.`,
      confirmText: 'Delete User',
      confirmVariant: 'danger',
    })
    if (!confirmed) return
    setActionError('')
    try {
      await deleteUser(user.id)
      setSelectedUsers((current) => {
        if (!current.has(user.id)) return current
        const next = new Map(current)
        next.delete(user.id)
        return next
      })
      toast.success('User deleted successfully.')
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
      if (error instanceof AuthenticationError) {
        navigate('/login', { replace: true })
        return
      }
      setActionError(getErrorMessage(error))
    }
  }

  return (
    <ResponsiveLayout
      title="User Management"
      description="Create and manage platform user accounts."
      icon={<UsersIcon size={24} />}
      headerActions={
        <PrimaryButton icon={<Plus size={16} />} onClick={openCreate}>
          Create User
        </PrimaryButton>
      }
    >
      <div className="user-management-page">
      {actionError && (
        <AlertMessage
          type="error"
          description={actionError}
          dismissible
          onClose={() => setActionError('')}
          action={
            actionError === 'Your session has expired. Please sign in again.' ? (
              <SecondaryButton
                size="sm"
                onClick={() => navigate('/login', { replace: true })}
              >
                Sign in
              </SecondaryButton>
            ) : undefined
          }
        />
      )}
      {loadError && (
        <AlertMessage
          type="error"
          description={loadError}
          dismissible
          onClose={() => setLoadError('')}
          action={
            loadError === 'Your session has expired. Please sign in again.' ? (
              <SecondaryButton
                size="sm"
                onClick={() => navigate('/login', { replace: true })}
              >
                Sign in
              </SecondaryButton>
            ) : undefined
          }
        />
      )}

      <section className="users-card user-filter-card" aria-label="User search and filters">
        <label className="search-box user-search">
          <span className="search-icon" aria-hidden="true">⌕</span>
          <span className="visually-hidden">Search by ID, name, email, or phone</span>
          <input
            type="search"
            placeholder="Search by ID, name, email, phone..."
            maxLength={100}
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
              {roleOptions.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
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
              <th scope="col" className="user-selection-cell">
                <input
                  type="checkbox"
                  aria-label="Select all users on this page"
                  checked={allPageUsersSelected}
                  ref={(element) => {
                    if (element) element.indeterminate = !allPageUsersSelected && pageUsers.some((user) => selectedUsers.has(user.id))
                  }}
                  disabled={isLoading || isBulkUpdating || isAssigningProjects || pageUsers.length === 0}
                  onChange={(event) => togglePageSelection(event.target.checked)}
                />
              </th>
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
              {isLoading ? (
                <TableSkeletonRows rows={PAGE_SIZE} columns={8} hasSelection hasActions />
              ) : pageUsers.length === 0 ? (
                <tr>
                  <td colSpan={10}>
                    {search || roleFilter !== 'All' || statusFilter !== 'All' ? (
                      <NoSearchResults
                        query={search}
                        onClearSearch={() => {
                          setSearch('')
                          setRoleFilter('All')
                          setStatusFilter('All')
                        }}
                      />
                    ) : (
                      <EmptyState
                        title="No users in directory"
                        description="Get started by creating the first platform user account."
                        action={
                          <button
                            type="button"
                            className="button button--primary"
                            onClick={openCreate}
                          >
                            Create user
                          </button>
                        }
                        size="sm"
                      />
                    )}
                  </td>
                </tr>
              ) : (
                pageUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="user-selection-cell">
                      <input
                        type="checkbox"
                        aria-label={`Select ${user.name}`}
                        checked={selectedUsers.has(user.id)}
                        disabled={isBulkUpdating || isAssigningProjects}
                        onChange={(event) => toggleUserSelection(user, event.target.checked)}
                      />
                    </td>
                    <td><span className="user-id-chip">{user.userId}</span></td>
                    <td><div className="user-cell">
                      <Avatar name={user.name} size="sm" />
                      <span className="user-identity"><strong>{user.name}</strong><span>Platform account</span></span>
                    </div></td>
                    <td><span className="user-email"><span className="email-glyph" aria-hidden="true">✉</span>{user.email}</span></td>
                    <td><span className="role-badge"><span className="role-glyph" aria-hidden="true">◈</span>{user.role}</span></td>
                    <td className="secondary-cell">{user.phone || '—'}</td>
                    <td className="project-cell">{user.projects.length ? user.projects.join(', ') : '—'}</td>
                    <td>
                      <select
                        className={`user-row-status status-badge--${user.status.toLowerCase()}`}
                        aria-label={`Change ${user.name} status`}
                        value={user.status}
                        onChange={(event) => void changeUserStatus(
                          user,
                          event.target.value === 'Active' ? 'Active' : 'Inactive',
                        )}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </td>
                    <td className="secondary-cell date-cell">{formatDate(user.createdAt)}</td>
                    <td><div className="row-actions">
                      <button className="icon-button" type="button" title="View details" aria-label={`View ${user.name}`} onClick={() => void openView(user)}>↗</button>
                      <button className="icon-button" type="button" title="Edit user" aria-label={`Edit ${user.name}`} onClick={() => openEdit(user)}>✎</button>
                      <button className="icon-button" type="button" title="Reset password" aria-label={`Reset password for ${user.name}`} onClick={() => { setPasswordResetUser(user); setNewPassword(''); setPasswordResetError('') }}>↻</button>
                      <button className={`icon-button ${user.status === 'Active' ? 'icon-button--danger' : 'icon-button--success'}`} type="button" title={user.status === 'Active' ? 'Deactivate user' : 'Activate user'} aria-label={`${user.status === 'Active' ? 'Deactivate' : 'Activate'} ${user.name}`} onClick={() => toggleStatus(user)}>{user.status === 'Active' ? '⊘' : '✓'}</button>
                      <button className="icon-button icon-button--danger" type="button" title="Delete user" aria-label={`Delete ${user.name}`} onClick={() => removeUser(user)}>×</button>
                    </div></td>
                  </tr>
                ))
              )}
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

      {selectedUsers.size > 0 && (
        <div className="user-bulk-action-bar" role="region" aria-label="Bulk user actions">
          <span className="user-bulk-selection-count">
            {selectedUsers.size} selected
          </span>
          <button
            type="button"
            className="button button--primary"
            disabled={isBulkUpdating || isAssigningProjects || isLoading}
            onClick={() => void changeSelectedUsersStatus(true)}
          >
            Activate Selected
          </button>
          <button
            type="button"
            className="button button--secondary"
            disabled={isBulkUpdating || isAssigningProjects || isLoading}
            onClick={() => void changeSelectedUsersStatus(false)}
          >
            Deactivate Selected
          </button>
          <button
            type="button"
            className="button button--secondary"
            disabled={isBulkUpdating || isAssigningProjects || isLoading}
            onClick={openProjectAssignment}
          >
            Assign Projects
          </button>
          <button
            type="button"
            className="user-bulk-clear"
            disabled={isBulkUpdating || isAssigningProjects}
            onClick={() => setSelectedUsers(new Map())}
          >
            Clear
          </button>
        </div>
      )}

      <Modal
        isOpen={isProjectAssignmentOpen}
        onClose={closeProjectAssignment}
        kicker="PROJECT ASSIGNMENT"
        title="Add projects to selected users"
        size="sm"
      >
        <form className="user-form" onSubmit={assignProjectsToSelectedUsers}>
          <p>
            Add projects to {selectedUsers.size} selected user{selectedUsers.size === 1 ? '' : 's'}.
            Their current project assignments will be kept.
          </p>
          {projectAssignmentError && (
            <div className="inline-alert inline-alert--error" role="alert">
              {projectAssignmentError}
            </div>
          )}
          <fieldset className="project-assignment-options">
            <legend>Projects to add</legend>
            {projectOptions.map((project) => (
              <label className="project-assignment-option" key={project.id}>
                <input
                  type="checkbox"
                  checked={selectedProjectsToAdd.includes(project.id)}
                  disabled={isAssigningProjects || isLoading}
                  onChange={() => toggleProjectToAdd(project.id)}
                />
                <span>{project.name}</span>
              </label>
            ))}
          </fieldset>
          <div className="modal-actions" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <SecondaryButton onClick={closeProjectAssignment}>Cancel</SecondaryButton>
            <PrimaryButton
              type="submit"
              disabled={isAssigningProjects || isLoading || selectedProjectsToAdd.length === 0}
              isLoading={isAssigningProjects}
              loadingText="Assigning..."
            >
              Add projects
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        kicker="ACCESS CONTROL"
        title={editingId ? 'Edit user details' : 'Create user account'}
        size="md"
      >
        <form className="user-form" onSubmit={saveUser} noValidate>
          <p className="form-demo-hint">Changes are saved to the platform user directory.</p>
          {formError && <div className="inline-alert inline-alert--error" role="alert">{formError}</div>}
          <label className="field"><span>Full name <span className="required-mark">*</span></span><input autoComplete="name" maxLength={100} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></label>
          <label className="field"><span>Email address <span className="required-mark">*</span></span><input type="email" autoComplete="email" maxLength={254} value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} /></label>
          {!editingId && <label className="field"><span>Password <span className="required-mark">*</span></span><input type="password" autoComplete="new-password" minLength={8} maxLength={128} value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} required /></label>}
          <label className="field"><span>Role <span className="required-mark">*</span></span><select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))}>{roleOptions.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select></label>
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
                : 'Required. Select one or more projects.'}
            </span>
          </label>
          <div className="modal-actions" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <SecondaryButton onClick={closeForm}>Cancel</SecondaryButton>
            <PrimaryButton
              type="submit"
              disabled={isSaving || projectOptions.length === 0}
              isLoading={isSaving}
              loadingText="Saving..."
            >
              {editingId ? 'Save changes' : 'Create user'}
            </PrimaryButton>
          </div>
        </form>
      </Modal>

      <SideDrawer
        isOpen={Boolean(viewingUserPreview)}
        onClose={closeUserDetails}
        kicker="USER PROFILE & AUDIT"
        title={viewingUser?.fullName ?? viewingUserPreview?.name ?? 'User details'}
        description={viewingUser?.email ?? viewingUserPreview?.email}
        width="min(520px, 100vw)"
        bodyClassName="user-audit-drawer-body"
      >
        {isLoadingUserDetails && (
          <div className="user-audit-state" role="status">Loading user details and activity…</div>
        )}
        {userDetailsError && (
          <AlertMessage type="error" description={userDetailsError} />
        )}
        {(viewingUser || viewingUserPreview) && !isLoadingUserDetails && (
          <>
            <section className="user-audit-section" aria-labelledby="user-audit-account-heading">
              <h4 id="user-audit-account-heading">Account details</h4>
              <dl className="user-audit-details">
                <div><dt>User ID</dt><dd>{viewingUser?.id ?? viewingUserPreview?.userId}</dd></div>
                <div><dt>Role</dt><dd>{viewingUser?.role ?? viewingUserPreview?.role}</dd></div>
                <div>
                  <dt>Status</dt>
                  <dd>
                    <StatusBadge
                      status={viewingUser?.status === 'active' || viewingUserPreview?.status === 'Active' ? 'Active' : 'Inactive'}
                      size="sm"
                    />
                  </dd>
                </div>
                <div><dt>Phone</dt><dd>{viewingUser?.phoneNumber ?? viewingUserPreview?.phone ?? 'Not provided'}</dd></div>
                <div><dt>Created</dt><dd>{formatDateTime(viewingUser?.createdAt ?? viewingUserPreview?.createdAt)}</dd></div>
              </dl>
            </section>

            <section className="user-audit-section" aria-labelledby="user-audit-login-heading">
              <h4 id="user-audit-login-heading">Last login</h4>
              <dl className="user-audit-details">
                <div><dt>Date and time</dt><dd>{formatDateTime(viewingUser?.lastLoginAt)}</dd></div>
                <div><dt>IP address</dt><dd>{viewingUser?.lastLoginIp ?? 'Not recorded'}</dd></div>
                <div><dt>Device</dt><dd>{viewingUser?.lastLoginDevice ?? 'Not recorded'}</dd></div>
              </dl>
            </section>

            <section className="user-audit-section" aria-labelledby="user-audit-projects-heading">
              <h4 id="user-audit-projects-heading">Assigned projects</h4>
              {viewingUser?.assignedProjects.length ? (
                <ul className="user-audit-project-list">
                  {viewingUser.assignedProjects.map((project) => (
                    <li key={project.id}>
                      <strong>{project.name}</strong>
                      <span>Project ID: {project.id}</span>
                      {project.description && <span>{project.description}</span>}
                      {project.status && <span>Status: {project.status}</span>}
                      {project.assignedAt && <span>Assigned: {formatDateTime(project.assignedAt)}</span>}
                    </li>
                  ))}
                </ul>
              ) : !viewingUser && viewingUserPreview?.projects.length ? (
                <ul className="user-audit-project-list">
                  {viewingUserPreview.projects.map((project) => (
                    <li key={project}>
                      <strong>{project}</strong>
                      <span>Project details were not returned by the user details API.</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="user-audit-empty">
                  {viewingUser ? 'No project assignments are recorded.' : 'Project details are unavailable.'}
                </p>
              )}
            </section>

            <section className="user-audit-section" aria-labelledby="user-audit-history-heading">
              <h4 id="user-audit-history-heading">Historical activity</h4>
              {userActivityError && (
                <p className="user-audit-empty" role="alert">
                  Could not load audit activity: {userActivityError}
                </p>
              )}
              {viewingUser?.activityHistory?.length ? (
                <ol className="user-audit-timeline">
                  {viewingUser.activityHistory.map((activity) => (
                    <li key={activity.id}>
                      <div className="user-audit-activity-heading">
                        <strong>{activity.action}</strong>
                        <time dateTime={activity.createdAt}>{formatDateTime(activity.createdAt)}</time>
                      </div>
                      {activity.description && <p>{activity.description}</p>}
                      {(activity.before != null || activity.after != null) && (
                        <div className="user-audit-change">
                          {activity.before != null && (
                            <div>
                              <span>Before</span>
                              <pre>{formatAuditValue(activity.before)}</pre>
                            </div>
                          )}
                          {activity.after != null && (
                            <div>
                              <span>After</span>
                              <pre>{formatAuditValue(activity.after)}</pre>
                            </div>
                          )}
                        </div>
                      )}
                      {(activity.ipAddress || activity.device) && (
                        <span className="user-audit-activity-meta">
                          {[activity.ipAddress, activity.device].filter(Boolean).join(' · ')}
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="user-audit-empty">
                  {userActivityError
                    ? 'No activity records could be displayed.'
                    : viewingUser?.activityHistory
                      ? 'No historical activity is recorded.'
                      : 'Activity history is not available from the user details API.'}
                </p>
              )}
            </section>
          </>
        )}
      </SideDrawer>

      <Modal
        isOpen={Boolean(passwordResetUser)}
        onClose={closePasswordReset}
        kicker="ACCOUNT SECURITY"
        title="Reset password"
        size="sm"
      >
        {passwordResetUser && (
          <form className="user-form" onSubmit={submitPasswordReset}>
            <p>Set a new password for {passwordResetUser.name}.</p>
            {passwordResetError && <div className="inline-alert inline-alert--error" role="alert">{passwordResetError}</div>}
            <label className="field"><span>New password <span className="required-mark">*</span></span><input type="password" autoComplete="new-password" minLength={8} maxLength={128} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /></label>
            <div className="modal-actions" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <SecondaryButton onClick={closePasswordReset}>Cancel</SecondaryButton>
              <PrimaryButton
                type="submit"
                disabled={isResettingPassword}
                isLoading={isResettingPassword}
                loadingText="Saving..."
              >
                Reset password
              </PrimaryButton>
            </div>
          </form>
        )}
      </Modal>
      </div>
    </ResponsiveLayout>
  )
}

export default UserManagementPage
