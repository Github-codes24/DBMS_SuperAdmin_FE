import React from 'react';
import {
  LayoutDashboard,
  Store,
  Users,
  Package,
  Layers,
  ShoppingBag,
  CreditCard,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  X,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen, unreadNotifsCount = 2, pendingOrdersCount = 3 }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'vendors', label: 'Vendors', icon: Store },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: pendingOrdersCount },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifsCount },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelect = (id) => {
    if (id === 'logout') {
      if (window.confirm('Are you sure you want to log out of LTS Admin Panel?')) {
        alert('Logged out successfully.');
      }
      return;
    }
    setActiveTab(id);
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        )}
      >
        {/* Header Logo */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg leading-none tracking-tight block">Local Trade</span>
              <span className="text-[10px] font-semibold tracking-wider text-emerald-600 uppercase">Street DBMS</span>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
          <div className="px-3 pb-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Main Navigation</p>
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={cn(
                  'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer group',
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-colors',
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span
                    className={cn(
                      'px-2 py-0.5 text-[11px] font-bold rounded-full',
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Logout Button */}
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={() => handleSelect('logout')}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-500" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
