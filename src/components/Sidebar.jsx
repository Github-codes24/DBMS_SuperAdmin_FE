import React from 'react';
import { Users, TrendingUp, User, ChevronRight } from 'lucide-react';

export default function Sidebar({ activeNav, setActiveNav }) {
  const navItems = [
    { id: 'vendor_mgmt', label: 'Vendor Management', icon: Users },
    { id: 'reports', label: 'Report', icon: TrendingUp },
    { id: 'profile', label: 'My Profile', icon: User },
  ];


  return (
    <aside className="sidebar">
      <div className="sidebar-section-title">MAIN MENU</div>
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <button
              key={item.id}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveNav(item.id)}
            >
              <div className="nav-item-left">
                <Icon size={18} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </div>
              {isActive && <ChevronRight size={16} className="active-chevron" />}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
