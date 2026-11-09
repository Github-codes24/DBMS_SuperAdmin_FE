import api from '../../api/axiosClient';
function record(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new Error('The roles API returned an invalid response.');
    }
    return value;
}
function unwrap(value) {
    if (typeof value !== 'object' || value === null || Array.isArray(value))
        return value;
    const response = value;
    return response.data ?? value;
}
function list(value, key) {
    const data = unwrap(value);
    if (Array.isArray(data))
        return data;
    const entries = record(data)[key];
    if (!Array.isArray(entries))
        throw new Error(`The roles API returned an invalid ${key} list.`);
    return entries;
}
function requiredString(value, field) {
    if (typeof value !== 'string' && typeof value !== 'number') {
        throw new Error(`The roles API response is missing ${field}.`);
    }
    return String(value);
}
function parseProject(value) {
    const project = record(value);
    return {
        id: requiredString(project.id ?? project._id ?? project.projectId, 'a project ID'),
        name: requiredString(project.name ?? project.projectName ?? project.title, 'a project name'),
    };
}
function parseRole(value) {
    const role = record(value);
    const moduleKeys = role.moduleKeys ?? [];
    if (!Array.isArray(moduleKeys) || moduleKeys.some((key) => typeof key !== 'string')) {
        throw new Error('The roles API returned invalid module keys.');
    }
    const version = role.version ?? role.expectedVersion ?? role.__v;
    return {
        id: requiredString(role.id ?? role._id ?? role.roleId, 'a role ID'),
        name: requiredString(role.name, 'a role name'),
        description: typeof role.description === 'string' ? role.description : '',
        moduleKeys,
        isActive: typeof role.isActive === 'boolean' ? role.isActive : true,
        ...(typeof version === 'number' ? { version } : {}),
    };
}
function errorMessage(value) {
    if (typeof value === 'string')
        return value;
    if (typeof value !== 'object' || value === null || Array.isArray(value))
        return undefined;
    const body = value;
    if (typeof body.message === 'string')
        return body.message;
    if (typeof body.error === 'string')
        return body.error;
    if (typeof body.msg === 'string')
        return body.msg;
    return undefined;
}
async function request(path, init = {}) {
    const method = (init.method || 'GET').toUpperCase();
    let data;
    if (init.body) {
        try {
            data = typeof init.body === 'string' ? JSON.parse(init.body) : init.body;
        } catch {
            data = init.body;
        }
    }

    try {
        const response = await api({
            url: path,
            method,
            data,
            signal: init.signal,
        });
        return response.data;
    } catch (error) {
        if (error.response?.status === 401) {
            throw new Error('Your session has expired. Please sign in again.');
        }
        const message =
            errorMessage(error.response?.data) ||
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.message ||
            'Request failed.';
        throw new Error(message);
    }
}
export async function listRoleProjects(signal) {
    const response = await request('/platform/projects', { signal });
    return list(response, 'projects').map(parseProject);
}
export async function listRoleActions(signal) {
    const response = await request('/platform/actions', { signal });
    const actions = list(response, 'actions').map((value) => {
        const action = typeof value === 'string' ? { key: value } : record(value);
        const key = requiredString(action.key ?? action.actionKey ?? action.name ?? action.id, 'an action key')
            .toLowerCase()
            .replace(/[-_ ]/g, '');
        const labelValue = action.label ?? action.displayName ?? action.name;
        const labels = {
            view: 'View Access',
            read: 'View Access',
            edit: 'Edit / Update',
            update: 'Edit / Update',
            import: 'Import Data',
            delete: 'Delete Access',
        };
        const normalizedKey = key === 'read' ? 'view' : key === 'update' ? 'edit' : key;
        return {
            key: normalizedKey,
            label: typeof labelValue === 'string' ? labelValue : labels[normalizedKey] ?? normalizedKey,
        };
    });
    if (!actions.length)
        throw new Error('The roles API returned no actions.');
    return [...new Map(actions.map((action) => [action.key, action])).values()];
}
export async function listProjectRoles(projectId, signal) {
    const response = await request(`/platform/projects/${encodeURIComponent(projectId)}/roles`, { signal });
    return list(response, 'roles').map(parseRole);
}
export async function getProjectRole(projectId, roleId, signal) {
    const response = await request(`/platform/projects/${encodeURIComponent(projectId)}/roles/${encodeURIComponent(roleId)}`, { signal });
    const data = record(unwrap(response));
    return parseRole(data.role ?? data);
}
export async function getRoleMatrix(projectId, roleId, signal) {
    const response = await request(`/platform/projects/${encodeURIComponent(projectId)}/roles/${encodeURIComponent(roleId)}/matrix`, { signal });
    const data = record(unwrap(response));
    const matrix = record(data.matrix ?? data);
    const values = matrix.permissions;
    if (!Array.isArray(values))
        throw new Error('The roles API returned an invalid permissions matrix.');
    const permissions = values.map((value) => {
        if (typeof value === 'string')
            return value;
        const item = record(value);
        if (typeof item.key === 'string')
            return item.key;
        if (typeof item.moduleKey === 'string' && typeof item.action === 'string') {
            return `${item.moduleKey}:${item.action}`;
        }
        throw new Error('The roles API returned an invalid permission entry.');
    });
    const version = matrix.version ?? matrix.expectedVersion ?? matrix.__v;
    if (typeof version !== 'number') {
        throw new Error('The permissions matrix did not include a version required for saving.');
    }
    return { permissions, version };
}
export async function createProjectRole(projectId, input) {
    const response = await request(`/platform/projects/${encodeURIComponent(projectId)}/roles`, {
        method: 'POST',
        body: JSON.stringify(input),
    });
    return parseRole(record(unwrap(response)).role ?? unwrap(response));
}
export async function updateProjectRole(projectId, roleId, input) {
    const response = await request(`/platform/projects/${encodeURIComponent(projectId)}/roles/${encodeURIComponent(roleId)}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
    });
    const data = unwrap(response);
    if (data === undefined) {
        return {
            id: roleId,
            ...input,
        };
    }
    return parseRole(record(data).role ?? data);
}
export async function deleteProjectRole(projectId, roleId) {
    await request(`/platform/projects/${encodeURIComponent(projectId)}/roles/${encodeURIComponent(roleId)}`, { method: 'DELETE' });
}
export async function savePermissions(projectId, roleId, expectedVersion, permissions) {
    await request(`/platform/projects/${encodeURIComponent(projectId)}/roles/${encodeURIComponent(roleId)}/permissions`, {
        method: 'PUT',
        body: JSON.stringify({ expectedVersion, permissions }),
    });
}
