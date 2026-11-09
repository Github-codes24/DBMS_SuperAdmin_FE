import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { ShieldCheck, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";
import { loginSuccess } from "../redux/slices/authSlice";

export default function TelecallerSsoCallback({ onCancel }) {
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
        const baseUrl =
          import.meta.env.VITE_API_BASE_URL || "https://lts-dbms-backend.onrender.com";
        const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;

        const response = await fetch(`${cleanBase}/api/v1/platform-bridge/sso-exchange`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ticket }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || `Exchange failed with status ${response.status}`);
        }

        if (!isMounted) return;

        const token = data.token || data.accessToken;
        const user = data.user;

        // Persist session to Redux and localStorage
        dispatch(loginSuccess({ token, user }));
        setStatus("success");

        // Clean query parameters from URL address bar
        try {
          const cleanUrl = window.location.origin + window.location.pathname;
          window.history.replaceState({}, document.title, cleanUrl);
        } catch {
          /* non-blocking */
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("[TelecallerSSO] Ticket redemption failed:", err);
        setStatus("error");
        setErrorMessage(
          err.message ||
            "SSO Ticket verification failed. Please try launching again from Platform Super Admin.",
        );
      }
    }

    void redeemTicket();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl p-8 border border-slate-200 shadow-xl text-center">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-500/20">
            LTS
          </div>
        </div>

        {status === "verifying" && (
          <div className="flex flex-col items-center my-4">
            <div className="mb-4">
              <RefreshCw size={36} className="text-blue-600 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Authenticating Telecaller Session</h2>
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
              Platform identity validated. Connecting to Telecaller Calling CRM...
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
              className="mt-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
            >
              Go to Telecaller Agent Login
            </button>
          </div>
        )}

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 mt-6 pt-4 border-t border-slate-100">
          <ShieldCheck size={14} className="text-slate-400" />
          <span>Local Trade Street &bull; Telecaller CRM SSO Federation</span>
        </div>
      </div>
    </div>
  );
}
