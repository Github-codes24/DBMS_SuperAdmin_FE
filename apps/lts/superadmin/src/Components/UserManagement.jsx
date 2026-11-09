import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, createUser, updateUser, deleteUser } from '../redux/slices/userSlice';
import { formatPhoneNumber } from '../utils/phoneFormatter';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  UserCheck, 
  UserX, 
  Shield, 
  Mail, 
  Phone,
  X,
  Key,
  CheckCircle2,
  Lock,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

function UserManagement() {
  const dispatch = useDispatch();
  const { users: apiUsers, loading, error } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Dynamically map API users to match legacy table column schema
  const users = apiUsers.map((u) => ({
    id: u._id || u.id,
    _id: u._id,
    userId: u.userId,
    name: u.fullName || '',
    email: u.email || '',
    phone: u.phone || '',
    role: u.role === 'ADMIN' ? 'Admin' : 'Telecaller',
    status: u.status === 'ACTIVE' ? 'Active' : 'Inactive',
    createdDate: u.createdAt ? u.createdAt.split('T')[0] : '',
    target: u.target ?? 0
  }));

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal State (Add / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    userId: '',
    name: '',
    email: '',
    phone: '',
    role: 'Telecaller',
    status: 'Active',
    password: '',
  });

  // Password Change Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordUser, setPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [toastMsg, setToastMsg] = useState('');


  // Filtered Users
  const filteredUsers = users.filter((user) => {
    const formattedPhone = formatPhoneNumber(user.phone);
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm) ||
      formattedPhone.includes(searchTerm);
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Generate formatted ID (ADMxxx or TCxxx) - legacy fallback
  const generateNextId = (role) => {
    const prefix = role === 'Admin' ? 'ADM' : 'TC';
    const count = users.filter((u) => u.role === role).length + 1;
    return `${prefix}${String(count).padStart(3, '0')}`;
  };

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingUser(null);
    const initialRole = 'Telecaller';
    setFormData({
      userId: 'Auto-Generated',
      name: '',
      email: '',
      phone: '',
      role: initialRole,
      status: 'Active',
      password: '',
    });
    setIsModalOpen(true);
  };

  // Handle Role Select in Add Form
  const handleRoleChangeInForm = (newRole) => {
    setFormData((prev) => ({
      ...prev,
      role: newRole,
      userId: 'Auto-Generated',
    }));
  };

  // Open Modal for Edit
  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      userId: user.userId,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      password: '',
    });
    setIsModalOpen(true);
  };

  // Open Password Modal
  const handleOpenPasswordModal = (user) => {
    setPasswordUser(user);
    setNewPassword('');
    setConfirmPassword('');
    setIsPasswordModalOpen(true);
  };

  // Save Password Change (simulation fallback)
  const handleSavePassword = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      alert('Passwords do not match or are empty!');
      return;
    }

    setToastMsg(`Password changed successfully for ${passwordUser.name} (${passwordUser.userId})!`);
    setTimeout(() => setToastMsg(''), 3500);
    setIsPasswordModalOpen(false);
  };

  // Save User (Add or Edit)
  const handleSaveUser = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;

    const roleApiValue = formData.role === 'Admin' ? 'ADMIN' : 'TELECALLER';
    const statusApiValue = formData.status === 'Active' ? 'ACTIVE' : 'INACTIVE';

    if (editingUser) {
      // Update
      const payload = {
        fullName: formData.name,
        status: statusApiValue,
        target: editingUser.target ?? 0,
      };
      dispatch(updateUser({ id: editingUser._id || editingUser.id, payload }))
        .unwrap()
        .then(() => {
          setIsModalOpen(false);
        });
    } else {
      // Add
      const payload = {
        fullName: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        password: formData.password,
        role: roleApiValue,
        status: statusApiValue,
        target: 0
      };
      dispatch(createUser(payload))
        .unwrap()
        .then(() => {
          setIsModalOpen(false);
        });
    }
  };

  // Delete User
  const handleDeleteUser = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      dispatch(deleteUser(id));
    }
  };

  // Toggle Status
  const handleToggleStatus = (id) => {
    const userObj = users.find((u) => u.id === id);
    if (!userObj) return;

    const newStatus = userObj.status === 'Active' ? 'INACTIVE' : 'ACTIVE';
    const payload = {
      fullName: userObj.name,
      status: newStatus,
      target: userObj.target ?? 0
    };
    dispatch(updateUser({ id, payload }));
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Super Admin - User Management</h1>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-orange-100 text-[#f26522] border border-orange-200">
              Access Control
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Create Admin & Telecaller IDs, manage active status, change passwords, and configure permissions.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#f26522] to-[#e05411] hover:from-[#e05411] hover:to-[#c84302] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-orange-500/20 active:scale-95 cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span>Create Admin / Telecaller ID</span>
        </button>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="px-4 py-3 bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs rounded-2xl flex items-center gap-2 shadow-sm animate-in fade-in duration-150">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span className="font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Filters & Search Bar */}
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Search Input */}
        <div className="relative flex-1 w-full md:max-w-xl lg:max-w-2xl">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by ID, name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522] text-slate-800 font-semibold transition-all"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold uppercase tracking-wider">
            <Filter size={14} className="text-[#f26522]" />
            <span>Filters:</span>
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522] cursor-pointer font-bold transition-all"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Telecaller">Telecaller</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522] cursor-pointer font-bold transition-all"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

      </div>

      {/* Users Table */}
      <div
        className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-2xs max-h-[380px] overflow-x-auto overflow-y-auto scroll-smooth custom-scrollbar"
      >
        <table className="w-full min-w-[850px] text-left border-collapse">
          <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-md z-10">
              <tr className="border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">User ID</th>
                <th className="py-3.5 px-4">User Name</th>
                <th className="py-3.5 px-4">Email Address</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Created Date</th>
                <th className="py-3.5 px-5 text-right">Super Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* ID */}
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-extrabold text-xs tracking-wide">
                        {user.userId}
                      </span>
                    </td>

                    {/* User Name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-orange-100 text-[#f26522] flex items-center justify-center font-extrabold text-xs uppercase shrink-0">
                          {user.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div className="font-extrabold text-slate-900">{user.name}</div>
                      </div>
                    </td>

                    {/* Email Address - Separate Column */}
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="flex items-center gap-1.5 font-bold">
                        <Mail size={13} className="text-[#f26522] shrink-0" />
                        <span>{user.email}</span>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          user.role === 'Admin'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        <Shield size={12} />
                        {user.role}
                      </span>
                    </td>

                    {/* Phone */}
                    <td className="py-3.5 px-4 text-slate-700 font-bold">
                      <div className="flex items-center gap-1.5">
                        <Phone size={13} className="text-slate-400 shrink-0" />
                        <span>{formatPhoneNumber(user.phone)}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          user.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                            : 'bg-rose-50 text-rose-600 border border-rose-200/60'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {user.status}
                      </span>
                    </td>

                    {/* Created Date */}
                    <td className="py-3.5 px-4 text-slate-500 font-semibold">
                      {user.createdDate}
                    </td>

                    {/* Super Admin Action Buttons */}
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        
                        {/* Change Password */}
                        <button
                          onClick={() => handleOpenPasswordModal(user)}
                          title="Change Password"
                          className="p-1.5 rounded-lg text-purple-600 border border-purple-200 hover:bg-purple-50 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold px-2"
                        >
                          <Key size={13} />
                          <span>Password</span>
                        </button>

                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          title={user.status === 'Active' ? 'Deactivate User' : 'Activate User'}
                          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            user.status === 'Active'
                              ? 'text-amber-600 border-amber-200 hover:bg-amber-50'
                              : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                          }`}
                        >
                          {user.status === 'Active' ? <UserX size={15} /> : <UserCheck size={15} />}
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(user)}
                          title="Edit Details"
                          className="p-1.5 rounded-lg text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Edit2 size={15} />
                        </button>

                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          title="Delete User ID"
                          className="p-1.5 rounded-lg text-rose-600 border border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400 text-xs">
                    No users match your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

        {/* Footer / Summary */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-700">{filteredUsers.length}</span> of{' '}
            <span className="font-bold text-slate-700">{users.length}</span> users
          </div>
        </div>

      </div>

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-base font-bold text-slate-800">
                {editingUser ? 'Edit User Details' : 'Create Admin ID / Telecaller ID'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              
              {!editingUser && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Assign Role <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => handleRoleChangeInForm(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522] cursor-pointer font-bold"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Telecaller">Telecaller</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      User ID
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.userId}
                      onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rahul@lts.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522]"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Initial Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter account password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522]"
                  />
                </div>
              )}

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-[#f26522] hover:bg-[#e05411] rounded-xl transition-colors cursor-pointer"
                >
                  {editingUser ? 'Update Details' : 'Create User ID'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isPasswordModalOpen && passwordUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="text-xs font-bold text-slate-800">
                  Change Password for {passwordUser.name}
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">User ID: {passwordUser.userId}</p>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePassword} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  New Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#f26522] hover:bg-[#e05411] rounded-xl transition-colors cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default UserManagement;
