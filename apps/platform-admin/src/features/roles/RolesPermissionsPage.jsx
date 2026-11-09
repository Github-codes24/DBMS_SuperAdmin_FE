import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Pencil, Plus, RotateCcw, Save, ShieldCheck, Check, Trash2 } from 'lucide-react';
import ResponsiveLayout from '../../components/layout/ResponsiveLayout';
import { useToast, useConfirm } from '../../context';
import { TableSkeletonRows, NoSearchResults } from '../../components/feedback';
import { StatusBadge, TableSearch } from '../../components/data-display';
import { AlertMessage } from '../../components/notifications';
import { PrimaryButton, SecondaryButton, DangerButton } from '../../components/ui/buttons';
import CreateRoleModal from './CreateRoleModal';
import {
  createProjectRole,
  deleteProjectRole,
  getProjectRole,
  getRoleMatrix,
  listProjectRoles,
  listRoleActions,
  listRoleProjects,
  savePermissions,
  updateProjectRole,
  listChildProjectRoles,
  listChildProjectModules,
  saveChildProjectRolePermissions,
} from './rolesService';
import { listProjects } from '../projects/projectService';
import './rolesPermissions.css';

const defaultModules = [
  { key: 'dashboard', name: 'Dashboard', description: 'View the platform overview and key activity.' },
  { key: 'user-management', name: 'User Management', description: 'Manage user accounts and information.' },
  { key: 'roles-permissions', name: 'Roles & Permissions', description: 'Manage role access and permissions.' },
  { key: 'reports', name: 'Reports', description: 'View and generate platform reports.' },
];

const previewPermissionColumns = ['View Access', 'Edit / Update', 'Import Data', 'Delete Access'];

const createPermissions = (permissions, mods = defaultModules, enabled = false) =>
  Object.fromEntries(
    mods.map(({ name }) => [
      name,
      Object.fromEntries(permissions.map((permission) => [permission, enabled])),
    ])
  );

function RolesPermissionsPage() {
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const [selectedScope, setSelectedScope] = useState('platform'); // 'platform' or child project ID
  const [projects, setProjects] = useState([]);
  const [managedProjects, setManagedProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [customModules, setCustomModules] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [actions, setActions] = useState([]);
  const [permissionState, setPermissionState] = useState({});
  const [expectedVersion, setExpectedVersion] = useState();
  const [filter, setFilter] = useState('');
  const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [apiError, setApiError] = useState('');
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [isLoadingMatrix, setIsLoadingMatrix] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const activeModules = selectedScope === 'platform' ? defaultModules : customModules;
  const selectedRole = roleOptions.find((role) => role.id === selectedRoleId);
  const permissionColumns = useMemo(
    () => (actions.length ? actions.map((action) => action.label) : previewPermissionColumns),
    [actions]
  );
  const fullPermissionHeaders = ['Full Access', ...permissionColumns];
  const visibleModules = useMemo(
    () =>
      activeModules.filter(({ name, description }) =>
        `${name} ${description}`.toLowerCase().includes(filter.trim().toLowerCase())
      ),
    [activeModules, filter]
  );

  const selectedPermissions =
    permissionState[selectedRoleId] ?? createPermissions(permissionColumns, activeModules);
  const activePermissions = Object.values(selectedPermissions).reduce(
    (total, modulePermissions) =>
      total + Object.values(modulePermissions).filter(Boolean).length,
    0
  );
  const showFullAccess = Boolean(
    selectedRole && (/super\s*admin/i.test(selectedRole.name) || selectedRole.isMasterRole)
  );
  const tableHeaders = showFullAccess ? fullPermissionHeaders : permissionColumns;
  const totalPermissions = activeModules.length * permissionColumns.length;

  // Initial load of Platform projects, actions, and managed projects
  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      listRoleProjects(controller.signal),
      listRoleActions(controller.signal),
      listProjects(controller.signal).catch(() => []),
    ])
      .then(([projectList, actionList, managedList]) => {
        setProjects(projectList);
        setManagedProjects(managedList);
        setActions(actionList);
        const firstProjectId = projectList[0]?.id ?? '';
        setSelectedProjectId(firstProjectId);
        setIsLoadingRoles(Boolean(firstProjectId));
        setApiError('');
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setApiError(error instanceof Error ? error.message : 'Could not load projects and actions.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingProjects(false);
      });
    return () => controller.abort();
  }, []);

  // Fetch roles and modules when selectedScope or selectedProjectId changes
  useEffect(() => {
    const controller = new AbortController();

    if (selectedScope === 'platform') {
      if (!selectedProjectId) {
        return () => controller.abort();
      }
      listProjectRoles(selectedProjectId, controller.signal)
        .then((roles) => {
          setRoleOptions(roles);
          setSelectedRoleId(roles[0]?.id ?? '');
          setIsLoadingMatrix(Boolean(roles[0]?.id));
          setExpectedVersion(undefined);
          setApiError('');
          setSaveMessage('');
        })
        .catch((error) => {
          if (!controller.signal.aborted) {
            setRoleOptions([]);
            setSelectedRoleId('');
            setApiError(error instanceof Error ? error.message : 'Could not load project roles.');
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsLoadingRoles(false);
        });
    } else {
      // Child Project Scope (e.g. LTS)
      Promise.all([
        listChildProjectModules(selectedScope, controller.signal),
        listChildProjectRoles(selectedScope, controller.signal),
      ])
        .then(([childModules, childRoles]) => {
          const normalizedModules = (childModules || []).map((m) => ({
            key: m.moduleKey,
            name: m.name,
            description: m.description || '',
          }));
          setCustomModules(normalizedModules);

          const normalizedRoles = (childRoles || []).map((r) => ({
            id: r.roleId || r._id,
            name: r.title,
            description: r.description || '',
            isMasterRole: Boolean(r.isMasterRole),
            permissions: r.permissions || [],
          }));
          setRoleOptions(normalizedRoles);

          const firstRole = normalizedRoles[0];
          setSelectedRoleId(firstRole?.id ?? '');
          setExpectedVersion(undefined);
          setApiError('');
          setSaveMessage('');

          // Initialize permission matrix for child roles
          const newState = {};
          normalizedRoles.forEach((role) => {
            const state = {};
            normalizedModules.forEach((mod) => {
              const modPerm = (role.permissions || []).find((p) => p.moduleKey === mod.key);
              state[mod.name] = {
                'View Access': Boolean(modPerm?.viewAccess || role.isMasterRole),
                'Edit / Update': Boolean(modPerm?.editAccess || role.isMasterRole),
                'Import Data': Boolean(modPerm?.exportAccess || role.isMasterRole),
                'Delete Access': Boolean(modPerm?.deleteAccess || role.isMasterRole),
              };
            });
            newState[role.id] = state;
          });
          setPermissionState(newState);
        })
        .catch((error) => {
          if (!controller.signal.aborted) {
            setRoleOptions([]);
            setSelectedRoleId('');
            setCustomModules([]);
            setApiError(
              error instanceof Error ? error.message : 'Could not load child project roles and modules.'
            );
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setIsLoadingRoles(false);
            setIsLoadingMatrix(false);
          }
        });
    }

    return () => controller.abort();
  }, [selectedScope, selectedProjectId]);

  // Fetch matrix for platform role when selectedRoleId changes
  useEffect(() => {
    if (selectedScope !== 'platform' || !selectedProjectId || !selectedRoleId) return;
    const controller = new AbortController();
    Promise.all([
      getProjectRole(selectedProjectId, selectedRoleId, controller.signal),
      getRoleMatrix(selectedProjectId, selectedRoleId, controller.signal),
    ])
      .then(([role, matrix]) => {
        const state = createPermissions(permissionColumns, defaultModules);
        for (const permission of matrix.permissions) {
          const [moduleKey, actionKey] = permission.split(':');
          const moduleName = defaultModules.find((module) => module.key === moduleKey)?.name;
          const action = actions.find((candidate) => candidate.key === actionKey);
          if (moduleName && action) state[moduleName][action.label] = true;
        }
        setRoleOptions((current) =>
          current.map((item) => (item.id === role.id ? role : item))
        );
        setPermissionState((current) => ({ ...current, [selectedRoleId]: state }));
        setExpectedVersion(matrix.version);
        setApiError('');
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setApiError(error instanceof Error ? error.message : 'Could not load role permissions.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoadingMatrix(false);
      });
    return () => controller.abort();
  }, [actions, permissionColumns, selectedProjectId, selectedRoleId, selectedScope]);

  function changeScope(scopeId) {
    setSelectedScope(scopeId);
    setSelectedRoleId('');
    setRoleOptions([]);
    setExpectedVersion(undefined);
    setIsLoadingRoles(true);
    setIsLoadingMatrix(true);
    setApiError('');
    setSaveMessage('');
    setFilter('');
  }

  function changeProject(projectId) {
    setSelectedProjectId(projectId);
    setRoleOptions([]);
    setSelectedRoleId('');
    setPermissionState({});
    setExpectedVersion(undefined);
    setIsLoadingRoles(Boolean(projectId));
    setIsLoadingMatrix(false);
    setApiError('');
    setSaveMessage('');
  }

  function changeRole(roleId) {
    setSelectedRoleId(roleId);
    setExpectedVersion(undefined);
    if (selectedScope === 'platform') {
      setIsLoadingMatrix(Boolean(roleId));
    }
    setApiError('');
    setSaveMessage('');
  }

  function setModulePermissions(moduleName, value) {
    setPermissionState((current) => ({
      ...current,
      [selectedRoleId]: {
        ...current[selectedRoleId],
        [moduleName]: Object.fromEntries(permissionColumns.map((permission) => [permission, value])),
      },
    }));
    setSaveMessage('');
  }

  function setPermission(moduleName, permission) {
    setPermissionState((current) => ({
      ...current,
      [selectedRoleId]: {
        ...current[selectedRoleId],
        [moduleName]: {
          ...current[selectedRoleId]?.[moduleName],
          [permission]: !current[selectedRoleId]?.[moduleName]?.[permission],
        },
      },
    }));
    setSaveMessage('');
  }

  async function createRole(title, description, cloneFrom) {
    if (!selectedProjectId) throw new Error('Select a project before creating a role.');
    if (roleOptions.some((role) => role.name.toLowerCase() === title.toLowerCase())) {
      throw new Error('A role with this title already exists.');
    }
    const sourceRole = roleOptions.find((role) => role.id === cloneFrom);
    const createdRole = await createProjectRole(selectedProjectId, {
      name: title,
      description,
      moduleKeys: sourceRole?.moduleKeys ?? [],
    });
    setRoleOptions((current) => [...current, createdRole]);
    setSelectedRoleId(createdRole.id);
    setExpectedVersion(undefined);
    setIsLoadingMatrix(true);
    setApiError('');
    setSaveMessage('');
  }

  async function updateRole(title, description) {
    if (!selectedProjectId || !selectedRole) throw new Error('Select a role before editing it.');
    if (
      roleOptions.some(
        (role) => role.id !== selectedRole.id && role.name.toLowerCase() === title.toLowerCase()
      )
    ) {
      throw new Error('A role with this title already exists.');
    }
    const updatedRole = await updateProjectRole(selectedProjectId, selectedRole.id, {
      name: title,
      description,
      moduleKeys: selectedRole.moduleKeys,
      isActive: selectedRole.isActive,
    });
    setRoleOptions((current) =>
      current.map((role) => (role.id === updatedRole.id ? updatedRole : role))
    );
    setApiError('');
    setSaveMessage('Role updated.');
  }

  async function deleteRole() {
    if (!selectedProjectId || !selectedRole) return;
    const confirmed = await confirm({
      title: `Delete Role: ${selectedRole.name}`,
      message: `Are you sure you want to delete the "${selectedRole.name}" role? This cannot be undone.`,
      confirmText: 'Delete Role',
      confirmVariant: 'danger',
    });
    if (!confirmed) return;
    setIsDeleting(true);
    setApiError('');
    try {
      await deleteProjectRole(selectedProjectId, selectedRole.id);
      const remainingRoles = roleOptions.filter((role) => role.id !== selectedRole.id);
      setRoleOptions(remainingRoles);
      setPermissionState((current) => {
        const next = { ...current };
        delete next[selectedRole.id];
        return next;
      });
      setSelectedRoleId(remainingRoles[0]?.id ?? '');
      setExpectedVersion(undefined);
      setIsLoadingMatrix(Boolean(remainingRoles[0]?.id));
      setSaveMessage('Role deleted.');
      toast.success(`Role "${selectedRole.name}" deleted successfully.`);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Could not delete the role.');
      toast.error(error instanceof Error ? error.message : 'Could not delete the role.');
    } finally {
      setIsDeleting(false);
    }
  }

  async function saveRolePermissions() {
    if (selectedScope === 'platform') {
      if (!selectedProjectId || !selectedRoleId || expectedVersion === undefined) {
        setApiError('Select a role with a loaded permission matrix before saving.');
        return;
      }
      setIsSaving(true);
      setApiError('');
      try {
        const permissions = activeModules.flatMap((module) =>
          actions
            .filter((action) => selectedPermissions[module.name]?.[action.label])
            .map((action) => `${module.key}:${action.key}`)
        );
        await savePermissions(selectedProjectId, selectedRoleId, expectedVersion, permissions);
        const savedMatrix = await getRoleMatrix(selectedProjectId, selectedRoleId);
        const state = createPermissions(permissionColumns, defaultModules);
        for (const permission of savedMatrix.permissions) {
          const [moduleKey, actionKey] = permission.split(':');
          const moduleName = defaultModules.find((module) => module.key === moduleKey)?.name;
          const action = actions.find((candidate) => candidate.key === actionKey);
          if (moduleName && action) state[moduleName][action.label] = true;
        }
        setPermissionState((current) => ({ ...current, [selectedRoleId]: state }));
        setExpectedVersion(savedMatrix.version);
        setSaveMessage('Permissions saved.');
        toast.success('Permissions saved successfully.');
      } catch (error) {
        setApiError(error instanceof Error ? error.message : 'Could not save permissions.');
        toast.error(error instanceof Error ? error.message : 'Could not save permissions.');
      } finally {
        setIsSaving(false);
      }
    } else {
      // Child Project Scope (e.g. LTS)
      if (!selectedRoleId) {
        setApiError('Select a role before saving permissions.');
        return;
      }
      setIsSaving(true);
      setApiError('');
      try {
        const childTargetProject = managedProjects.find((p) => p.id === selectedScope);
        const formattedPermissions = activeModules.map((module) => ({
          moduleKey: module.key,
          moduleName: module.name,
          fullAccess: Boolean(showFullAccess),
          viewAccess: Boolean(selectedPermissions[module.name]?.['View Access']),
          editAccess: Boolean(selectedPermissions[module.name]?.['Edit / Update']),
          exportAccess: Boolean(
            selectedPermissions[module.name]?.['Import Data'] ||
              selectedPermissions[module.name]?.['Export Access']
          ),
          deleteAccess: Boolean(selectedPermissions[module.name]?.['Delete Access']),
        }));

        await saveChildProjectRolePermissions(selectedScope, selectedRoleId, formattedPermissions);
        setSaveMessage('Permissions saved to child project database.');
        toast.success(
          `Permissions for ${selectedRole?.name || 'role'} saved in ${childTargetProject?.name || 'child'} database.`
        );
      } catch (error) {
        setApiError(
          error instanceof Error ? error.message : 'Could not save child project permissions.'
        );
        toast.error(
          error instanceof Error ? error.message : 'Could not save child project permissions.'
        );
      } finally {
        setIsSaving(false);
      }
    }
  }

  const isLoading = isLoadingProjects || isLoadingRoles || isLoadingMatrix;
  const currentChildProject = managedProjects.find((p) => p.id === selectedScope);

  const headerActions = (
    <div className="roles-header-actions" style={{ display: 'flex', gap: '8px' }}>
      {selectedScope === 'platform' && (
        <SecondaryButton icon={<Plus size={16} />} onClick={() => setIsCreateRoleOpen(true)}>
          Add New Role
        </SecondaryButton>
      )}
      <PrimaryButton
        icon={<Save size={16} />}
        disabled={!selectedRoleId || isLoading || isSaving}
        isLoading={isSaving}
        loadingText="Saving..."
        onClick={saveRolePermissions}
      >
        Save Permissions
      </PrimaryButton>
    </div>
  );

  return (
    <ResponsiveLayout
      title="Roles & Permissions Management"
      description="Super Admin master control plane to audit, configure and manage module permissions across Platform Core and child applications."
      icon={<ShieldCheck size={25} strokeWidth={2} />}
      headerActions={headerActions}
    >
      <section className="roles-permissions-card" aria-label="Roles permissions">
        {/* Project Scope Tabs */}
        <div className="roles-scope-tabs" role="tablist" aria-label="Role management scope">
          <button
            type="button"
            role="tab"
            aria-selected={selectedScope === 'platform'}
            className={`roles-scope-tab ${selectedScope === 'platform' ? 'roles-scope-tab--active' : ''}`}
            onClick={() => changeScope('platform')}
          >
            <span>Platform Core</span>
            <span
              className="roles-scope-tag"
              style={{ backgroundColor: 'var(--color-primary, #f96321)' }}
            >
              CORE
            </span>
          </button>
          {managedProjects.map((proj) => (
            <button
              key={proj.id}
              type="button"
              role="tab"
              aria-selected={selectedScope === proj.id}
              className={`roles-scope-tab ${selectedScope === proj.id ? 'roles-scope-tab--active' : ''}`}
              onClick={() => changeScope(proj.id)}
            >
              <span>{proj.name}</span>
              <span
                className="roles-scope-tag"
                style={{ backgroundColor: proj.theme || 'var(--color-primary, #f96321)' }}
              >
                {proj.projectCode || 'CHILD'}
              </span>
            </button>
          ))}
        </div>

        <div className="roles-toolbar">
          <div className="roles-role-info">
            <div className="roles-role-avatar">
              <ShieldCheck size={20} />
            </div>
            <div className="roles-role-copy">
              <div className="roles-role-title">
                <h2>Roles</h2>
                {selectedScope === 'platform' ? (
                  <label className="roles-role-select-wrap">
                    <span className="roles-visually-hidden">Select project</span>
                    <select
                      className="roles-role-select"
                      value={selectedProjectId}
                      onChange={(event) => changeProject(event.target.value)}
                      aria-label="Select project"
                      disabled={isLoadingProjects || projects.length === 0}
                    >
                      {projects.length === 0 && (
                        <option value="">
                          {isLoadingProjects ? 'Loading projects...' : 'No projects available'}
                        </option>
                      )}
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={14} aria-hidden="true" />
                  </label>
                ) : (
                  <span
                    className="roles-scope-tag"
                    style={{
                      backgroundColor: currentChildProject?.theme || 'var(--color-primary, #f96321)',
                      fontSize: '11px',
                      padding: '3px 8px',
                    }}
                  >
                    {currentChildProject?.name || 'CHILD APP'}
                  </span>
                )}
                <label className="roles-role-select-wrap">
                  <span className="roles-visually-hidden">Select role</span>
                  <select
                    className="roles-role-select"
                    value={selectedRoleId}
                    onChange={(event) => changeRole(event.target.value)}
                    aria-label="Select role"
                    disabled={isLoadingRoles || roleOptions.length === 0}
                  >
                    {roleOptions.length === 0 && (
                      <option value="">
                        {isLoadingRoles ? 'Loading roles...' : 'No roles available'}
                      </option>
                    )}
                    {roleOptions.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} aria-hidden="true" />
                </label>
                <StatusBadge
                  status={`${activePermissions} of ${totalPermissions} Privileges Active`}
                  variant="primary"
                  size="sm"
                  dot={false}
                />
              </div>
              <p>
                {selectedRole
                  ? `Configure module-specific access rights for ${selectedRole.name}${selectedScope !== 'platform' ? ` in ${currentChildProject?.name || 'child project'}` : ''}.`
                  : 'Select a project and role to configure access.'}
              </p>
            </div>
          </div>
          <div
            className="roles-toolbar-controls"
            style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}
          >
            {selectedScope === 'platform' && selectedRole && (
              <>
                <SecondaryButton
                  size="sm"
                  icon={<Pencil size={14} />}
                  disabled={isLoading || isDeleting}
                  onClick={() => setIsEditRoleOpen(true)}
                >
                  Edit Role
                </SecondaryButton>
                <DangerButton
                  size="sm"
                  icon={<Trash2 size={14} />}
                  disabled={isLoading || isDeleting || selectedRole.isSystem}
                  aria-label={`Delete ${selectedRole.name}`}
                  isLoading={isDeleting}
                  loadingText="Deleting..."
                  onClick={deleteRole}
                >
                  Delete Role
                </DangerButton>
              </>
            )}
            <TableSearch
              value={filter}
              onChange={setFilter}
              placeholder="Filter modules..."
              onClear={() => setFilter('')}
            />
            <SecondaryButton
              size="sm"
              icon={<RotateCcw size={14} />}
              disabled={!selectedRoleId || isLoading}
              onClick={() => {
                setPermissionState((current) => ({
                  ...current,
                  [selectedRoleId]: createPermissions(permissionColumns, activeModules),
                }));
                setFilter('');
                setSaveMessage('');
              }}
            >
              Reset
            </SecondaryButton>
          </div>
        </div>

        {apiError && <AlertMessage variant="error" message={apiError} onClose={() => setApiError('')} />}

        <div className="roles-table-scroll">
          <table className={`roles-table${showFullAccess ? '' : ' roles-table--without-full-access'}`}>
            <colgroup>
              <col className="roles-module-column" />
              {tableHeaders.map((permission) => (
                <col key={permission} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th scope="col">Module / Resource</th>
                {tableHeaders.map((permission) => (
                  <th scope="col" key={permission}>
                    {permission}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoadingMatrix ? (
                <TableSkeletonRows rows={activeModules.length} columns={tableHeaders.length + 1} />
              ) : visibleModules.length === 0 ? (
                <tr>
                  <td colSpan={tableHeaders.length + 1} style={{ padding: 0, border: 'none' }}>
                    <NoSearchResults query={filter} onClearSearch={() => setFilter('')} />
                  </td>
                </tr>
              ) : (
                visibleModules.map(({ name, description }) => (
                  <tr key={name}>
                    <td className="roles-module-cell">
                      <div className="roles-module-name">{name}</div>
                      <div className="roles-module-description">{description}</div>
                    </td>
                    {showFullAccess && (
                      <td className="roles-select-cell">
                        <button
                          className="roles-select-all"
                          type="button"
                          disabled={!selectedRoleId || isLoading}
                          onClick={() => {
                            const allSelected = permissionColumns.every(
                              (permission) => selectedPermissions[name]?.[permission]
                            );
                            setModulePermissions(name, !allSelected);
                          }}
                        >
                          Select All
                        </button>
                      </td>
                    )}
                    {permissionColumns.map((permission) => {
                      const checked = Boolean(selectedPermissions[name]?.[permission]);
                      return (
                        <td className="roles-permission-cell" key={permission}>
                          <button
                            className={`roles-permission-toggle${checked ? ' roles-permission-toggle--checked' : ''}`}
                            type="button"
                            aria-label={`${name}: ${permission}`}
                            aria-pressed={checked}
                            disabled={!selectedRoleId || isLoading}
                            onClick={() => setPermission(name, permission)}
                          >
                            {checked && <Check size={16} strokeWidth={2.6} />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="roles-card-footer">
          <span>
            <i /> {isLoading ? 'Loading roles and permissions...' : saveMessage || 'Changes are local until saved.'}
          </span>
          <div className="roles-footer-actions">
            <span>{saveMessage || `${visibleModules.length} modules`}</span>
            <PrimaryButton
              size="sm"
              icon={<Save size={15} />}
              disabled={!selectedRoleId || isLoading || isSaving}
              isLoading={isSaving}
              loadingText="Saving..."
              onClick={saveRolePermissions}
            >
              Save Changes
            </PrimaryButton>
          </div>
        </div>
      </section>
      {isCreateRoleOpen && (
        <CreateRoleModal
          mode="create"
          roleOptions={roleOptions.map(({ id, name }) => ({ id, name }))}
          onClose={() => setIsCreateRoleOpen(false)}
          onSubmit={createRole}
        />
      )}
      {isEditRoleOpen && selectedRole && (
        <CreateRoleModal
          mode="edit"
          roleOptions={roleOptions.map(({ id, name }) => ({ id, name }))}
          roleId={selectedRole.id}
          initialTitle={selectedRole.name}
          initialDescription={selectedRole.description}
          onClose={() => setIsEditRoleOpen(false)}
          onSubmit={updateRole}
        />
      )}
    </ResponsiveLayout>
  );
}

export default RolesPermissionsPage;
