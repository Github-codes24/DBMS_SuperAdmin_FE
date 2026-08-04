import React, { useState } from 'react';
import { Eye, EyeOff, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

export const VendorLogin = ({ onLoginSuccess }) => {
  const [vendorId, setVendorId] = useState('rajesh@lts.com');
  const [password, setPassword] = useState('pass@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
      }, 800);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-[460px] bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 sm:p-10 space-y-6 relative my-auto">
        {/* Top Header Badge matching user screenshot */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2.5 bg-[#F8FAFC] px-4 py-2 rounded-full border border-slate-200 shadow-xs">
            <span className="text-[#F97316] font-black text-lg tracking-tighter">LT$</span>
            <span className="text-[#172033] font-bold text-xs">Local Trade Street</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight pt-1">
            Vendor Login
          </h1>
          <p className="text-xs text-[#64748B] font-medium">
            Sign in to access your Vendor Dashboard
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Vendor ID / Email Field */}
          <div>
            <label className="block text-[11px] font-extrabold text-[#172033] uppercase tracking-wider mb-1.5">
              VENDOR ID / EMAIL *
            </label>
            <input
              type="text"
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              placeholder="rajesh@lts.com"
              className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-semibold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:bg-white transition-all"
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-extrabold text-[#172033] uppercase tracking-wider">
                PASSWORD *
              </label>
              <button
                type="button"
                className="text-xs font-bold text-[#F97316] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-4 pr-11 py-3 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-semibold text-[#172033] focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:bg-white transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center space-x-2.5 pt-1">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-[#F97316] focus:ring-[#F97316] accent-[#F97316] cursor-pointer"
            />
            <label htmlFor="rememberMe" className="text-xs font-semibold text-[#64748B] cursor-pointer select-none">
              Remember Me
            </label>
          </div>

          {/* Large Orange Login Button matching user screenshot */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-[#F97316] hover:bg-orange-600 active:bg-orange-700 disabled:opacity-80 text-white font-bold rounded-xl shadow-md shadow-orange-500/20 text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 cursor-pointer mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Signing in...</span>
              </>
            ) : isSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Success! Opening Dashboard...</span>
              </>
            ) : (
              <>
                <span>Login to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Card Footer matching user screenshot */}
        <div className="pt-6 border-t border-slate-100 text-center space-y-2">
          <p className="text-[11px] text-[#64748B] font-semibold">
            © 2026 Local Trade Street. All rights reserved.
          </p>
          <div className="flex items-center justify-center space-x-3 text-[10px] font-bold text-[#F97316]">
            <button type="button" className="hover:underline">Privacy Policy</button>
            <span className="text-slate-300">•</span>
            <button type="button" className="hover:underline">Terms & Conditions</button>
            <span className="text-slate-300">•</span>
            <button type="button" className="hover:underline">Contact Support</button>
          </div>
        </div>
      </div>
    </div>
  );
};
