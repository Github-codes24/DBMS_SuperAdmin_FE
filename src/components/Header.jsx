import React from 'react';
import { Users, TrendingUp, LogOut } from 'lucide-react';

export default function Header({ activeNav, setActiveNav, currentUser, onLogout }) {
  const navItems = [
    { id: 'vendor_mgmt', label: 'Vendor Management', icon: Users },
    { id: 'reports', label: 'Report', icon: TrendingUp },
  ];

  const userName = currentUser?.name || 'Shivam';
  const userAvatar = currentUser?.avatar || userName.charAt(0);
  const financialYear = currentUser?.financialYear || '2026-2027';

  return (
    <header>
      {/* Top Header Bar with LTS Logo & Simple Orange Accent */}
      <div className="top-header">
        <div className="logo-container">
          <img
            src="/lts-logo.svg"
            alt="Local Trade Street Logo"
            className="logo-img"
          />
          <div className="system-title-badge">CRM (Telecaller)</div>
        </div>

        <div className="header-right-controls">
          <div className="fy-selector">
            <select defaultValue={financialYear}>
              <option value="2026-2027">FY 2026-2027</option>
              <option value="2025-2026">FY 2025-2026</option>
            </select>
          </div>
          <div className="user-profile">
            <span>{userName}</span>
            <div className="user-avatar">{userAvatar}</div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="icon-action-btn"
                style={{ marginLeft: '6px', color: '#dc2626' }}
                title="Logout Telecaller Session"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Bar - ONLY 2 BUTTONS: Vendor Management & Report */}
      <nav className="top-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          return (
            <div
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setActiveNav(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>
    </header>
  );
}
