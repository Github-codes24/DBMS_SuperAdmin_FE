import React, { useState } from 'react';
import { Search, Bell, Menu, User, Settings, LogOut, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Dropdown } from '@/components/ui/Dropdown';
import { mockNotifications } from '@/data/mockData';

export function TopNav({ onToggleSidebar, activeTab, setActiveTab, searchQuery, setSearchQuery }) {
  const [notifications, setNotifications] = useState(mockNotifications);
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search vendors, products, orders, customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition-all focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
      </div>

      {/* Right Actions: Notifications & Admin Profile */}
      <div className="flex items-center gap-3">
        {/* Notifications Dropdown */}
        <Dropdown
          align="right"
          trigger={
            <button className="relative p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 border-2 border-white rounded-full animate-pulse" />
              )}
            </button>
          }
        >
          <div className="w-80 p-2">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 px-2">
              <h4 className="font-semibold text-xs text-slate-900">Notifications</h4>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] font-medium text-blue-600 hover:underline cursor-pointer"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => setActiveTab('notifications')}
                  className={`p-2.5 rounded-lg text-xs transition-colors cursor-pointer ${
                    n.read ? 'bg-white hover:bg-slate-50' : 'bg-blue-50/50 font-medium'
                  }`}
                >
                  <p className="font-semibold text-slate-900">{n.title}</p>
                  <p className="text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 mt-2 border-t border-slate-100 text-center">
              <button
                onClick={() => setActiveTab('notifications')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                View all notifications
              </button>
            </div>
          </div>
        </Dropdown>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-slate-200" />

        {/* Admin Profile Dropdown */}
        <Dropdown
          align="right"
          trigger={
            <button className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                  alt="Admin Avatar"
                  className="w-9 h-9 rounded-xl object-cover ring-2 ring-blue-500/20"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight">Shruti Verma</p>
                <p className="text-[10px] font-medium text-emerald-600 flex items-center gap-0.5">
                  <ShieldCheck className="w-3 h-3" /> Super Admin
                </p>
              </div>
            </button>
          }
        >
          <Dropdown.Item onSelect={() => setActiveTab('settings')}>
            <User className="w-4 h-4 text-slate-400" /> My Profile
          </Dropdown.Item>
          <Dropdown.Item onSelect={() => setActiveTab('settings')}>
            <Settings className="w-4 h-4 text-slate-400" /> System Settings
          </Dropdown.Item>
          <div className="my-1 border-t border-slate-100" />
          <Dropdown.Item
            onSelect={() => {
              if (window.confirm('Log out of LTS Admin Panel?')) {
                alert('Logged out');
              }
            }}
            destructive
          >
            <LogOut className="w-4 h-4" /> Logout
          </Dropdown.Item>
        </Dropdown>
      </div>
    </header>
  );
}
