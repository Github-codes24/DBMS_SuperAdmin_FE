import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutAdmin } from '../redux/slices/authSlice';
import logo from '../assets/logo.png';
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
  User,
  Menu,
  ArrowLeft
} from 'lucide-react';

function Navbar({ isMobileMenuOpen, setIsMobileMenuOpen }) {
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

  const avatarInputRef = useRef(null);

  const { user } = useSelector((state) => state.auth || {});

  const initialEmail = user?.email || localStorage.getItem('userEmail') || 'superadmin@lts.com';
  const initialName = user?.fullName || localStorage.getItem('userName') || 'Rahul Sharma';
  const initialAvatar = user?.avatar || localStorage.getItem('userAvatar') || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150';

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: initialName,
    email: initialEmail,
    phone: '+91 98765 43210',
    designation: 'Senior Super Admin & Chief Data Officer',
    jurisdiction: 'All India Master Operations',
    avatar: initialAvatar,
  });

  // Handle Profile Photo Upload
  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file (PNG, JPG, JPEG, etc.)');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const imageBase64 = uploadEvent.target?.result;
        if (imageBase64) {
          setProfileForm((prev) => ({ ...prev, avatar: imageBase64 }));
          localStorage.setItem('userAvatar', imageBase64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Sync profile form when user profile is updated in Redux store
  useEffect(() => {
    if (user) {
      setProfileForm((prev) => ({
        ...prev,
        name: user.fullName || prev.name,
        email: user.email || prev.email,
        avatar: user.avatar || localStorage.getItem('userAvatar') || prev.avatar,
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

  const [notificationList, setNotificationList] = useState([
    { id: 1, title: 'New Vendor Request', desc: '17 new vendor approval requests pending review and verification', time: '10m ago', unread: true, category: 'Vendor Management' },
    { id: 2, title: 'Quality Audit Complete', desc: 'Today audit milestone 1000+ customer records verified successfully', time: '1h ago', unread: true, category: 'Audit Logs' },
    { id: 3, title: 'System Security Update', desc: 'Super Admin master roles & permissions updated by System Administrator', time: '2h ago', unread: false, category: 'Security' },
    { id: 4, title: 'Database Auto-Sync Complete', desc: 'Real-time background city and state data synchronization finished', time: '5h ago', unread: false, category: 'System' },
    { id: 5, title: 'Telecaller Activity Report', desc: 'Weekly telecaller call metrics and response rates compiled', time: '1d ago', unread: false, category: 'Telecallers' },
  ]);

  const unreadCount = notificationList.filter(n => n.unread).length;

  const handleMarkAllRead = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setNotificationList(prev => prev.map(n => ({ ...n, unread: false })));
    setToastMsg('All notifications marked as read!');
    setTimeout(() => setToastMsg(''), 3000);
  };

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

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="w-full sticky top-0 z-40 shadow-sm border-b border-orange-500/20">
      
      {/* Main Navbar with Gradient & Glassmorphism */}
      <div className="w-full bg-gradient-to-r from-[#c84302] via-[#f26522] to-[#fa7c3e] text-white px-4 md:px-8 py-2.5 flex items-center justify-between shadow-lg shadow-orange-500/10 backdrop-blur-md">
        
        {/* Left Side: Mobile Menu Button & Official LTS Brand Logo */}
        <div className="flex items-center gap-2">
          {setIsMobileMenuOpen && (
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 text-white hover:bg-white/20 rounded-xl transition-colors cursor-pointer shrink-0"
              title="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          )}

          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/dashboard')}>
            <div className="bg-white px-3 py-1.5 rounded-2xl border border-white/60 shadow-md flex items-center group-hover:scale-105 group-hover:shadow-lg transition-all duration-200">
              <img src={logo} alt="Local Trade Street" className="h-7 w-auto object-contain" />
            </div>

            <div className="hidden lg:flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-900 bg-amber-300 px-2.5 py-1 rounded-lg shadow-xs tracking-wider uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                SUPER ADMIN DBMS
              </span>
            </div>
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
              onClick={() => setIsNotificationOpen(true)}
              className="relative p-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 border border-white/20 transition-all cursor-pointer text-white shadow-xs"
              title="Open System Notifications"
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <>
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-300 rounded-full border-2 border-[#f26522] animate-ping" />
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-300 rounded-full border-2 border-[#f26522]" />
                </>
              )}
            </button>
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

      {/* MY PROFILE & ACCOUNT SETTINGS FULL PAGE INTERFACE ⭐ */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col overflow-y-auto min-h-screen animate-in fade-in duration-150">
          
          {/* Top Full Page Header */}
          <div className="bg-slate-900 text-white sticky top-0 z-20 shadow-md">
            <div className="max-w-6xl mx-auto px-4 md:px-8 pt-5 pb-0">
              <div className="flex items-center justify-between pb-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(false)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    title="Back to Dashboard"
                  >
                    <ArrowLeft size={20} />
                    <span className="text-xs font-bold hidden sm:inline">Back</span>
                  </button>
                  <div className="w-10 h-10 rounded-2xl bg-[#f26522] text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20">
                    {activeModalTab === 'profile' ? <User size={22} /> : <Settings size={22} />}
                  </div>
                  <div>
                    <h2 className="text-base md:text-lg font-black tracking-tight text-white">Super Admin Account Management</h2>
                    <p className="text-xs text-slate-400">Enterprise Profile & System Settings Control</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-6 border-b border-slate-800 text-sm font-bold pt-2">
                <button
                  onClick={() => setActiveModalTab('profile')}
                  className={`pb-3.5 flex items-center gap-2 transition-all cursor-pointer ${
                    activeModalTab === 'profile'
                      ? 'text-[#f26522] border-b-2 border-[#f26522]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserCircle size={18} />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={() => setActiveModalTab('settings')}
                  className={`pb-3.5 flex items-center gap-2 transition-all cursor-pointer ${
                    activeModalTab === 'settings'
                      ? 'text-[#f26522] border-b-2 border-[#f26522]'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sliders size={18} />
                  <span>Account Settings</span>
                </button>
              </div>
            </div>
          </div>

          {/* Full Page Content Body */}
          <div className="max-w-6xl mx-auto w-full p-4 md:p-8 flex-1">
            {/* TAB CONTENT 1: MY PROFILE */}
            {activeModalTab === 'profile' && (
              <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 md:p-8 space-y-6 text-left">
                {/* Avatar Banner Header */}
                <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
                  <input
                    type="file"
                    ref={avatarInputRef}
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                  />
                  <div
                    onClick={() => avatarInputRef.current?.click()}
                    className="relative group cursor-pointer"
                    title="Click to change profile picture"
                  >
                    <img
                      src={profileForm.avatar}
                      alt="Avatar"
                      className="w-20 h-20 rounded-3xl object-cover border-4 border-[#f26522] shadow-xl group-hover:opacity-90 transition-all"
                    />
                    <div className="absolute -bottom-1 -right-1 p-2 bg-[#f26522] text-white rounded-xl group-hover:bg-[#e05411] transition-all shadow-md group-hover:scale-110">
                      <Camera size={14} />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-slate-900">{profileForm.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-bold px-3 py-1 bg-purple-100 text-purple-700 rounded-full inline-block">
                        Super Admin Master Account
                      </span>
                      <span className="text-xs font-semibold text-slate-400">• {profileForm.designation}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="text-xs font-bold text-[#f26522] hover:underline mt-1.5 block cursor-pointer"
                    >
                      Change Profile Picture
                    </button>
                  </div>
                </div>

                {/* Form Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name *</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522] font-semibold text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address *</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 focus:border-[#f26522] font-semibold text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Designation</label>
                    <input
                      type="text"
                      value={profileForm.designation}
                      onChange={(e) => setProfileForm({ ...profileForm, designation: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold text-slate-900"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Regional Jurisdiction</label>
                    <div className="relative">
                      <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={profileForm.jurisdiction}
                        onChange={(e) => setProfileForm({ ...profileForm, jurisdiction: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30 font-semibold text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(false)}
                    className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-xs font-bold text-white bg-[#f26522] hover:bg-[#e05411] rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <Save size={15} />
                    <span>Save Profile Changes</span>
                  </button>
                </div>
              </form>
            )}

            {/* TAB CONTENT 2: ACCOUNT SETTINGS */}
            {activeModalTab === 'settings' && (
              <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 md:p-8 space-y-8 text-left">
                {/* Security Section */}
                <div className="space-y-4 pb-6 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Shield size={16} className="text-[#f26522]" />
                      <span>Security & Password Management</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Password</label>
                      <input
                        type="password"
                        placeholder="Current password"
                        value={settingsForm.currentPassword}
                        onChange={(e) => setSettingsForm({ ...settingsForm, currentPassword: e.target.value })}
                        className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password</label>
                      <input
                        type="password"
                        placeholder="New password"
                        value={settingsForm.newPassword}
                        onChange={(e) => setSettingsForm({ ...settingsForm, newPassword: e.target.value })}
                        className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm Password</label>
                      <input
                        type="password"
                        placeholder="Confirm password"
                        value={settingsForm.confirmPassword}
                        onChange={(e) => setSettingsForm({ ...settingsForm, confirmPassword: e.target.value })}
                        className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#f26522]/30"
                      />
                    </div>
                  </div>
                </div>

                {/* Enterprise Preferences */}
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Sliders size={16} className="text-[#f26522]" />
                    <span>System & Preference Controls</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 2FA Toggle */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <div>
                        <div className="font-bold text-xs text-slate-900">Two-Factor Authentication (2FA)</div>
                        <div className="text-xs text-slate-500 mt-0.5">Require OTP code on Super Admin login</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settingsForm.enable2FA}
                        onChange={(e) => setSettingsForm({ ...settingsForm, enable2FA: e.target.checked })}
                        className="w-4 h-4 text-[#f26522] rounded focus:ring-[#f26522] cursor-pointer"
                      />
                    </div>

                    {/* Email Alerts Toggle */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <div>
                        <div className="font-bold text-xs text-slate-900">Email Activity Alerts</div>
                        <div className="text-xs text-slate-500 mt-0.5">Receive security audit & export notifications via email</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={settingsForm.notifyEmail}
                        onChange={(e) => setSettingsForm({ ...settingsForm, notifyEmail: e.target.checked })}
                        className="w-4 h-4 text-[#f26522] rounded focus:ring-[#f26522] cursor-pointer"
                      />
                    </div>

                    {/* Sync Interval */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200/80 md:col-span-2">
                      <div>
                        <div className="font-bold text-xs text-slate-900">Database Auto-Sync Frequency</div>
                        <div className="text-xs text-slate-500 mt-0.5">Configure background city & vendor data sync frequency</div>
                      </div>
                      <select
                        value={settingsForm.syncInterval}
                        onChange={(e) => setSettingsForm({ ...settingsForm, syncInterval: e.target.value })}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 cursor-pointer"
                      >
                        <option value="Realtime">Real-Time (Instant)</option>
                        <option value="5mins">Every 5 Minutes</option>
                        <option value="15mins">Every 15 Minutes</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsProfileModalOpen(false)}
                    className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <Save size={15} />
                    <span>Save Settings Preferences</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* NOTIFICATIONS FULL PAGE INTERFACE ⭐ */}
      {isNotificationOpen && (
        <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col overflow-y-auto min-h-screen animate-in fade-in duration-150">
          
          {/* Top Full Page Header */}
          <div className="bg-slate-900 text-white sticky top-0 z-20 shadow-md">
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsNotificationOpen(false)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    title="Back to Dashboard"
                  >
                    <ArrowLeft size={20} />
                    <span className="text-xs font-bold hidden sm:inline">Back</span>
                  </button>
                  <div className="w-10 h-10 rounded-2xl bg-[#f26522] text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20">
                    <Bell size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base md:text-lg font-black tracking-tight text-white">System Notifications & Activity Center</h2>
                      {unreadCount > 0 && (
                        <span className="text-xs font-black bg-[#f26522] text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                          {unreadCount} New
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">Track system activities, alerts, vendor requests & audit logs</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {unreadCount > 0 ? (
                    <button
                      type="button"
                      onClick={handleMarkAllRead}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-[#f26522] text-xs font-bold rounded-xl transition-all border border-slate-700 cursor-pointer active:scale-95 hidden sm:flex items-center gap-1.5"
                    >
                      <CheckCircle2 size={15} />
                      <span>Mark All as Read</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-slate-400 hidden sm:flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-800">
                      <CheckCircle2 size={15} className="text-emerald-400" />
                      <span>All Read</span>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsNotificationOpen(false)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Full Page Notifications Body */}
          <div className="max-w-6xl mx-auto w-full p-4 md:p-8 flex-1">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 md:p-8 space-y-6 text-left">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Recent Notifications</h3>
                  <p className="text-xs text-slate-500 mt-0.5">All activity trail logs and system notifications recorded for Super Admin</p>
                </div>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="sm:hidden px-4 py-2 bg-orange-50 text-[#f26522] text-xs font-bold rounded-xl border border-orange-200 cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 size={14} />
                    <span>Mark All Read</span>
                  </button>
                )}
              </div>

              {/* Notification Cards List */}
              <div className="space-y-3">
                {notificationList.map((n) => (
                  <div
                    key={n.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      n.unread
                        ? 'bg-orange-50/40 border-orange-200/80 shadow-2xs'
                        : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-2xl shrink-0 ${
                        n.unread ? 'bg-[#f26522] text-white shadow-md shadow-orange-500/20' : 'bg-slate-200 text-slate-600'
                      }`}>
                        <Bell size={18} />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-slate-900">{n.title}</h4>
                          {n.unread && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-orange-100 text-[#f26522] border border-orange-200 rounded-full">
                              UNREAD
                            </span>
                          )}
                          <span className="text-[10px] font-bold px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                            {n.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">{n.desc}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <span className="text-xs text-slate-400 font-semibold">{n.time}</span>
                      {n.unread && (
                        <button
                          type="button"
                          onClick={() => setNotificationList(prev => prev.map(item => item.id === n.id ? { ...item, unread: false } : item))}
                          className="px-3 py-1.5 text-xs font-bold text-[#f26522] hover:bg-orange-100 rounded-xl transition-colors cursor-pointer"
                        >
                          Mark Read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </header>
  );
}

export default Navbar;