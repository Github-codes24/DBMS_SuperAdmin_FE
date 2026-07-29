import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, LogIn, ShieldCheck } from 'lucide-react';

export default function LoginPage({ onLogin }) {
  const [userId, setUserId] = useState('2547');
  const [password, setPassword] = useState('telecaller@123');
  const [financialYear, setFinancialYear] = useState('2026-2027');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userId.trim() || !password.trim()) {
      setErrorMsg('Please enter both Telecaller ID/Email and Password.');
      return;
    }

    // Authenticate user
    const userProfile = {
      id: userId,
      name: userId === '2547' || userId.toLowerCase().includes('shivam') ? 'Shivam Sharma' : `Telecaller (${userId})`,
      role: 'CRM Telecaller Executive',
      financialYear: financialYear,
      avatar: 'S'
    };

    onLogin(userProfile);
  };

  const handleQuickDemoLogin = (demoId) => {
    setUserId(demoId);
    setPassword('telecaller@123');
    setErrorMsg('');
    const userProfile = {
      id: demoId,
      name: demoId === '2547' ? 'Shivam Sharma' : 'Anjali Verma',
      role: 'Senior Telecaller Specialist',
      financialYear: financialYear,
      avatar: demoId === '2547' ? 'S' : 'A'
    };
    onLogin(userProfile);
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        {/* Header Logo */}
        <div className="login-logo-header">
          <img src="/lts-logo.svg" alt="Local Trade Street" className="login-logo-img" />
          <h2 className="login-title">CRM Telecaller Portal</h2>
          <p className="login-subtitle">Sign in to manage vendors and dispatch package details</p>
        </div>

        {errorMsg && <div className="login-error-alert">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          {/* Telecaller ID */}
          <div className="form-group">
            <label>Telecaller ID / Email / Mobile</label>
            <div className="input-with-icon">
              <User size={16} className="field-icon" />
              <input
                type="text"
                className="form-control field-has-icon"
                placeholder="Enter Telecaller ID (e.g. 2547)"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="field-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control field-has-icon"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Financial Year Selection */}
          <div className="form-group">
            <label>Financial Year Session</label>
            <select
              className="form-control"
              value={financialYear}
              onChange={(e) => setFinancialYear(e.target.value)}
            >
              <option value="2026-2027">FY 2026-2027 (Active)</option>
              <option value="2025-2026">FY 2025-2026</option>
            </select>
          </div>

          {/* Login Button */}
          <button type="submit" className="btn-login-submit">
            <LogIn size={18} /> Sign In to CRM
          </button>
        </form>

        {/* Quick Demo Accounts */}
        <div className="login-demo-box">
          <div className="demo-box-header">
            <ShieldCheck size={14} /> Quick Demo Access:
          </div>
          <div className="demo-btns-grid">
            <button
              type="button"
              className="btn-demo-account"
              onClick={() => handleQuickDemoLogin('2547')}
            >
              <strong>Shivam</strong> (ID: 2547)
            </button>
            <button
              type="button"
              className="btn-demo-account"
              onClick={() => handleQuickDemoLogin('1802')}
            >
              <strong>Anjali</strong> (ID: 1802)
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="login-footer-text">
          Local Trade Street ™ Data Management System &bull; Secure Telecaller Gateway
        </div>
      </div>
    </div>
  );
}
