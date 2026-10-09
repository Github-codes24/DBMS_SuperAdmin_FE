import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Lock, User, Eye, EyeOff, LogIn, ShieldCheck, Mail, Phone, UserPlus } from 'lucide-react';
import { signupTelecaller, loginTelecaller, clearError } from '../redux/slices/authSlice';
import logo from '../assets/logo.svg';

export default function LoginPage({ onLogin }) {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  // Mode state
  const [isSignup, setIsSignup] = useState(false);

  // Common Fields
  const [password, setPassword] = useState('Password@123');
  const [showPassword, setShowPassword] = useState(false);
  const [financialYear, setFinancialYear] = useState('2026-2027');
  const [localError, setLocalError] = useState('');

  // Login Fields
  const [userId, setUserId] = useState('rk@lts.com');

  // Signup Fields
  const [signupName, setSignupName] = useState('');
  const [signupEmployeeId, setSignupEmployeeId] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setLocalError('');
    dispatch(clearError());
    // Reset passwords to standard placeholder
    setPassword(isSignup ? 'Password@123' : 'Password@123');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');

    if (isSignup) {
      if (!signupName.trim() || !signupEmployeeId.trim() || !signupEmail.trim() || !signupPhone.trim() || !password.trim()) {
        setLocalError('All fields are required for registration.');
        return;
      }

      dispatch(signupTelecaller({
        name: signupName,
        employeeId: signupEmployeeId,
        email: signupEmail,
        phone: signupPhone,
        password: password,
      }));
    } else {
      if (!userId.trim() || !password.trim()) {
        setLocalError('Please enter both Telecaller ID/Email and Password.');
        return;
      }

      dispatch(loginTelecaller({
        email: userId,
        password: password,
      }));
    }
  };

  const handleQuickDemoLogin = (demoId) => {
    setLocalError('');
    dispatch(clearError());

    if (demoId === 'rk@lts.com') {
      setUserId('rk@lts.com');
      setPassword('Password@123');
      dispatch(loginTelecaller({
        email: 'rk@lts.com',
        password: 'Password@123',
      }));
    } else {
      setUserId(demoId);
      setPassword('telecaller@123');
      const userProfile = {
        id: demoId,
        name: demoId === '2547' ? 'Shivam Sharma' : 'Anjali Verma',
        role: 'Senior Telecaller Specialist',
        financialYear: financialYear,
        avatar: demoId === '2547' ? 'S' : 'A'
      };
      if (onLogin) {
        onLogin(userProfile);
      }
    }
  };

  const displayedError = localError || error;

  return (
    <div className="login-wrapper">
      <div className="login-card">
        {/* Header Logo */}
        <div className="login-logo-header">
          <img src={logo} alt="Local Trade Street" className="login-logo-img" />
          <h2 className="login-title">CRM Telecaller Portal</h2>
          <p className="login-subtitle">
            {isSignup
              ? 'Register new Telecaller executive account'
              : 'Sign in to manage vendors and dispatch package details'}
          </p>
        </div>

        {displayedError && <div className="login-error-alert">{displayedError}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          {isSignup ? (
            <>
              {/* Full Name */}
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-with-icon">
                  <User size={16} className="field-icon" />
                  <input
                    type="text"
                    className="form-control field-has-icon"
                    placeholder="Enter Full Name (e.g. Rohit Kumar)"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Employee ID */}
              <div className="form-group">
                <label>Employee ID</label>
                <div className="input-with-icon">
                  <ShieldCheck size={16} className="field-icon" />
                  <input
                    type="text"
                    className="form-control field-has-icon"
                    placeholder="Enter Employee ID (e.g. TC002)"
                    value={signupEmployeeId}
                    onChange={(e) => setSignupEmployeeId(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <Mail size={16} className="field-icon" />
                  <input
                    type="email"
                    className="form-control field-has-icon"
                    placeholder="Enter Email (e.g. rk@lts.com)"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="form-group">
                <label>Phone Number</label>
                <div className="input-with-icon">
                  <Phone size={16} className="field-icon" />
                  <input
                    type="tel"
                    className="form-control field-has-icon"
                    placeholder="Enter 10-digit Mobile (e.g. 9876543212)"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
            </>
          ) : (
            /* Telecaller ID */
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
          )}

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
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn-login-submit" disabled={loading}>
            {isSignup ? (
              <>
                <UserPlus size={18} /> {loading ? 'Registering...' : 'Register as Telecaller'}
              </>
            ) : (
              <>
                <LogIn size={18} /> {loading ? 'Signing In...' : 'Sign In to CRM'}
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="login-footer-text">
          Local Trade Street ™ Data Management System &bull; Secure Telecaller Gateway
        </div>
      </div>
    </div>
  );
}

