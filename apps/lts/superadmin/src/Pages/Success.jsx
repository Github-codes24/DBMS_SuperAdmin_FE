import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";
import successImg from "../assets/success.png";
import logo from "../assets/logo.png";

function Success() {
  const navigate = useNavigate();

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
        
        {/* Left Side - Success Card */}
        <div className="w-full max-w-[430px] bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-orange-100 p-8 sm:p-10 flex flex-col items-center text-center">
          
          {/* Official LTS Logo Header */}
          <div
            className="flex items-center justify-center mb-6 cursor-pointer group hover:scale-105 transition-transform"
            onClick={() => navigate("/")}
          >
            <img src={logo} alt="Local Trade Street" className="h-9 sm:h-10 w-auto object-contain" />
          </div>

          {/* Orange Scalloped Starburst Checkmark Badge */}
          <div className="my-6 flex items-center justify-center">
            <div className="relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24">
              <svg
                viewBox="0 0 24 24"
                className="w-full h-full text-[#f26522] drop-shadow-md"
                fill="currentColor"
              >
                <path d="M22.5 12.5c0-1.58-.8-2.97-2-3.77.44-1.61-.06-3.37-1.31-4.63-1.26-1.25-3.02-1.75-4.63-1.31-.8-1.2-2.19-2-3.77-2s-2.97.8-3.77 2c-1.61-.44-3.37.06-4.63 1.31-1.25 1.26-1.75 3.02-1.31 4.63-1.2.8-2 2.19-2 3.77s.8 2.97 2 3.77c-.44 1.61.06 3.37 1.31 4.63 1.26 1.25 3.02 1.75 4.63 1.31.8 1.2 2.19 2 3.77 2s2.97-.8 3.77-2c1.61.44 3.37-.06 4.63-1.31 1.25-1.26 1.75-3.02 1.31-4.63 1.2-.8 2-2.19 2-3.77z" />
                <path
                  d="M8.5 12.5l2.5 2.5 5-5"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2 tracking-tight leading-snug">
            Password Reset <br /> Successful!
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mb-6">
            Your LTS account password has been updated securely.
          </p>

          {/* Login Now Button */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="w-full bg-gradient-to-r from-[#f26522] to-[#e05411] hover:from-[#e05411] hover:to-[#c84302] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all cursor-pointer text-sm sm:text-base flex items-center justify-center gap-2"
          >
            <span>Proceed to Sign In</span>
            <ArrowRight size={18} />
          </button>
        </div>

        {/* Right Side - Success Illustration */}
        <div className="hidden lg:flex flex-1 flex-col items-center justify-center max-w-lg">
          <img
            src={successImg}
            alt="LTS Password Reset Successful Illustration"
            className="w-full h-auto object-contain max-h-[460px] drop-shadow-md select-none animate-in fade-in duration-300"
          />
        </div>

      </div>
    </div>
  );
}

export default Success;