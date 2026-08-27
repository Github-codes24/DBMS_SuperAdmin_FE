import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutAdmin } from '../redux/slices/authSlice';
import { 
  ChevronDown, 
  UserCircle, 
  LogOut, 
  Bell, 
  ShieldCheck, 
  Settings, 
  Sparkles,
  Calendar,
  CheckCircle2,
  X,
  Mail,
  Phone,
  Lock,
  Key,
  Camera,
  Save,
  Check,
  Globe,
  Sliders,
  BellRing,
  Shield,
  User
} from 'lucide-react';

function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState('2026-2027');
  
  // Profile & Settings Modal States
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState('profile'); // 'profile' | 'settings'
  const [toastMsg, setToastMsg] = useState('');

  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  const { user } = useSelector((state) => state.auth);

  const initialEmail = user?.email || localStorage.getItem('userEmail') || 'superadmin@lts.com';
  const initialName = user?.fullName || localStorage.getItem('userName') || 'Rahul Sharma';

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: initialName,
    email: initialEmail,
    phone: '+91 98765 43210',
    designation: 'Senior Super Admin & Chief Data Officer',
    jurisdiction: 'All India Master Operations',
    avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
  });

  // Sync profile form when user profile is updated in Redux store
  useEffect(() => {
    if (user) {
      setProfileForm((prev) => ({
        ...prev,
        name: user.fullName || prev.name,
        email: user.email || prev.email,
        avatar: user.avatar || prev.avatar,
      }));
    }
  }, [user]);

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    enable2FA: true,
    notifyEmail: true,
    syncInterval: 'Realtime',
  });

  const notifications = [
    { id: 1, title: 'New Vendor Request', desc: '17 new vendor approval requests pending', time: '10m ago', unread: true },
    { id: 2, title: 'Quality Audit Complete', desc: 'Today audit milestone 1000+ reached', time: '1h ago', unread: true },
    { id: 3, title: 'System Security', desc: 'Roles & permissions updated by Super Admin', time: '2h ago', unread: false },
  ];

  const handleLogout = () => {
    dispatch(logoutAdmin())
      .unwrap()
      .finally(() => {
        navigate('/', { replace: true });
      });
  };

  // Open Modal Helper
  const handleOpenModal = (tab) => {
    setActiveModalTab(tab);
    setIsDropdownOpen(false);
    setIsProfileModalOpen(true);
  };

  // Save Profile Handler
  const handleSaveProfile = (e) => {
    e.preventDefault();
    localStorage.setItem('userName', profileForm.name);
    localStorage.setItem('userEmail', profileForm.email);

    setToastMsg('Profile details updated successfully!');
    setTimeout(() => setToastMsg(''), 3500);
    setIsProfileModalOpen(false);
  };

  // Save Settings Handler
  const handleSaveSettings = (e) => {
    e.preventDefault();
    if (settingsForm.newPassword) {
      if (settingsForm.newPassword !== settingsForm.confirmPassword) {
        alert('New Password and Confirm Password do not match!');
        return;
      }
    }

    setToastMsg('Account security & preferences updated!');
    setTimeout(() => setToastMsg(''), 3500);
    setSettingsForm((prev) => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    setIsProfileModalOpen(false);
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="w-full sticky top-0 z-40 shadow-sm border-b border-orange-500/20">
      
      {/* Main Navbar with Gradient & Glassmorphism */}
      <div className="w-full bg-gradient-to-r from-[#c84302] via-[#f26522] to-[#fa7c3e] text-white px-4 md:px-8 py-2.5 flex items-center justify-between shadow-lg shadow-orange-500/10 backdrop-blur-md">
        
        {/* Left Side: Official LTS Brand Logo matching user photo */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/dashboard')}>
          <div className="bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/60 shadow-md flex items-center gap-2 group-hover:scale-105 group-hover:shadow-lg transition-all duration-200">
            <div className="flex items-center font-black text-xl tracking-tight leading-none">
              <span className="text-[#f26522]">LT</span>
              <span className="text-[#f26522] font-black">$</span>
            </div>
            <div className="text-sm md:text-base font-extrabold tracking-tight flex items-center gap-1 leading-none">
              <span className="text-[#f26522]">Local</span>
              <span className="text-slate-900 font-black">Trade</span>
              <span className="text-[#f26522]">Street</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-900 bg-amber-300 px-2.5 py-1 rounded-lg shadow-xs tracking-wider uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              SUPER ADMIN DBMS
            </span>
          </div>
        </div>

        {/* Right Side: Financial Year, Notifications & Profile */}
        <div className="flex items-center gap-2.5 md:gap-4">
          
          {/* Financial Year Selector Pill */}
          <div className="relative">
            <div className="flex items-center gap-1.5 bg-black/20 hover:bg-black/30 backdrop-blur-md border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white transition-all">
              <Calendar size={13} className="text-orange-200" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer appearance-none pr-5 text-xs tracking-tight"
              >
                <option value="2026-2027" className="text-slate-800 font-semibold">FY 2026-2027</option>
                <option value="2025-2026" className="text-slate-800 font-semibold">FY 2025-2026</option>
                <option value="2024-2025" className="text-slate-800 font-semibold">FY 2024-2025</option>
              </select>
              <ChevronDown 
                size={13} 
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-orange-200 pointer-events-none" 
              />
            </div>
          </div>

          {/* Notifications Button & Popover */}
          <div className="relative" ref={notificationRef}>
            <button
              type="button"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative p-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 border border-white/20 transition-all cursor-pointer text-white shadow-xs"
              title="Notifications"
            >
              <Bell size={17} />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-300 rounded-full border-2 border-[#f26522] animate-ping" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-300 rounded-full border-2 border-[#f26522]" />
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/80 py-3 z-50 text-slate-800 animate-in fade-in zoom-in duration-150">
                <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">Notifications</span>
                    <span className="bg-orange-100 text-[#f26522] text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-200">
                      2 New
                    </span>
                  </div>
                  <button 
                    onClick={() => setIsNotificationOpen(false)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto custom-scrollbar">
                  {notifications.map((n) => (
                    <div key={n.id} className={`p-3 text-xs hover:bg-slate-50 transition-colors ${n.unread ? 'bg-orange-50/50 font-medium' : ''}`}>
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>{n.title}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{n.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 px-4 border-t border-slate-100 text-center">
                  <button className="text-[11px] font-bold text-[#f26522] hover:text-[#e05411] hover:underline cursor-pointer">
                    Mark all as read
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2.5 p-1 rounded-xl bg-black/15 hover:bg-black/25 active:scale-95 border border-white/20 transition-all cursor-pointer focus:outline-none"
            >
              <div className="relative">
                <img
                  src={profileForm.avatar}
                  alt="Profile"
                  className="w-8 h-8 rounded-lg object-cover border border-white/80 shadow-xs"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#f26522]" />
              </div>

              <div className="text-left hidden md:block pr-1">
                <div className="text-xs font-bold text-white capitalize leading-tight">
                  {profileForm.name}
                </div>
                <div className="text-[10px] text-orange-100/90 font-semibold leading-tight flex items-center gap-1">
                  <span>Super Admin</span>
                </div>
              </div>

              <ChevronDown size={14} className="text-orange-200 hidden sm:block mr-1" />
            </button>

            {/* Profile Dropdown */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-200/90 py-2.5 z-50 text-slate-800 animate-in fade-in zoom-in duration-150">
                
                <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100">
                  <div className="text-xs font-extrabold text-slate-900 capitalize">{profileForm.name}</div>
                  <div className="text-[11px] text-slate-500 truncate font-medium">{profileForm.email}</div>
                  <div className="mt-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
                      <ShieldCheck size={11} />
                      Master Control Privilege
                    </span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => handleOpenModal('profile')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-orange-50 hover:text-[#f26522] transition-colors text-left cursor-pointer"
                  >
                    <UserCircle size={16} className="text-slate-400" />
                    <span>My Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenModal('settings')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-orange-50 hover:text-[#f26522] transition-colors text-left cursor-pointer"
                  >
                    <Settings size={16} className="text-slate-400" />
                    <span>Account Settings</span>
                  </button>
                </div>

                <div className="my-1 border-t border-slate-100" />

                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                >
                  <LogOut size={16} />
                  <span>Logout Super Admin</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Global Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-emerald-600 text-white text-xs font-bold rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={18} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* MY PROFILE & ACCOUNT SETTINGS ENTERPRISE MODAL */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            
            {/* Modal Top Header with Tabs */}
            <div className="bg-slate-900 text-white p-5 pb-0">
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#f26522] text-white flex items-center justify-center font-bold">
                    {activeModalTab === 'profile' ? <User size={18} /> : <Settings size={18} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold tracking-tight">Super Admin Account Management</h3>
                    <p className="text-[10px] text-slate-400">Enterprise Profile & System Settings Control</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-4 border-b border-slate-800 text-xs font-bold pt-2">
                <button
                  onClick={() => setActiveModalTab('profile')}
                  className={`pb-3 flex items-center gap-2 transition-all cursor-pointer ${
                    activeModalTab === 'profile'
                      ? 'text-[#f26522] border-b-2 border-[#f26522]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserCircle size={15} />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => setActiveModalTab('settings')}
                  className={`pb-3 flex items-center gap-2 transition-all cursor-pointer ${
                    activeModalTab === 'settings'
                      ? 'text-[#f26522] border-b-2 border-[#f26522]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sliders size={15} />
                  <span>Account Settings</span>
                </button>
              </div>
            </div>

            {/* TAB CONTENT 1: MY PROFILE */}
            {activeModalTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="p-6 space-y-4 text-left">
                {/* Avatar Preview */}
                <div className="flex items-center gap-4 pb-3 border-b border-slate-100">
                  <div className="relative">
                    <img
                      src={profileForm.avatar}
                      alt="Avatar"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-[#f26522] shadow-md"
                    />
                    <div className="absolute -bottom-1 -right-1 p-1 bg-[#f26522] text-white rounded-lg cursor-pointer hover:bg-[#e05411] transition-all">
                      <Camera size={12} />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">{profileForm.name}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full inline-block mt-0.5">
                      Super Admin Master Account
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">{profileForm.designation}</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name *</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522] font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address *</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522] font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Designation</label>
                    <input
                      type="text"
                      value={profileForm.designation}
                      onChange={(e) => setProfileForm({ ...profileForm, designation: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold text-slate-700"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Regional Jurisdiction</label>
                    <div className="relative">
                      <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={profileForm.jurisdiction}
                        onChange={(e) => setProfileForm({ ...profileForm, jurisdiction: e.target.value })}
                        className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold text-slate-700"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-[#f26522] hover:bg-[#e05411] rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Save size={14} />
                    <span>Save Profile Changes</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB CONTENT 2: ACCOUNT SETTINGS */}
            {activeModalTab === 'settings' && (
              <form onSubmit={handleSaveSettings} className="p-6 space-y-4 text-left">
                {/* Security Section */}
                <div className="space-y-3 pb-4 border-b border-slate-100">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield size={14} className="text-[#f26522]" />
                    <span>Security & Password Management</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Current Password</label>
                      <input
                        type="password"
                        placeholder="Current password"
                        value={settingsForm.currentPassword}
                        onChange={(e) => setSettingsForm({ ...settingsForm, currentPassword: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">New Password</label>
                      <input
                        type="password"
                        placeholder="New password"
                        value={settingsForm.newPassword}
                        onChange={(e) => setSettingsForm({ ...settingsForm, newPassword: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Confirm Password</label>
                      <input
                        type="password"
                        placeholder="Confirm password"
                        value={settingsForm.confirmPassword}
                        onChange={(e) => setSettingsForm({ ...settingsForm, confirmPassword: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                      />
                    </div>
                  </div>
                </div>

                {/* Enterprise Preferences */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders size={14} className="text-[#f26522]" />
                    <span>System & Preference Controls</span>
                  </h4>

                  <div className="space-y-2 text-xs">
                    {/* 2FA Toggle */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <div className="font-bold text-slate-800">Two-Factor Authentication (2FA)</div>
                        <div className="text-[10px] text-slate-400">Require OTP code on Super Admin login</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settingsForm.enable2FA}
                        onChange={(e) => setSettingsForm({ ...settingsForm, enable2FA: e.target.checked })}
                        className="w-4 h-4 text-[#f26522] rounded focus:ring-[#f26522] cursor-pointer"
                      />
                    </div>

                    {/* Email Alerts Toggle */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <div className="font-bold text-slate-800">Email Activity Alerts</div>
                        <div className="text-[10px] text-slate-400">Receive security audit & export notifications via email</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settingsForm.notifyEmail}
                        onChange={(e) => setSettingsForm({ ...settingsForm, notifyEmail: e.target.checked })}
                        className="w-4 h-4 text-[#f26522] rounded focus:ring-[#f26522] cursor-pointer"
                      />
                    </div>

                    {/* Sync Interval */}
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <div className="font-bold text-slate-800">Database Auto-Sync Frequency</div>
                        <div className="text-[10px] text-slate-400">Configure background city data sync frequency</div>
                      </div>
                      <select
                        value={settingsForm.syncInterval}
                        onChange={(e) => setSettingsForm({ ...settingsForm, syncInterval: e.target.value })}
                        className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 cursor-pointer"
                      >
                        <option value="Realtime">Real-Time (Instant)</option>
                        <option value="5mins">Every 5 Minutes</option>
                        <option value="15mins">Every 15 Minutes</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Save size={14} />
                    <span>Save Settings Preferences</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </header>
  );
}

export default Navbar;