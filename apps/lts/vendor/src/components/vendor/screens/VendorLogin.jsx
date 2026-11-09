import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  loginVendor,
  clearAuthError,
  fetchVendorProfile,
} from "@/redux/slices/authSlice";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  X,
  User,
  Lock,
} from "lucide-react";
import logo from "@/assets/logo.svg";

export const VendorLogin = ({ onLoginSuccess }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  const [vendorId, setVendorId] = useState("arham@lts.com");
  const [password, setPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());

    try {
      const loginPayload = {
        email: vendorId.trim(),
        password,
      };

      await dispatch(loginVendor(loginPayload)).unwrap();
      await dispatch(fetchVendorProfile()).unwrap();

      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      console.error("Vendor authentication failed:", err);

      setPopupMessage(
        typeof err === "string" && err
          ? err
          : "Your account has been blocked. Please contact the administrator.",
      );
    }
  };

  return (
    <>
      {popupMessage && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "25px",
              borderRadius: "8px",
              width: "350px",
              textAlign: "center",
              boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
            }}
          >
            <p>{popupMessage}</p>
            <button
              onClick={() => setPopupMessage("")}
              style={{
                background: "#f97316",
                color: "#fff",
                border: "none",
                padding: "8px 25px",
                marginTop: "20px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
      <div className="login-wrapper">
        <div className="login-card">
          {/* Top Header Badge matching user screenshot */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <img
                src={logo}
                alt="Local Trade Street"
                className="h-12 w-auto object-contain"
              />
            </div>

            <h2 className="login-title">Vendor Login</h2>
            <p className="text-xs text-[#64748B] font-medium mb-5">
              Sign in to access your Vendor Dashboard
            </p>
          </div>
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Vendor ID / Email Field */}

            <div className="form-group">
              <label>VENDOR ID / EMAIL</label>
              <div className="relative flex items-center">
                <User
                  size={16}
                  className="absolute left-3 text-slate-400 pointer-events-none"
                />
                <input
                  type="text"
                  className="form-control field-has-icon"
                  placeholder="arham@lts.com"
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}

            <div className="form-group">
              <label>PASSWORD</label>
              <div className="relative flex items-center">
                <Lock
                  size={16}
                  className="absolute left-3 text-slate-400 pointer-events-none"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control field-has-icon"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center bg-transparent border-0 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide Password" : "Show Password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
              <label
                htmlFor="rememberMe"
                className="text-xs font-semibold text-[#64748B] cursor-pointer select-none"
              >
                Remember Me
              </label>
            </div>

            {/* Large Orange Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#F97316] hover:bg-orange-600 active:bg-orange-700 disabled:opacity-75 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-md shadow-orange-500/20 text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Signing in to LTS...</span>
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
              <button type="button" className="hover:underline">
                Privacy Policy
              </button>
              <span className="text-slate-300">•</span>
              <button type="button" className="hover:underline">
                Terms & Conditions
              </button>
              <span className="text-slate-300">•</span>
              <button type="button" className="hover:underline">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
