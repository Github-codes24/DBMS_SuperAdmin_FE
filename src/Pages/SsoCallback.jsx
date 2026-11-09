import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ShieldCheck, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import api from "../services/api";
import { fetchMyProfile } from "../redux/slices/authSlice";
import logo from "../assets/logo.png";

export default function SsoCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [status, setStatus] = useState("verifying"); // "verifying" | "success" | "error"
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const ticket = searchParams.get("ticket");

    if (!ticket) {
      setStatus("error");
      setErrorMessage("No SSO authentication ticket provided. Please launch this panel from the Platform Super Admin.");
      return;
    }

    let isMounted = true;

    async function redeemTicket() {
      try {
        const response = await api.post("/platform-bridge/sso-exchange", { ticket });
        const { user, accessToken, refreshToken, redirectRoute, message } = response.data;

        if (!isMounted) return;

        // Persist session exactly as expected by LTS auth slice
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userEmail", user.email);
        localStorage.setItem("userName", user.fullName);
        localStorage.setItem("userRole", user.role === "SuperAdmin" ? "Super Admin" : user.role);

        setStatus("success");
        toast.success(message || "Platform Super Admin session authenticated successfully");

        // Sync profile into Redux store
        try {
          await dispatch(fetchMyProfile());
        } catch {
          /* non-blocking */
        }

        setTimeout(() => {
          if (isMounted) {
            navigate(redirectRoute || "/dashboard", { replace: true });
          }
        }, 800);
      } catch (err) {
        if (!isMounted) return;
        console.error("[SSO Callback] Ticket exchange failed:", err);
        const msg =
          err.response?.data?.message ||
          err.message ||
          "SSO Ticket verification failed. Please try launching again from Platform Super Admin.";
        setStatus("error");
        setErrorMessage(msg);
        toast.error(msg);
      }
    }

    void redeemTicket();

    return () => {
      isMounted = false;
    };
  }, [searchParams, navigate, dispatch]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logoContainer}>
          <img src={logo} alt="LTS Logo" style={styles.logo} />
        </div>

        {status === "verifying" && (
          <div style={styles.stateWrapper}>
            <div style={styles.spinnerWrapper}>
              <RefreshCw size={36} color="#f96321" style={styles.spinner} />
            </div>
            <h2 style={styles.title}>Authenticating Session</h2>
            <p style={styles.subtitle}>
              Verifying single sign-on ticket issued by <strong>Platform Super Admin Control Plane</strong>...
            </p>
          </div>
        )}

        {status === "success" && (
          <div style={styles.stateWrapper}>
            <div style={{ ...styles.iconWrapper, background: "#ecfdf5", color: "#10b981" }}>
              <CheckCircle2 size={36} />
            </div>
            <h2 style={styles.title}>Handshake Verified</h2>
            <p style={styles.subtitle}>
              Session established successfully. Redirecting to your dashboard...
            </p>
          </div>
        )}

        {status === "error" && (
          <div style={styles.stateWrapper}>
            <div style={{ ...styles.iconWrapper, background: "#fef2f2", color: "#ef4444" }}>
              <AlertCircle size={36} />
            </div>
            <h2 style={styles.title}>SSO Launch Failed</h2>
            <p style={styles.errorText}>{errorMessage}</p>
            <div style={styles.actionRow}>
              <Link to="/" style={styles.loginBtn}>
                Go to Standard Login
              </Link>
            </div>
          </div>
        )}

        <div style={styles.footerNote}>
          <ShieldCheck size={14} color="#64748b" />
          <span>Local Trade Street &bull; Platform Bridge SSO Federation</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    padding: "20px",
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "460px",
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    padding: "36px 32px",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
    border: "1px solid #e2e8f0",
    textAlign: "center",
  },
  logoContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "24px",
  },
  logo: {
    maxHeight: "44px",
    objectFit: "contain",
  },
  stateWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: "12px 0 20px 0",
  },
  spinnerWrapper: {
    marginBottom: "16px",
  },
  spinner: {
    animation: "sso-spin 1s linear infinite",
  },
  iconWrapper: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px",
  },
  title: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 8px 0",
  },
  subtitle: {
    fontSize: "13px",
    color: "#64748b",
    lineHeight: "1.5",
    margin: 0,
    maxWidth: "360px",
  },
  errorText: {
    fontSize: "13px",
    color: "#b91c1c",
    backgroundColor: "#fef2f2",
    border: "1px solid #fee2e2",
    borderRadius: "8px",
    padding: "10px 14px",
    margin: "12px 0 20px 0",
    lineHeight: "1.5",
  },
  actionRow: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
    marginTop: "8px",
  },
  loginBtn: {
    display: "inline-block",
    padding: "9px 18px",
    backgroundColor: "#f96321",
    color: "#ffffff",
    borderRadius: "8px",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "13px",
    transition: "background-color 0.2s ease",
  },
  footerNote: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    fontSize: "11px",
    color: "#94a3b8",
    marginTop: "24px",
    paddingTop: "16px",
    borderTop: "1px solid #f1f5f9",
  },
};
