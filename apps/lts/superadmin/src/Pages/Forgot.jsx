import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, ArrowLeft, Send } from "lucide-react";
import amicoImg from "../assets/amico.png";
import logo from "../assets/logo.png";

function Forgot() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate("/otp", { state: { email } });
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
        
        {/* Left Side - Forgot Password Card */}
        <div className="w-full max-w-[430px] bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-orange-100 p-8 sm:p-10 flex flex-col items-center">
          
          {/* Official LTS Logo Header */}
          <div className="flex items-center justify-center mb-6 cursor-pointer group hover:scale-105 transition-transform" onClick={() => navigate("/")}>
            <img src={logo} alt="Local Trade Street" className="h-9 sm:h-10 w-auto object-contain" />
          </div>

          {/* Email Form */}
          <div className="w-full text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">
              Forgot Password
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium mb-6">
              Enter your registered email address to receive an OTP code
            </p>

            <form onSubmit={handleSubmit} className="w-full space-y-5 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Registered Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#f26522] focus:ring-2 focus:ring-[#f26522]/20 transition-all font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#f26522] to-[#e05411] hover:from-[#e05411] hover:to-[#c84302] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-70 flex items-center justify-center gap-2 text-sm"
              >
                {isLoading ? (
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send size={15} />
                    <span>Send Verification OTP</span>
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#f26522] hover:text-[#e05411] hover:underline"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          </div>

        </div>

        {/* Right Side Illustration */}
        <div className="hidden lg:flex flex-1 flex-col items-center justify-center max-w-lg">
          <img
            src={amicoImg}
            alt="LTS Forgot Password Illustration"
            className="w-full h-auto object-contain max-h-[460px] drop-shadow-md select-none animate-in fade-in duration-300"
          />
        </div>

      </div>
    </div>
  );
}

export default Forgot;
