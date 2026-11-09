import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { ShieldCheck, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";
import api from "@/services/api";
import { setAuthSession, fetchVendorProfile } from "@/redux/slices/authSlice";

export const VendorSsoCallback = ({ onLoginSuccess, onCancel }) => {
  const dispatch = useDispatch();
  const [status, setStatus] = useState("verifying"); // "verifying" | "success" | "error"
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const ticket = searchParams.get("ticket");

    if (!ticket) {
      setStatus("error");
      setErrorMessage(
        "No SSO authentication ticket provided. Please launch this panel from the Platform Super Admin.",
      );
      return;
    }

    let isMounted = true;

    async function redeemTicket() {
      try {
        const response = await api.post("/platform-bridge/sso-exchange", { ticket });
        const { user, token, accessToken, message } = response.data;
        const validToken = token || accessToken;

        if (!isMounted) return;

        // Persist session
        localStorage.setItem("token", validToken);
        dispatch(setAuthSession({ token: validToken, user }));

        setStatus("success");

        try {
          await dispatch(fetchVendorProfile());
        } catch {
          /* non-blocking profile sync */
        }

        // Clean query parameters from URL address bar
        try {
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        } catch {
          /* non-blocking */
        }

        setTimeout(() => {
          if (isMounted) {
            onLoginSuccess?.();
          }
        }, 800);
      } catch (err) {
        if (!isMounted) return;
        console.error("[VendorSSO] Exchange error:", err);
        const msg =
          err.response?.data?.message ||
          err.message ||
          "SSO Ticket verification failed. Please try launching again from Platform Super Admin.";
        setStatus("error");
        setErrorMessage(msg);
      }
    }

    void redeemTicket();

    return () => {
      isMounted = false;
    };
  }, [dispatch, onLoginSuccess]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 border border-slate-200 shadow-xl text-center">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md shadow-orange-500/20">
            LTS
          </div>
        </div>

        {status === "verifying" && (
          <div className="flex flex-col items-center my-4">
            <div className="mb-4">
              <RefreshCw size={36} className="text-orange-500 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Authenticating Vendor Session</h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              Verifying single sign-on ticket issued by <strong>Platform Super Admin Control Plane</strong>...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center my-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Access Verified</h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              Platform identity validated. Launching your Merchant Store Dashboard...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center my-4">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
              <AlertCircle size={36} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">SSO Launch Failed</h2>
            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3 my-3 leading-relaxed text-left w-full">
              {errorMessage}
            </div>
            <button
              type="button"
              onClick={onCancel}
              className="mt-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
            >
              Go to Standard Merchant Login
            </button>
          </div>
        )}

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 mt-6 pt-4 border-t border-slate-100">
          <ShieldCheck size={14} className="text-slate-400" />
          <span>Local Trade Street &bull; Merchant Portal SSO Federation</span>
        </div>
      </div>
    </div>
  );
};

