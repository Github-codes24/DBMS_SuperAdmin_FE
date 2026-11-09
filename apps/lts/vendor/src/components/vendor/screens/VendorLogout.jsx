import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { logoutVendor, resetAuth } from '@/redux/slices/authSlice';
import { LogIn, CheckCircle2, Lock, ArrowRight } from 'lucide-react';

export const VendorLogout = ({ onRelogin }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [toastMsg, setToastMsg] = useState('');

  const handleLoggedOutClick = () => {
    dispatch(logoutVendor());
    if (onRelogin) {
      onRelogin();
    } else {
      setToastMsg('Vendor status: Logged Out. Redirecting to login...');
      setTimeout(() => setToastMsg(''), 3000);
    }
  };

  const handleSignInAgain = () => {
    dispatch(resetAuth());
    if (onRelogin) {
      onRelogin();
    }
  };

  return (
    <div className="space-y-4 text-left relative font-sans">
      {toastMsg && (
        <div className="fixed bottom-5 right-5 bg-[#172033] text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs z-50 border border-slate-700 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-[#F97316]" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
        <div>
          <span className="font-bold text-[#172033]">Session Ended</span>
          <p className="text-[#64748B] text-[11px] mt-0.5">Your vendor session is safely closed</p>
        </div>
        <button
          onClick={handleLoggedOutClick}
          className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs flex items-center gap-1.5 group"
          title="Click to sign in again"
        >
          <Lock className="w-3.5 h-3.5 text-rose-500 group-hover:rotate-12 transition-transform" />
          <span>Logged Out</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
              <th className="pb-2">STORE</th>
              <th className="pb-2">STATUS</th>
              <th className="pb-2 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-medium">
            <tr className="hover:bg-slate-50/50">
              <td className="py-2.5 font-bold text-[#172033]">
                {user?.storeName || user?.fullName || 'Ar Fresh Mart'}
              </td>
              <td className="py-2.5 font-bold">
                <button
                  onClick={handleLoggedOutClick}
                  className="px-2.5 py-1 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/80 rounded-md text-xs font-bold cursor-pointer transition-colors inline-flex items-center gap-1.5 group"
                  title="Click Logged Out badge to re-login"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 group-hover:scale-125 transition-transform"></span>
                  <span>Logged Out</span>
                </button>
              </td>
              <td className="py-2.5 text-right">
                <button
                  onClick={handleSignInAgain}
                  className="text-[#F97316] font-bold hover:underline cursor-pointer inline-flex items-center gap-1"
                >
                  <span>Re-login</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="pt-2">
        <button
          onClick={handleSignInAgain}
          className="px-4 py-2 bg-[#F97316] hover:bg-orange-600 text-white font-bold rounded-full text-xs shadow-xs cursor-pointer inline-flex items-center gap-1.5 transition-colors"
        >
          <LogIn className="w-3.5 h-3.5" />
          <span>Sign In Again</span>
        </button>
      </div>
    </div>
  );
};
