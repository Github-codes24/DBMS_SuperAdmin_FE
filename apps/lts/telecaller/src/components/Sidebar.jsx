import React, { useState } from 'react';
import { Users, TrendingUp, User, ChevronRight, ChevronsLeft, ChevronsRight, LogOut } from 'lucide-react';

export default function Sidebar({ activeNav, setActiveNav, onLogout }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navItems = [
    { id: 'vendor_mgmt', label: 'Vendor Management', icon: Users },
    { id: 'reports', label: 'Report', icon: TrendingUp },
    { id: 'profile', label: 'My Profile', icon: User },
  ];


  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {!isCollapsed && <div className="sidebar-section-title">MAIN MENU</div>}
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
                <Icon size={20} className="nav-icon" />
                {!isCollapsed && <span className="nav-label">{item.label}</span>}
              </div>
              {isActive && !isCollapsed && <ChevronRight size={16} className="active-chevron" />}
            </button>
          );
        })}
        
        {/* Logout Button */}
        {onLogout && (
          <button
            className="sidebar-nav-item"
            onClick={onLogout}
            title="Logout"
            style={{ marginTop: 'auto', borderBottom: 'none' }}
          >
            <div className="nav-item-left">
              <LogOut size={20} className="nav-icon" style={{ color: '#475569' }} />
              {!isCollapsed && <span className="nav-label" style={{ fontWeight: 600 }}>Logout</span>}
            </div>
          </button>
        )}
      </nav>
      
      <div className="sidebar-footer">
        <div className="collapse-divider"></div>
        <button 
          className="collapse-btn" 
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
        </button>
      </div>
    </aside>
  );
}
