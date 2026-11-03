import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Menu, Pencil, Plus, RotateCcw, Save, Search, ShieldCheck, Check, Trash2, } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import CreateRoleModal from './CreateRoleModal';
import { createProjectRole, deleteProjectRole, getProjectRole, getRoleMatrix, listProjectRoles, listRoleActions, listRoleProjects, savePermissions, updateProjectRole, } from './rolesService';
import './rolesPermissions.css';
const modules = [
    { key: 'dashboard', name: 'Dashboard', description: 'View the platform overview and key activity.' },
    { key: 'user-management', name: 'User Management', description: 'Manage user accounts and information.' },
    { key: 'roles-permissions', name: 'Roles & Permissions', description: 'Manage role access and permissions.' },
    { key: 'reports', name: 'Reports', description: 'View and generate platform reports.' },
];
const previewPermissionColumns = ['View Access', 'Edit / Update', 'Import Data', 'Delete Access'];
const createPermissions = (permissions, enabled = false) => Object.fromEntries(modules.map(({ name }) => [
    name,
    Object.fromEntries(permissions.map((permission) => [permission, enabled])),
]));
function RolesPermissionsPage() {
    // Previous local preview role data is retained for reference; API data now populates this page.
    // const previewRoles = initialRoleOptions
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [roleOptions, setRoleOptions] = useState([]);
    const [selectedRoleId, setSelectedRoleId] = useState('');
    const [actions, setActions] = useState([]);
    const [permissionState, setPermissionState] = useState({});
    const [expectedVersion, setExpectedVersion] = useState();
    const [filter, setFilter] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCreateRoleOpen, setIsCreateRoleOpen] = useState(false);
    const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');
    const [apiError, setApiError] = useState('');
    const [isLoadingProjects, setIsLoadingProjects] = useState(true);
    const [isLoadingRoles, setIsLoadingRoles] = useState(false);
    const [isLoadingMatrix, setIsLoadingMatrix] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const selectedRole = roleOptions.find((role) => role.id === selectedRoleId);
    const permissionColumns = useMemo(() => actions.length ? actions.map((action) => action.label) : previewPermissionColumns, [actions]);
    const fullPermissionHeaders = ['Full Access', ...permissionColumns];
    const visibleModules = useMemo(() => modules.filter(({ name, description }) => `${name} ${description}`.toLowerCase().includes(filter.trim().toLowerCase())), [filter]);
    const selectedPermissions = permissionState[selectedRoleId] ?? createPermissions(permissionColumns);
    const activePermissions = Object.values(selectedPermissions).reduce((total, modulePermissions) => total + Object.values(modulePermissions).filter(Boolean).length, 0);
    const showFullAccess = Boolean(selectedRole && /super\s*admin/i.test(selectedRole.name));
    const tableHeaders = showFullAccess ? fullPermissionHeaders : permissionColumns;
    const totalPermissions = modules.length * permissionColumns.length;
    useEffect(() => {
        const controller = new AbortController();
        Promise.all([listRoleProjects(controller.signal), listRoleActions(controller.signal)])
            .then(([projectList, actionList]) => {
            setProjects(projectList);
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
            if (!controller.signal.aborted)
                setIsLoadingProjects(false);
        });
        return () => controller.abort();
    }, []);
    useEffect(() => {
        if (!selectedProjectId)
            return;
        const controller = new AbortController();
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
            if (!controller.signal.aborted)
                setIsLoadingRoles(false);
        });
        return () => controller.abort();
    }, [selectedProjectId]);
    useEffect(() => {
        if (!selectedProjectId || !selectedRoleId)
            return;
        const controller = new AbortController();
        Promise.all([
            getProjectRole(selectedProjectId, selectedRoleId, controller.signal),
            getRoleMatrix(selectedProjectId, selectedRoleId, controller.signal),
        ])
            .then(([role, matrix]) => {
            const state = createPermissions(permissionColumns);
            for (const permission of matrix.permissions) {
                const [moduleKey, actionKey] = permission.split(':');
                const moduleName = modules.find((module) => module.key === moduleKey)?.name;
                const action = actions.find((candidate) => candidate.key === actionKey);
                if (moduleName && action)
                    state[moduleName][action.label] = true;
            }
            setRoleOptions((current) => current.map((item) => item.id === role.id ? role : item));
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
            if (!controller.signal.aborted)
                setIsLoadingMatrix(false);
        });
        return () => controller.abort();
    }, [actions, permissionColumns, selectedProjectId, selectedRoleId]);
    function changeProject(projectId) {
        setSelectedProjectId(projectId);
        setRoleOptions([]);
        setSelectedRoleId('');
        setPermissionState({});
        setExpectedVersion(undefined);
        setIsLoadingRoles(Boolean(projectId));
        setIsLoadingMatrix(false);
        setApiError('');
    }
    function changeRole(roleId) {
        setSelectedRoleId(roleId);
        setExpectedVersion(undefined);
        setIsLoadingMatrix(Boolean(roleId));
        setApiError('');
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
        if (!selectedProjectId)
            throw new Error('Select a project before creating a role.');
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
        if (!selectedProjectId || !selectedRole)
            throw new Error('Select a role before editing it.');
        if (roleOptions.some((role) => role.id !== selectedRole.id && role.name.toLowerCase() === title.toLowerCase())) {
            throw new Error('A role with this title already exists.');
        }
        const updatedRole = await updateProjectRole(selectedProjectId, selectedRole.id, {
            name: title,
            description,
            moduleKeys: selectedRole.moduleKeys,
            isActive: selectedRole.isActive,
        });
        setRoleOptions((current) => current.map((role) => role.id === updatedRole.id ? updatedRole : role));
        setApiError('');
        setSaveMessage('Role updated.');
    }
    async function deleteRole() {
        if (!selectedProjectId || !selectedRole)
            return;
        if (!window.confirm(`Delete the "${selectedRole.name}" role? This cannot be undone.`))
            return;
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
        }
        catch (error) {
            setApiError(error instanceof Error ? error.message : 'Could not delete the role.');
        }
        finally {
            setIsDeleting(false);
        }
    }
    async function saveRolePermissions() {
        if (!selectedProjectId || !selectedRoleId || expectedVersion === undefined) {
            setApiError('Select a role with a loaded permission matrix before saving.');
            return;
        }
        setIsSaving(true);
        setApiError('');
        try {
            const permissions = modules.flatMap((module) => actions
                .filter((action) => selectedPermissions[module.name]?.[action.label])
                .map((action) => `${module.key}:${action.key}`));
            await savePermissions(selectedProjectId, selectedRoleId, expectedVersion, permissions);
            const savedMatrix = await getRoleMatrix(selectedProjectId, selectedRoleId);
            const state = createPermissions(permissionColumns);
            for (const permission of savedMatrix.permissions) {
                const [moduleKey, actionKey] = permission.split(':');
                const moduleName = modules.find((module) => module.key === moduleKey)?.name;
                const action = actions.find((candidate) => candidate.key === actionKey);
                if (moduleName && action)
                    state[moduleName][action.label] = true;
            }
            setPermissionState((current) => ({ ...current, [selectedRoleId]: state }));
            setExpectedVersion(savedMatrix.version);
            setSaveMessage('Permissions saved.');
        }
        catch (error) {
            setApiError(error instanceof Error ? error.message : 'Could not save permissions.');
        }
        finally {
            setIsSaving(false);
        }
    }
    const isLoading = isLoadingProjects || isLoadingRoles || isLoadingMatrix;
    return (<div className="roles-page">
      <header className="roles-navbar">
        <button className="roles-menu-button" type="button" aria-label="Open navigation menu" onClick={() => setSidebarOpen(true)}>
          <Menu size={21}/>
        </button>
        <div className="roles-brand">
          <span className="roles-brand-mark"><ShieldCheck size={19}/></span>
          <span>DBMS <strong>SUPER ADMIN</strong></span>
        </div>
        <div className="roles-navbar-section">ROLES &amp; PERMISSIONS</div>
        <button className="roles-profile" type="button">
          <span className="roles-profile-avatar">SA</span>
          <span>Super Admin</span>
          <ChevronDown size={15}/>
        </button>
      </header>

      <div className="roles-workspace">
        {sidebarOpen && <button className="roles-backdrop" type="button" aria-label="Close navigation menu" onClick={() => setSidebarOpen(false)}/>}
        <AdminSidebar drawer open={sidebarOpen} onNavigate={() => setSidebarOpen(false)}/>

        <main className="roles-main">
          <section className="roles-header-card">
            <div className="roles-header-copy">
              <div className="roles-title-row">
                <span className="roles-title-icon"><ShieldCheck size={25} strokeWidth={2}/></span>
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
                <Plus size={16}/>Add New Role
              </button>
              <button className="roles-action-button roles-save-button" type="button" disabled={!selectedRoleId || isLoading || isSaving} onClick={saveRolePermissions}>
                <Save size={16}/>{isSaving ? 'Saving...' : 'Save Permissions'}
              </button>
            </div>
          </section>

          <section className="roles-permissions-card" aria-label="Roles permissions">
            <div className="roles-toolbar">
              <div className="roles-role-info">
                <div className="roles-role-avatar"><ShieldCheck size={20}/></div>
                <div className="roles-role-copy">
                  <div className="roles-role-title">
                    <h2>Roles</h2>
                    <label className="roles-role-select-wrap">
                      <span className="roles-visually-hidden">Select project</span>
                      <select className="roles-role-select" value={selectedProjectId} onChange={(event) => changeProject(event.target.value)} aria-label="Select project" disabled={isLoadingProjects || projects.length === 0}>
                        {projects.length === 0 && <option value="">{isLoadingProjects ? 'Loading projects...' : 'No projects available'}</option>}
                        {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                      </select>
                      <ChevronDown size={14} aria-hidden="true"/>
                    </label>
                    <label className="roles-role-select-wrap">
                      <span className="roles-visually-hidden">Select role</span>
                      <select className="roles-role-select" value={selectedRoleId} onChange={(event) => changeRole(event.target.value)} aria-label="Select role" disabled={isLoadingRoles || roleOptions.length === 0}>
                        {roleOptions.length === 0 && <option value="">{isLoadingRoles ? 'Loading roles...' : 'No roles available'}</option>}
                        {roleOptions.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
                      </select>
                      <ChevronDown size={14} aria-hidden="true"/>
                    </label>
                    <span className="roles-count-badge">{activePermissions} of {totalPermissions} Privileges Active</span>
                  </div>
                  <p>{selectedRole ? `Configure module-specific access rights for ${selectedRole.name}.` : 'Select a project and role to configure access.'}</p>
                </div>
              </div>
              <div className="roles-toolbar-controls">
                {selectedRole && (<>
                    <button className="roles-control-button" type="button" disabled={isLoading || isDeleting} onClick={() => setIsEditRoleOpen(true)}>
                      <Pencil size={14}/>Edit Role
                    </button>
                    <button className="roles-control-button" type="button" disabled={isLoading || isDeleting || selectedRole.isSystem} aria-label={`Delete ${selectedRole.name}`} onClick={deleteRole}>
                      <Trash2 size={14}/>{isDeleting ? 'Deleting...' : 'Delete Role'}
                    </button>
                  </>)}
                <label className="roles-search">
                  <Search size={15}/>
                  <input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter modules..." aria-label="Filter modules"/>
                </label>
                <button className="roles-control-button roles-reset-button" type="button" disabled={!selectedRoleId || isLoading} onClick={() => {
            setPermissionState((current) => ({ ...current, [selectedRoleId]: createPermissions(permissionColumns) }));
            setFilter('');
            setSaveMessage('');
        }}>
                  <RotateCcw size={14}/>Reset
                </button>
              </div>
            </div>

            {apiError && <p className="roles-api-error" role="alert">{apiError}</p>}

            <div className="roles-table-scroll">
              <table className={`roles-table${showFullAccess ? '' : ' roles-table--without-full-access'}`}>
                <colgroup>
                  <col className="roles-module-column"/>
                  {tableHeaders.map((permission) => <col key={permission}/>)}
                </colgroup>
                <thead>
                  <tr>
                    <th scope="col">Module / Resource</th>
                    {tableHeaders.map((permission) => <th scope="col" key={permission}>{permission}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {visibleModules.map(({ name, description }) => (<tr key={name}>
                      <td className="roles-module-cell">
                        <div className="roles-module-name">{name}</div>
                        <div className="roles-module-description">{description}</div>
                      </td>
                      {showFullAccess && (<td className="roles-select-cell">
                          <button className="roles-select-all" type="button" disabled={!selectedRoleId || isLoading} onClick={() => {
                    const allSelected = permissionColumns.every((permission) => selectedPermissions[name]?.[permission]);
                    setModulePermissions(name, !allSelected);
                }}>Select All</button>
                        </td>)}
                      {permissionColumns.map((permission) => {
                const checked = Boolean(selectedPermissions[name]?.[permission]);
                return (<td className="roles-permission-cell" key={permission}>
                            <button className={`roles-permission-toggle${checked ? ' roles-permission-toggle--checked' : ''}`} type="button" aria-label={`${name}: ${permission}`} aria-pressed={checked} disabled={!selectedRoleId || isLoading} onClick={() => setPermission(name, permission)}>
                              {checked && <Check size={16} strokeWidth={2.6}/>}
                            </button>
                          </td>);
            })}
                    </tr>))}
                  {visibleModules.length === 0 && (<tr><td className="roles-empty-cell" colSpan={tableHeaders.length + 1}>No modules match “{filter}”.</td></tr>)}
                </tbody>
              </table>
            </div>
            <div className="roles-card-footer">
              <span><i /> {isLoading ? 'Loading roles and permissions...' : saveMessage || 'Changes are local until saved.'}</span>
              <div className="roles-footer-actions">
                <span>{saveMessage || `${visibleModules.length} modules`}</span>
                <button className="roles-action-button roles-save-button" type="button" disabled={!selectedRoleId || isLoading || isSaving} onClick={saveRolePermissions}>
                  <Save size={15}/>{isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
      {isCreateRoleOpen && (<CreateRoleModal mode="create" roleOptions={roleOptions.map(({ id, name }) => ({ id, name }))} onClose={() => setIsCreateRoleOpen(false)} onSubmit={createRole}/>)}
      {isEditRoleOpen && selectedRole && (<CreateRoleModal mode="edit" roleOptions={roleOptions.map(({ id, name }) => ({ id, name }))} roleId={selectedRole.id} initialTitle={selectedRole.name} initialDescription={selectedRole.description} onClose={() => setIsEditRoleOpen(false)} onSubmit={updateRole}/>)}
    </div>);
}
export default RolesPermissionsPage;
