import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, Lock, Mail, ShieldCheck, ArrowRight, CheckCircle2 } from "lucide-react";
import homeImg from "../assets/home.png";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [role, setRole] = useState("Super Admin");
  const [noticeMessage, setNoticeMessage] = useState(location.state?.message || "");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") === "true") {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);

    setTimeout(() => {
      // Save authentication state strictly as Super Admin
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userRole", "Super Admin");

      setIsLoading(false);
      // Redirect to dashboard
      navigate("/dashboard", { replace: true });
    }, 500);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#fff7ed] via-white to-[#fff1e6] flex items-center justify-center p-4 sm:p-6 md:p-10 relative overflow-hidden font-sans">
      {/* Background LTS Orange Curved Shape */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <svg
          className="absolute left-0 top-0 h-full w-full text-[#ffedd5]/60"
          viewBox="0 0 1440 900"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M 0 0 L 936 0 C 620 280, 620 620, 1120 900 L 0 900 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-8 lg:gap-16 my-auto">
        
        {/* Login Card */}
        <div className="w-full max-w-[430px] bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-orange-100 p-8 sm:p-10 flex flex-col items-center">
          
          {/* Official LTS Logo Header matching user photo */}
          <div
            className="flex items-center gap-2 mb-6 cursor-pointer group hover:scale-105 transition-transform"
            onClick={() => navigate("/")}
          >
            <div className="flex items-center font-black text-2xl tracking-tight leading-none">
              <span className="text-[#f26522]">LT</span>
              <span className="text-[#f26522] font-black">$</span>
            </div>
            <div className="text-xl sm:text-2xl font-extrabold tracking-tight flex items-center gap-1 leading-none">
              <span className="text-[#f26522]">Local</span>
              <span className="text-slate-900 font-black">Trade</span>
              <span className="text-[#f26522]">Street</span>
            </div>
          </div>

          <div className="w-full text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">
              Super Admin Login
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium mb-6">
              Sign in to LTS Super Admin Management Suite
            </p>

            {noticeMessage && (
              <div className="mb-5 flex items-center gap-2 p-3 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl text-left shadow-2xs">
                <AlertCircle size={18} className="text-[#f26522] shrink-0" />
                <span>{noticeMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="w-full space-y-4 text-left">
              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#f26522] focus:ring-2 focus:ring-[#f26522]/20 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#f26522] focus:ring-2 focus:ring-[#f26522]/20 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1 pb-1">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-[#f26522] border-slate-300 rounded focus:ring-[#f26522] cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>

                <Link
                  to="/forgot"
                  className="text-xs font-bold text-[#f26522] hover:text-[#e05411] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#f26522] to-[#e05411] hover:from-[#e05411] hover:to-[#c84302] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2 text-sm"
              >
                {isLoading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In to LTS Suite</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

        {/* Right Side Illustration & LTS Branding */}
        <div className="hidden lg:flex flex-1 flex-col items-center justify-center max-w-lg relative">
          <div className="relative z-10 w-full">
            <img
              src={homeImg}
              alt="LTS Local Trade Street Suite"
              className="w-full h-auto object-contain max-h-[460px] drop-shadow-md select-none animate-in fade-in duration-300"
            />
          </div>

          {/* Floating Badge */}
          <div className="mt-4 bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-xl border border-orange-100 flex items-center gap-3">
            <ShieldCheck size={22} className="text-[#f26522]" />
            <div className="text-left">
              <div className="text-xs font-bold text-slate-800">LTS Verified Enterprise Portal</div>
              <div className="text-[10px] text-slate-500 font-medium">100% Encrypted & Authenticated Suite</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;