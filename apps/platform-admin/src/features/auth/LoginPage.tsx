import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  Eye,
  EyeOff,
  AlertCircle,
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
  Sun,
  Moon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiBaseUrl } from "../../api";
import { setAccessToken } from "./authService";
import { LoadingButton } from "../../components/ui/buttons";
import { AlertMessage } from "../../components/notifications";
import { useTheme } from "../../context";
import homeImg from "../../assets/home.png";
import logo from "../../assets/logo.png";
import "./login.css";

const EMAIL_REGEX =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;

function Login() {
  const navigate = useNavigate();
  const { effectiveMode, setMode, applyTheme, colorId, customColor } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleTheme = () => {
    const nextMode = effectiveMode === "dark" ? "light" : "dark";
    setMode(nextMode);
    applyTheme({ mode: nextMode, colorId, customColor });
  };

  const validateEmailFormat = (val: string) => {
    const trimmed = (val || "").trim();
    if (!trimmed) {
      return "Email address is required.";
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      return "Please enter a valid email address.";
    }
    return "";
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (noticeMessage) setNoticeMessage("");
    if (emailError) {
      setEmailError(validateEmailFormat(val));
    }
  };

  const handleEmailBlur = () => {
    if (email.trim()) {
      setEmailError(validateEmailFormat(email));
    }
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPassword(val);
    if (noticeMessage) setNoticeMessage("");
    if (passwordError && val) {
      setPasswordError("");
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const emailErr = validateEmailFormat(email);
    const passwordErr = !password ? "Password is required." : "";

    setEmailError(emailErr);
    setPasswordError(passwordErr);

    if (emailErr || passwordErr) {
      return;
    }

    setNoticeMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const responseText = await response.text();
      let result: Record<string, unknown> | undefined;

      if (responseText.trim()) {
        let parsed: unknown;
        try {
          parsed = JSON.parse(responseText);
        } catch {
          if (response.ok) {
            throw new Error("Login server returned an invalid response.");
          }
        }

        if (parsed !== undefined) {
          if (
            typeof parsed !== "object" ||
            parsed === null ||
            Array.isArray(parsed)
          ) {
            throw new Error("Login server returned an invalid response.");
          }
          result = parsed as Record<string, unknown>;
        }
      }

      if (!response.ok || result?.success === false) {
        const message =
          typeof result?.message === "string"
            ? result.message
            : typeof result?.error === "string"
              ? result.error
              : `Login failed (${response.status}).`;
        throw new Error(message);
      }

      if (!result) {
        throw new Error("Login server returned an empty response.");
      }

      const data = result.data;
      if (typeof data !== "object" || data === null || Array.isArray(data)) {
        throw new Error("Invalid login response: access token is missing.");
      }
      const { accessToken, user } = data as {
        accessToken?: unknown;
        user?: unknown;
      };
      if (typeof accessToken !== "string" || !accessToken) {
        throw new Error("Invalid login response: access token is missing.");
      }

      setAccessToken(accessToken);
      if (user !== undefined) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      navigate("/users", { replace: true });
    } catch (error) {
      setNoticeMessage(
        error instanceof Error
          ? error.message
          : "Unable to connect to the login server.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-root">
      {/* Theme Mode Quick Switch */}
      <button
        className="login-theme-toggle"
        type="button"
        aria-label={`Switch to ${effectiveMode === "dark" ? "light" : "dark"} mode`}
        title={`Switch to ${effectiveMode === "dark" ? "light" : "dark"} mode`}
        onClick={handleToggleTheme}
      >
        {effectiveMode === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Decorative Wave Shape */}
      <div className="login-bg-shape">
        <svg
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
      <div className="login-content-wrapper">
        {/* Login Card */}
        <div className="login-card">
          {/* Logo Header */}
          <div className="flex items-center justify-center mb-8 cursor-pointer group hover:scale-105 transition-transform">
            <img
              src={logo}
              alt="DBMS Super Admin"
              className="h-12 sm:h-20 w-auto object-contain"
            />
          </div>

          <div className="w-full text-center">
            <h2 className="login-title">
              Super Admin Login
            </h2>
            <p className="login-subtitle">
              Sign in to DBMS Super Admin Management Suite
            </p>

            {noticeMessage && (
              <div className="mb-5 text-left">
                <AlertMessage
                  variant="warning"
                  message={noticeMessage}
                  onClose={() => setNoticeMessage("")}
                />
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              noValidate
              className="w-full space-y-4 text-left"
            >
              {/* Email Address */}
              <div>
                <label className="login-field-label">
                  Email Address
                </label>
                <div className="login-input-group">
                  <Mail
                    size={16}
                    className={`login-input-icon ${emailError ? "!text-rose-400" : ""}`}
                  />
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={handleEmailBlur}
                    className={`login-input ${emailError ? "login-input--error" : ""}`}
                  />
                </div>
                {emailError && (
                  <p className="mt-1.5 text-xs font-semibold text-rose-600 flex items-center gap-1.5 animate-in fade-in">
                    <AlertCircle size={14} className="shrink-0 text-rose-500" />
                    <span>{emailError}</span>
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="login-field-label">
                  Password
                </label>
                <div className="login-input-group">
                  <Lock
                    size={16}
                    className={`login-input-icon ${passwordError ? "!text-rose-400" : ""}`}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={handlePasswordChange}
                    className={`login-input ${passwordError ? "login-input--error" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="login-password-toggle"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {passwordError && (
                  <p className="mt-1.5 text-xs font-semibold text-rose-600 flex items-center gap-1.5 animate-in fade-in">
                    <AlertCircle size={14} className="shrink-0 text-rose-500" />
                    <span>{passwordError}</span>
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1 pb-1 w-full">
                <label className="login-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="login-checkbox"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  className="login-forgot-link"
                  onClick={() =>
                    setNoticeMessage("Forgot password is not connected yet.")
                  }
                >
                  Forgot password?
                </button>
              </div>

              {/* Login Button */}
              <LoadingButton
                type="submit"
                loading={isLoading}
                loadingText="Signing in..."
                className="login-submit-button"
                icon={<ArrowRight size={16} />}
              >
                Sign In to DBMS Suite
              </LoadingButton>
            </form>
          </div>
        </div>

        {/* Right Side Illustration & LTS Branding */}
        <div className="hidden lg:flex flex-1 min-w-0 flex-col items-center justify-center max-w-xl relative">
          <div className="relative z-10 w-full">
            <img
              src={homeImg}
              alt="LTS Local Trade Street Suite"
              className="w-full h-auto object-contain max-h-[460px] drop-shadow-md select-none animate-in fade-in duration-300"
            />
          </div>

          {/* Floating Badge */}
          <div className="login-brand-badge">
            <ShieldCheck size={24} className="login-brand-badge-icon" />
            <div className="text-left">
              <div className="login-brand-badge-title">
                DBMS Verified Enterprise Portal
              </div>
              <div className="login-brand-badge-desc">
                100% Encrypted & Authenticated Suite
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
