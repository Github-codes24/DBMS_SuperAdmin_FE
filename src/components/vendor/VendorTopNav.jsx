import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutVendor } from '@/redux/slices/authSlice';
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from '@/redux/slices/notificationsSlice';
import {
  Search,
  Bell,
  MessageSquare,
  Settings,
  ChevronDown,
  Calendar,
  Check,
  X,
  CheckCheck
} from 'lucide-react';
import { vendorInfo, platformInfo } from '@/data/vendorMockData';

export const VendorTopNav = ({ onLoginClick, onNavigate, onLogoutClick }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { notifications, unreadCount } = useSelector((state) => state.notifications);

  // Fiscal Year Selector State
  const [selectedFY, setSelectedFY] = useState('FY 2026-2027');
  const [fyMenuOpen, setFyMenuOpen] = useState(false);
  const fyDropdownRef = useRef(null);

  // Profile Menu State
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  // Notification Drawer State
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);

  // Global Search State
  const [searchQuery, setSearchQuery] = useState('');

  const fiscalYears = ['FY 2026-2027', 'FY 2025-2026', 'FY 2024-2025', 'FY 2023-2024'];

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications({ page: 1 }));
    }
  }, [dispatch, isAuthenticated]);

  const handleMarkAllRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (fyDropdownRef.current && !fyDropdownRef.current.contains(e.target)) {
        setFyMenuOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-[#F97316] text-white px-4 sm:px-6 py-2.5 shadow-md flex items-center justify-between sticky top-0 z-40">
      {/* Top Left: LTS Logo & Vendor Dashboard Subtitle */}
      <div className="flex items-center space-x-3">
        {/* White Pill Container with LT$ Logo */}
        <div className="bg-white px-3.5 py-1.5 rounded-full flex items-center space-x-2 shadow-xs cursor-pointer" onClick={() => onNavigate && onNavigate('02 Vendor Dashboard')}>
          <span className="text-[#F97316] font-extrabold text-base tracking-tighter">LT$</span>
          <div className="flex flex-col text-left">
            <span className="text-[#172033] font-extrabold text-xs leading-none">Local Trade Street</span>
            <span className="text-[9px] text-slate-500 font-semibold leading-none mt-0.5 hidden sm:block">Vendor Dashboard</span>
          </div>
        </div>

        {/* Yellow/Lime Status Pill Badge */}
        <span
          className="hidden xl:inline-flex items-center gap-1.5 bg-[#FEF08A] text-[#854D0E] font-extrabold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider border border-yellow-300 shadow-xs"
          title={platformInfo.tagline}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
          VENDOR DBMS • {platformInfo.tagline.toUpperCase()}
        </span>
      </div>

      {/* Global Search Bar (Middle-Left) */}
      <div className="hidden md:flex items-center relative max-w-xs w-full mx-4">
        <Search className="w-4 h-4 text-orange-200 absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Global Search (Orders, Products, Customers)..."
          className="w-full pl-9 pr-3 py-1.5 bg-orange-600/50 hover:bg-orange-600 focus:bg-white text-white focus:text-[#172033] placeholder-orange-200 focus:placeholder-slate-400 rounded-full text-xs font-medium focus:outline-none focus:ring-2 focus:ring-white transition-all border border-orange-400/40"
        />
      </div>

      {/* Top Right Controls: Fiscal Year, Notifications, Messages, Vendor Profile, Settings */}
      <div className="flex items-center space-x-2.5">
        {/* Interactive Fiscal Year Pill Selector */}
        <div className="relative" ref={fyDropdownRef}>
          <button
            onClick={() => setFyMenuOpen(!fyMenuOpen)}
            className="bg-orange-600/50 hover:bg-orange-600 text-white font-semibold text-xs px-3.5 py-1.5 rounded-full hidden md:flex items-center space-x-1.5 border border-orange-400/40 cursor-pointer transition-all select-none"
            title="Click to select Financial Year"
          >
            <Calendar className="w-3.5 h-3.5 text-orange-200" />
            <span className="font-bold">{selectedFY}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-orange-200 transition-transform duration-200 ${fyMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Fiscal Year Dropdown Menu */}
          {fyMenuOpen && (
            <div className="absolute left-0 mt-2 w-48 bg-white rounded-2xl border border-slate-200 shadow-xl p-1.5 text-slate-800 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Select Financial Year
              </div>
              <div className="space-y-0.5 mt-1">
                {fiscalYears.map((fy) => (
                  <button
                    key={fy}
                    onClick={() => {
                      setSelectedFY(fy);
                      setFyMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                      selectedFY === fy
                        ? 'bg-orange-50 text-[#F97316] font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{fy}</span>
                    {selectedFY === fy && <Check className="w-3.5 h-3.5 text-[#F97316]" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setNotifDrawerOpen(!notifDrawerOpen)}
            className="relative bg-orange-600/50 hover:bg-orange-600 p-2 rounded-full text-white cursor-pointer transition-colors border border-orange-400/40"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <>
                <span className="absolute top-1 right-1 w-2 h-2 bg-amber-300 rounded-full animate-ping"></span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-amber-300 rounded-full"></span>
              </>
            )}
          </button>

          {/* Notifications Slide-over Drawer */}
          {notifDrawerOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 text-slate-800 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-[#172033]">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="bg-orange-100 text-[#EA580C] font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-[11px] font-bold text-[#F97316] hover:underline flex items-center space-x-1"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      <span>Mark all read</span>
                    </button>
                  )}
                  <button
                    onClick={() => setNotifDrawerOpen(false)}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id || notif.notificationId || notif.id}
                      onClick={() => {
                        if (notif.status === 'Unread' && notif._id) {
                          dispatch(markNotificationAsRead(notif._id));
                        }
                      }}
                      className={`p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                        notif.status === 'Unread'
                          ? 'bg-orange-50/60 border-orange-200/80 font-semibold hover:bg-orange-100/50'
                          : 'bg-slate-50/50 border-slate-100 text-slate-600 hover:bg-slate-100/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-extrabold uppercase text-[#F97316]">
                          {notif.category || 'General'}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          {notif.notificationId || notif._id?.slice(-6)}
                        </span>
                      </div>
                      <h4 className="font-bold text-[#172033]">{notif.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{notif.body || notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Messages Button */}
        <button
          onClick={() => onNavigate && onNavigate('10 Notifications')}
          className="relative bg-orange-600/50 hover:bg-orange-600 p-2 rounded-full text-white cursor-pointer transition-colors border border-orange-400/40 hidden sm:flex"
          title="Messages"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-400 rounded-full"></span>
        </button>

        {/* Settings Button */}
        <button
          onClick={() => onNavigate && onNavigate('09 Profile & Settings')}
          className="bg-orange-600/50 hover:bg-orange-600 p-2 rounded-full text-white cursor-pointer transition-colors border border-orange-400/40 hidden sm:flex"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Profile Pill & Dropdown at Top Right */}
        <div className="relative" ref={profileDropdownRef}>
          <div
            onClick={() => {
              if (isAuthenticated) {
                setProfileMenuOpen(!profileMenuOpen);
              } else if (onLoginClick) {
                onLoginClick();
              }
            }}
            className="bg-orange-600/50 hover:bg-orange-600 p-1 pr-3 rounded-full flex items-center space-x-2 text-white cursor-pointer transition-colors border border-orange-400/40 select-none"
            title={isAuthenticated ? "Open Profile Menu" : "Click to open Vendor Login"}
          >
            <img
              src={user?.avatar || vendorInfo.logo}
              alt={user?.fullName || vendorInfo.ownerName}
              className="w-7 h-7 rounded-full object-cover border border-white/40"
            />
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold leading-none">{user?.fullName || user?.ownerName || vendorInfo.ownerName}</div>
              <div className="text-[9px] text-orange-100 opacity-90 leading-none mt-0.5">
                {user?.storeName || 'Vendor Merchant'}
              </div>
            </div>
            <ChevronDown className={`w-3 h-3 text-orange-200 transition-transform duration-200 ${profileMenuOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* Profile Dropdown Menu */}
          {profileMenuOpen && isAuthenticated && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 text-slate-800 z-50 animate-in fade-in slide-in-from-top-2 duration-150 font-sans">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-[#172033] truncate">{user?.fullName || vendorInfo.ownerName}</p>
                <p className="text-[10px] text-[#F97316] font-semibold truncate">{user?.email || vendorInfo.email}</p>
                <p className="text-[9px] text-slate-400 font-medium truncate mt-0.5">{user?.storeName}</p>
              </div>

              <div className="py-1 space-y-0.5">
                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    if (onNavigate) onNavigate('09 Profile & Settings');
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-orange-50 hover:text-[#F97316] flex items-center space-x-2 transition-colors cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>My Profile & Settings</span>
                </button>

                <button
                  onClick={() => {
                    setProfileMenuOpen(false);
                    if (onLogoutClick) {
                      onLogoutClick();
                    } else {
                      dispatch(logoutVendor());
                    }
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center space-x-2 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Sign Out / Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
