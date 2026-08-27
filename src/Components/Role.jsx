import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchRoles, 
  fetchRolePermissions, 
  updateRolePermissions, 
  grantAllPermissions, 
  createRole,
  toggleLocalPermission,
  toggleLocalResourceAll,
  revokeLocalAll
} from "../redux/slices/roleSlice";
import { 
  ShieldCheck, 
  Shield, 
  Check, 
  X, 
  Plus, 
  Search, 
  RotateCcw, 
  Save, 
  Users, 
  Lock, 
  Unlock, 
  Info,
  AlertCircle,
  CheckCircle2,
  Trash2
} from "lucide-react";

const Role = () => {
  const [activeRole, setActiveRole] = useState("super_admin");
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState(null);
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  const [newRoleData, setNewRoleData] = useState({ label: "", description: "", cloneFrom: "" });
  const [isSaving, setIsSaving] = useState(false);

  const dispatch = useDispatch();
  const { roles: apiRoles, activePermissions, loading, permissionsLoading } = useSelector((state) => state.role);

  useEffect(() => {
    dispatch(fetchRoles());
  }, [dispatch]);

  // Set first role as active when roles list loads
  useEffect(() => {
    if (apiRoles.length > 0 && activeRole === "super_admin" && !apiRoles.some(r => r.roleId === "super_admin")) {
      setActiveRole(apiRoles[0].roleId);
    }
  }, [apiRoles, activeRole]);

  useEffect(() => {
    if (activeRole) {
      dispatch(fetchRolePermissions(activeRole));
    }
  }, [activeRole, dispatch]);

  const showNotification = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const getBadgeColor = (title) => {
    const t = title.toLowerCase();
    if (t.includes('super')) return "bg-purple-100 text-purple-700 border-[#f26522]/20";
    if (t.includes('admin')) return "bg-blue-100 text-blue-700 border-[#f26522]/20";
    if (t.includes('telecaller')) return "bg-amber-100 text-[#f26522] border-[#f26522]/20";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  // Map backend roles to match component interface
  const roles = apiRoles.map((r) => ({
    id: r.roleId,
    label: r.title,
    description: r.description || "Custom system role.",
    userCount: r.activePrivilegesCount ?? 0,
    badgeColor: getBadgeColor(r.title)
  }));

  const resources = [
    { key: "Customers", label: "Customer Database", description: "Manage customer profiles, history, and status." },
    { key: "Vendors", label: "Vendor Database", description: "Access and approve vendor profiles & documentation." },
    { key: "Queries", label: "Customer & Vendor Queries", description: "Handle customer and vendor inquiries or tickets." },
    { key: "Reports", label: "Analytics & Reports", description: "Generate and download business performance reports." },
    { key: "AuditLogs", label: "System Audit Logs", description: "View system security events and user activity trails." },
    { key: "UserManagement", label: "User Management", description: "Create, edit, or disable team accounts and roles." }
  ];

  const actions = [
    { key: "view", label: "View Access" },
    { key: "edit", label: "Edit / Update" },
    { key: "export", label: "Export Data" },
    { key: "delete", label: "Delete Access" }
  ];

  const currentRolePerms = activePermissions || {
    Customers: { view: false, edit: false, export: false, delete: false },
    Vendors: { view: false, edit: false, export: false, delete: false },
    Queries: { view: false, edit: false, export: false, delete: false },
    Reports: { view: false, edit: false, export: false, delete: false },
    AuditLogs: { view: false, edit: false, export: false, delete: false },
    UserManagement: { view: false, edit: false, export: false, delete: false }
  };

  const handleToggle = (resourceKey, actionKey) => {
    dispatch(toggleLocalPermission({ resourceKey, actionKey }));
  };

  const handleToggleResourceAll = (resourceKey) => {
    const resourceObj = currentRolePerms[resourceKey] || {};
    const allChecked = actions.every((act) => resourceObj[act.key]);
    dispatch(toggleLocalResourceAll({ resourceKey, value: !allChecked }));
  };

  const handleGrantAll = () => {
    dispatch(grantAllPermissions(activeRole));
    showNotification(`Granted all permissions to ${roles.find(r => r.id === activeRole)?.label || activeRole}!`, "info");
  };

  const handleRevokeAll = () => {
    dispatch(revokeLocalAll());
    showNotification(`Revoked all permissions locally. Click 'Save Changes' to update the system.`, "warning");
  };

  const handleResetToDefault = () => {
    dispatch(fetchRolePermissions(activeRole));
    showNotification(`Reset permissions to system defaults.`);
  };

  const handleSave = () => {
    if (isSaving) return;
    setIsSaving(true);

    const resourceKeyToModuleKey = {
      Customers: "CUSTOMER_DATABASE",
      Vendors: "VENDOR_DATABASE",
      Queries: "CUSTOMER_VENDOR_QUERIES",
      Reports: "ANALYTICS_REPORTS",
      AuditLogs: "SYSTEM_AUDIT_LOGS",
      UserManagement: "USER_MANAGEMENT"
    };

    const permissionsPayload = Object.keys(currentRolePerms).map((resKey) => {
      const moduleKey = resourceKeyToModuleKey[resKey];
      const actionsObj = currentRolePerms[resKey];
      return {
        moduleKey,
        fullAccess: actionsObj.view && actionsObj.edit && actionsObj.export && actionsObj.delete,
        viewAccess: actionsObj.view,
        editAccess: actionsObj.edit,
        exportAccess: actionsObj.export,
        deleteAccess: actionsObj.delete
      };
    });

    dispatch(updateRolePermissions({ roleId: activeRole, permissions: permissionsPayload }))
      .unwrap()
      .finally(() => {
        setIsSaving(false);
      });
  };

  const handleCreateRole = (e) => {
    e.preventDefault();
    if (!newRoleData.label.trim()) return;

    dispatch(createRole({
      title: newRoleData.label.trim(),
      description: newRoleData.description.trim() || "Custom user role.",
      cloneFromRole: newRoleData.cloneFrom
    })).unwrap().then((response) => {
      setIsAddRoleModalOpen(false);
      if (response?.role?.roleId) {
        setActiveRole(response.role.roleId);
      }
      setNewRoleData({ label: "", description: "", cloneFrom: "" });
    });
  };

  const filteredResources = resources.filter((res) =>
    res.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    res.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeRoleObj = roles.find((r) => r.id === activeRole) || { label: "Loading..." };

  // Calculate enabled count stats
  const totalPossible = resources.length * actions.length;
  let enabledCount = 0;
  resources.forEach((res) => {
    actions.forEach((act) => {
      if (currentRolePerms[res.key]?.[act.key]) {
        enabledCount++;
      }
    });
  });

  if (loading && apiRoles.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 min-h-[400px]">
        <div className="w-10 h-10 border-4 border-[#f26522] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-600 font-sans">Loading system roles and permissions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-slate-800 pb-8">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border transition-all transform duration-300 ${
            notification.type === "warning"
              ? "bg-amber-50 border-amber-200 text-amber-800"
              : notification.type === "info"
              ? "bg-sky-50 border-sky-200 text-sky-800"
              : "bg-emerald-50 border-emerald-200 text-emerald-800"
          }`}
        >
          {notification.type === "warning" ? (
            <AlertCircle size={18} className="text-amber-500 shrink-0" />
          ) : (
            <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
          )}
          <span className="text-xs font-semibold">{notification.msg}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-orange-100 rounded-xl text-[#f26522]">
              <ShieldCheck size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Roles & Permissions Management
                </h1>
                <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  <Lock size={12} />
                  Super Admin Access Only
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Only <strong>Super Admin</strong> has master access to assign and manage module permissions (View, Edit, Export, Delete) for <strong>Admin</strong> and <strong>Telecaller</strong> roles.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Logged in: <strong>Super Admin</strong></span>
          </div>

          <button
            type="button"
            onClick={() => setIsAddRoleModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Add New Role</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#f26522] hover:bg-[#d95516] disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer active:scale-98"
          >
            <Save size={16} />
            <span>{isSaving ? "Saving..." : "Save Permissions"}</span>
          </button>
        </div>
      </div>

      {/* Role Selection Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {roles.map((role) => {
          const isActive = activeRole === role.id;
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => setActiveRole(role.id)}
              className={`text-left p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                isActive
                  ? "bg-white border-[#f26522] shadow-md ring-2 ring-[#f26522]/20"
                  : "bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-xs"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-bold text-sm text-slate-900 truncate">
                    {role.label}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${role.badgeColor}`}
                  >
                    {role.id === "super_admin" ? "Master Control" : "Managed by Super Admin"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                  {role.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-medium text-slate-400">
                <span className="flex items-center gap-1">
                  <Shield size={12} className={isActive ? "text-[#f26522]" : "text-slate-400"} />
                  {role.id === "super_admin" ? "Unrestricted Master Access" : "Configurable Privileges"}
                </span>
                {isActive && (
                  <span className="text-[#f26522] font-semibold text-[11px]">Active</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Matrix Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        {/* Active Role Bar & Controls */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-[#f26522] flex items-center justify-center font-bold text-base">
              {activeRoleObj.label.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  {activeRoleObj.label} Permissions
                </h2>
                <span className="text-[11px] font-medium text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-md">
                  {enabledCount} of {totalPossible} Privileges Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure module-specific access rights for this role below.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Filter */}
            <div className="relative flex-1 sm:flex-initial min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleGrantAll}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Grant All
            </button>
            <button
              type="button"
              onClick={handleRevokeAll}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Revoke All
            </button>
            <button
              type="button"
              onClick={handleResetToDefault}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          </div>
        </div>

        {/* Permissions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-[11px] font-bold uppercase tracking-wider border-b border-slate-200/60">
                <th className="py-3.5 px-6 min-w-[260px]">Module / Resource</th>
                <th className="py-3.5 px-4 text-center min-w-[120px]">Full Access</th>
                {actions.map((act) => (
                  <th key={act.key} className="py-3.5 px-4 text-center min-w-[110px]">
                    {act.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredResources.length > 0 ? (
                filteredResources.map((res) => {
                  const resPerms = currentRolePerms[res.key] || {};
                  const isAllChecked = actions.every((act) => resPerms[act.key]);

                  return (
                    <tr
                      key={res.key}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Resource Name & Desc */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-800 text-xs">
                          {res.label}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                          {res.description}
                        </div>
                      </td>

                      {/* Full Module Toggle */}
                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleResourceAll(res.key)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            isAllChecked
                              ? "bg-orange-50 text-[#f26522] border-[#f26522]/40"
                              : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          {isAllChecked ? "Full Module" : "Select All"}
                        </button>
                      </td>

                      {/* Action Checkboxes */}
                      {actions.map((act) => {
                        const isChecked = Boolean(resPerms[act.key]);
                        return (
                          <td key={act.key} className="py-4 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggle(res.key, act.key)}
                              className={`w-7 h-7 mx-auto rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                                isChecked
                                  ? "bg-[#f26522] text-white shadow-xs hover:bg-[#d95516] ring-2 ring-[#f26522]/20"
                                  : "bg-slate-100 text-slate-300 hover:bg-slate-200 hover:text-slate-400 border border-slate-200/80"
                              }`}
                              title={`${isChecked ? "Revoke" : "Grant"} ${act.label} for ${res.label}`}
                            >
                              {isChecked ? <Check size={14} strokeWidth={3} /> : <X size={12} />}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No modules match your search query "{searchQuery}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-2">
            <Info size={14} className="text-slate-400" />
            <span>Changes take effect immediately upon saving.</span>
          </div>

          <div className="flex items-center gap-3 font-semibold text-slate-700">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-[#f26522] hover:bg-[#d95516] disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              {isSaving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Add New Role Modal */}
      {isAddRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-800">
                <ShieldCheck size={20} className="text-[#f26522]" />
                <h3 className="font-bold text-base">Create New Role</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddRoleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Role Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Regional Supervisor"
                  value={newRoleData.label}
                  onChange={(e) => setNewRoleData({ ...newRoleData, label: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Briefly describe the responsibilities of this role..."
                  value={newRoleData.description}
                  onChange={(e) => setNewRoleData({ ...newRoleData, description: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Clone Initial Permissions From
                </label>
                <select
                  value={newRoleData.cloneFrom}
                  onChange={(e) => setNewRoleData({ ...newRoleData, cloneFrom: e.target.value })}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522]"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddRoleModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#f26522] hover:bg-[#d95516] text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Create Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Role;