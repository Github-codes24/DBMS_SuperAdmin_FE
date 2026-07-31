import React, { useState, useRef } from 'react';
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
  // Initial Mock Users List with Admin ID and Telecaller ID
  const [users, setUsers] = useState([
    {
      id: 1,
      userId: 'ADM001',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@lts.com',
      phone: '+91 98765 43210',
      role: 'Admin',
      status: 'Active',
      createdDate: '2026-01-15',
    },
    {
      id: 2,
      userId: 'TC014',
      name: 'Amit Verma',
      email: 'amit.verma@lts.com',
      phone: '+91 97654 32109',
      role: 'Telecaller',
      status: 'Active',
      createdDate: '2026-02-10',
    },
    {
      id: 3,
      userId: 'TC021',
      name: 'Neha Joshi',
      email: 'neha.joshi@lts.com',
      phone: '+91 98123 45678',
      role: 'Telecaller',
      status: 'Active',
      createdDate: '2026-02-01',
    },
    {
      id: 4,
      userId: 'ADM002',
      name: 'Neha Singh',
      email: 'neha.singh@lts.com',
      phone: '+91 94321 09876',
      role: 'Admin',
      status: 'Active',
      createdDate: '2026-04-01',
    },
    {
      id: 5,
      userId: 'TC031',
      name: 'Ravi Singh',
      email: 'ravi.singh@lts.com',
      phone: '+91 96543 21098',
      role: 'Telecaller',
      status: 'Inactive',
      createdDate: '2026-03-05',
    },
  ]);

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

  // Manual Scroll Ref & Control (No Automatic Timer)
  const manualScrollRef = useRef(null);
  const handleManualScroll = (direction) => {
    if (manualScrollRef.current) {
      const scrollAmount = direction === 'up' ? -90 : 90;
      manualScrollRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    }
  };

  // Filtered Users
  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Generate formatted ID (ADMxxx or TCxxx)
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
      userId: generateNextId(initialRole),
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
      userId: editingUser ? prev.userId : generateNextId(newRole),
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

  // Save Password Change
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

    if (editingUser) {
      // Update
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id ? { ...u, ...formData } : u
        )
      );
      setToastMsg(`User ${formData.name} updated successfully!`);
    } else {
      // Add
      const newUser = {
        id: Date.now(),
        ...formData,
        userId: formData.userId || generateNextId(formData.role),
        createdDate: new Date().toISOString().split('T')[0],
      };
      setUsers((prev) => [newUser, ...prev]);
      setToastMsg(`Created new ${formData.role} ID ${newUser.userId} successfully!`);
    }

    setTimeout(() => setToastMsg(''), 3500);
    setIsModalOpen(false);
  };

  // Delete User
  const handleDeleteUser = (id) => {
    if (window.confirm('Are you sure you want to delete this user ID?')) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    }
  };

  // Toggle Status
  const handleToggleStatus = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' }
          : u
      )
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Super Admin - User Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Create Admin ID & Telecaller ID, assign roles, change passwords, and manage permissions.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 bg-[#f26522] hover:bg-[#e05411] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
        >
          <Plus size={16} />
          <span>Create Admin / Telecaller ID</span>
        </button>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="px-4 py-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 size={16} />
          <span className="font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-4 justify-between items-center">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by ID, name, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522] text-slate-700"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Filter size={14} />
            <span>Filters:</span>
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522] cursor-pointer font-semibold"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Telecaller">Telecaller</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522] cursor-pointer font-semibold"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

      </div>

      {/* MANUAL SLIDING CONTROL BAR */}
      <div className="flex items-center justify-between bg-white border border-slate-200/80 rounded-2xl px-4 py-2 text-xs shadow-2xs">
        <span className="text-xs font-bold text-slate-700">Manual Slide / Scroll View</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleManualScroll('up')}
            className="p-1 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold px-2.5 py-1"
            title="Slide Up"
          >
            <ChevronUp size={13} />
            <span>Slide Up</span>
          </button>
          <button
            onClick={() => handleManualScroll('down')}
            className="p-1 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-bold px-2.5 py-1"
            title="Slide Down"
          >
            <ChevronDown size={13} />
            <span>Slide Down</span>
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div
        ref={manualScrollRef}
        className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs max-h-[350px] overflow-x-auto overflow-y-auto scroll-smooth custom-scrollbar"
      >
        <table className="w-full min-w-[750px] text-left border-collapse">
          <thead className="sticky top-0 bg-slate-100/90 backdrop-blur-xs z-10">
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">User ID</th>
                <th className="py-3.5 px-5">User Info</th>
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

                    {/* User Info */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-orange-100 text-[#f26522] flex items-center justify-center font-bold text-xs uppercase">
                          {user.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">{user.name}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Mail size={12} />
                            {user.email}
                          </div>
                        </div>
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
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      <div className="flex items-center gap-1">
                        <Phone size={12} className="text-slate-400" />
                        {user.phone}
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
                    <td className="py-3.5 px-4 text-slate-500">
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
                  <td colSpan="7" className="py-8 text-center text-slate-400 text-xs">
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
