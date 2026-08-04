import React, { useState } from 'react';
import {
  User,
  Sliders,
  Mail,
  Phone,
  Briefcase,
  Globe,
  Camera,
  Save,
  Shield,
  Lock,
  CheckCircle2,
  X,
  ChevronDown
} from 'lucide-react';
import { vendorInfo } from '@/data/vendorMockData';

export const ProfileSettings = () => {
  // Tab State: 'profile' | 'settings'
  const [activeTab, setActiveTab] = useState('profile');

  // Profile Form State (Pre-filled from reference screenshot & vendorInfo)
  const [fullName, setFullName] = useState(vendorInfo.ownerName || 'Rajesh Kumar');
  const [email, setEmail] = useState(vendorInfo.email || 'rajesh@lts.com');
  const [phone, setPhone] = useState(vendorInfo.phone || '+91 98765 43210');
  const [designation, setDesignation] = useState('Senior Vendor & Regional Store Manager');
  const [jurisdiction, setJurisdiction] = useState('All India Vendor Operations');
  const [avatarUrl, setAvatarUrl] = useState(vendorInfo.logo);

  // Settings State (Pre-filled from reference screenshot 2)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [autoSyncFreq, setAutoSyncFreq] = useState('Real-Time (Instant)');

  const [toastMessage, setToastMessage] = useState('');

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setToastMessage('Profile changes saved successfully!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      alert('New password and confirm password do not match!');
      return;
    }
    setToastMessage('Account settings preferences updated!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-xs font-bold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Account Management Card matching both reference screenshots */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Dark Header Banner (#0F172A) */}
        <div className="bg-[#0F172A] text-white p-6 pb-0 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#F97316] flex items-center justify-center text-white shadow-md">
                {activeTab === 'profile' ? <User className="w-5 h-5" /> : <Sliders className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold tracking-tight">
                  Vendor Account Management
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Enterprise Profile & System Settings Control
                </p>
              </div>
            </div>
          </div>

          {/* Dual Tabs Bar matching reference screenshot */}
          <div className="flex items-center space-x-6 border-b border-slate-800 pt-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-3 text-xs font-extrabold flex items-center space-x-2 transition-all border-b-2 cursor-pointer ${
                activeTab === 'profile'
                  ? 'border-[#F97316] text-[#F97316]'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <User className="w-4 h-4" />
              <span>My Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-3 text-xs font-extrabold flex items-center space-x-2 transition-all border-b-2 cursor-pointer ${
                activeTab === 'settings'
                  ? 'border-[#F97316] text-[#F97316]'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Account Settings</span>
            </button>
          </div>
        </div>

        {/* TAB CONTENT 1: MY PROFILE (Matching Screenshot 1) */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
            {/* User Avatar & Badge Row */}
            <div className="flex items-center space-x-4 pb-4 border-b border-slate-100">
              <div className="relative">
                <img
                  src={avatarUrl}
                  alt={fullName}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-orange-500 shadow-md"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newUrl = prompt('Enter image URL:', avatarUrl);
                    if (newUrl) setAvatarUrl(newUrl);
                  }}
                  className="absolute -bottom-1 -right-1 bg-[#F97316] text-white p-1.5 rounded-full shadow-md hover:bg-orange-600 transition-colors cursor-pointer"
                  title="Upload profile photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-black text-[#172033]">{fullName}</h4>
                <div className="flex items-center space-x-2">
                  <span className="bg-purple-100 text-purple-700 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full border border-purple-200">
                    Vendor Merchant Account
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">{designation}</p>
              </div>
            </div>

            {/* Profile Form Grid (2 Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="block font-extrabold text-[#172033]">Full Name *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl font-semibold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                    required
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="block font-extrabold text-[#172033]">Email Address *</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl font-semibold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                    required
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="block font-extrabold text-[#172033]">Phone Number</label>
                <div className="relative">
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl font-semibold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Designation */}
              <div className="space-y-1">
                <label className="block font-extrabold text-[#172033]">Designation</label>
                <div className="relative">
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl font-semibold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  />
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* Regional Jurisdiction (Full Width) */}
              <div className="sm:col-span-2 space-y-1">
                <label className="block font-extrabold text-[#172033]">Regional Jurisdiction</label>
                <div className="relative">
                  <input
                    type="text"
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl font-semibold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  />
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Profile Action Footer Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setFullName(vendorInfo.ownerName);
                  setEmail(vendorInfo.email);
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#F97316] hover:bg-orange-600 text-white font-bold rounded-xl text-xs shadow-md shadow-orange-500/20 flex items-center space-x-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB CONTENT 2: ACCOUNT SETTINGS (Matching Screenshot 2) */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="p-6 space-y-6">
            {/* SECTION 1: SECURITY & PASSWORD MANAGEMENT */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-xs font-extrabold uppercase text-[#172033] tracking-wider border-b border-slate-100 pb-2">
                <Shield className="w-4 h-4 text-[#F97316]" />
                <span>SECURITY & PASSWORD MANAGEMENT</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-600 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Current password"
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl font-medium text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl font-medium text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl font-medium text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: SYSTEM & PREFERENCE CONTROLS */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-2 text-xs font-extrabold uppercase text-[#172033] tracking-wider border-b border-slate-100 pb-2">
                <Sliders className="w-4 h-4 text-[#F97316]" />
                <span>SYSTEM & PREFERENCE CONTROLS</span>
              </div>

              <div className="space-y-3">
                {/* 2FA Preference Card */}
                <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-extrabold text-[#172033]">Two-Factor Authentication (2FA)</h5>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">Require OTP code on Vendor login</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={twoFactorAuth}
                    onChange={(e) => setTwoFactorAuth(e.target.checked)}
                    className="w-4 h-4 text-[#F97316] rounded border-slate-300 focus:ring-[#F97316] accent-[#F97316] cursor-pointer"
                  />
                </div>

                {/* Email Activity Alerts Card */}
                <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-extrabold text-[#172033]">Email Activity Alerts</h5>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Receive security audit & export notifications via email
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="w-4 h-4 text-[#F97316] rounded border-slate-300 focus:ring-[#F97316] accent-[#F97316] cursor-pointer"
                  />
                </div>

                {/* Database Auto-Sync Frequency Card */}
                <div className="p-3.5 bg-[#F8FAFC] rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h5 className="text-xs font-extrabold text-[#172033]">Database Auto-Sync Frequency</h5>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      Configure background city data sync frequency
                    </p>
                  </div>
                  <select
                    value={autoSyncFreq}
                    onChange={(e) => setAutoSyncFreq(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316]"
                  >
                    <option value="Real-Time (Instant)">Real-Time (Instant)</option>
                    <option value="Hourly Sync">Hourly Sync</option>
                    <option value="Daily Midnight">Daily Midnight</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Settings Action Footer Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md flex items-center space-x-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Settings Preferences</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
