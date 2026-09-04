import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { ShieldCheck, ArrowRight, RefreshCw, KeyRound } from "lucide-react";
import otpImg from "../assets/otp-illustration.png";
import logo from "../assets/logo.png";

function Otp() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "your Email ID";

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!otp) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate("/reset");
    }, 600);
  };

  const handleResend = () => {
    setResendMessage("A new 6-digit OTP code has been dispatched!");
    setTimeout(() => {
      setResendMessage("");
    }, 3500);
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
        
        {/* Left Side - OTP Card */}
        <div className="w-full max-w-[430px] bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-orange-100 p-8 sm:p-10 flex flex-col items-center">
          
          {/* Official LTS Logo Header */}
          <div className="flex items-center justify-center mb-6 cursor-pointer group hover:scale-105 transition-transform" onClick={() => navigate("/")}>
            <img src={logo} alt="Local Trade Street" className="h-9 sm:h-10 w-auto object-contain" />
          </div>

          {/* Form */}
          <div className="w-full text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">
              Enter Verification OTP
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium mb-5">
              Code dispatched to <span className="font-bold text-slate-800">{email}</span>
            </p>

            {resendMessage && (
              <div className="mb-4 text-xs font-semibold text-emerald-700 bg-emerald-50 p-3 rounded-xl border border-emerald-200 shadow-2xs">
                ✓ {resendMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="w-full space-y-5 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">6-Digit OTP Code</label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 text-sm sm:text-base bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-[#f26522] focus:ring-2 focus:ring-[#f26522]/20 transition-all font-mono font-bold tracking-widest text-center"
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
                    <span>Verify OTP Code</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div className="pt-2 text-center flex items-center justify-between text-xs font-semibold">
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-slate-600 hover:text-[#f26522] inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RefreshCw size={13} />
                  <span>Resend OTP</span>
                </button>

                <Link
                  to="/forgot"
                  className="text-[#f26522] hover:underline font-bold"
                >
                  Change Email
                </Link>
              </div>
            </form>
          </div>

        </div>

        {/* Right Side Illustration */}
        <div className="hidden lg:flex flex-1 flex-col items-center justify-center max-w-lg">
          <img
            src={otpImg}
            alt="LTS OTP Verification Illustration"
            className="w-full h-auto object-contain max-h-[460px] drop-shadow-md select-none animate-in fade-in duration-300"
          />
        </div>

      </div>
    </div>
  );
}

export default Otp;
