import React from 'react';
import { LogOut } from 'lucide-react';

export default function Header({ currentUser, onLogout, onOpenProfile }) {
  const userName = currentUser?.name || 'Shivam';
  const userAvatar = currentUser?.avatar || userName.charAt(0);
  const financialYear = currentUser?.financialYear || '2026-2027';

  return (
    <header className="top-header">
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
          <div
            className="user-profile-clickable"
            onClick={onOpenProfile}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            title="View My Profile"
          >
            <span>{userName}</span>
            {currentUser?.photoUrl ? (
              <img src={currentUser.photoUrl} alt={userName} className="header-avatar-img" />
            ) : (
              <div className="user-avatar">{userAvatar}</div>
            )}
          </div>
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
    </header>
  );
}


