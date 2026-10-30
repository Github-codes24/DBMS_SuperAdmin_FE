import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  Eye,
  EyeOff,
  AlertCircle,
  Lock,
  Mail,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiBaseUrl } from "../../api";
import homeImg from "../../assets/home.png";
import logo from "../../assets/logo.png";

const EMAIL_REGEX =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

      localStorage.setItem("accessToken", accessToken);
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
      <div className="relative z-10 w-full max-w-7xl flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-8 lg:gap-20 my-auto">
        {/* Login Card */}
        <div className="w-full max-w-[430px] bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-orange-100 p-7 sm:p-12 flex flex-col items-center">
          {/* Official LTS Logo Header */}
          <div className="flex items-center justify-center mb-8 cursor-pointer group hover:scale-105 transition-transform">
            <img
              src={logo}
              alt="DBMS"
              className="h-12 sm:h-20 w-auto object-contain"
            />
          </div>
          <div className="w-full text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-1 tracking-tight">
              Super Admin Login
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm font-medium mb-6">
              Sign in to DBMS Super Admin Management Suite
            </p>

            {noticeMessage && (
              <div className="mb-5 flex items-center gap-2 p-3 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-xl text-left shadow-2xs">
                <AlertCircle size={18} className="text-[#f26522] shrink-0" />
                <span>{noticeMessage}</span>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              noValidate
              className="w-full space-y-4 text-left"
            >
              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${emailError ? "text-rose-400" : "text-slate-400"}`}
                  />
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={handleEmailBlur}
                    className={`w-full pl-10 pr-4 py-4 text-xs sm:text-sm bg-slate-50 border rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none transition-all font-medium ${
                      emailError
                        ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                        : "border-slate-200 focus:border-[#f26522] focus:ring-2 focus:ring-[#f26522]/20"
                    }`}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${passwordError ? "text-rose-400" : "text-slate-400"}`}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={handlePasswordChange}
                    className={`w-full pl-10 pr-11 py-4 text-xs sm:text-sm bg-slate-50 border rounded-xl text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none transition-all font-medium ${
                      passwordError
                        ? "border-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                        : "border-slate-200 focus:border-[#f26522] focus:ring-2 focus:ring-[#f26522]/20"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
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

                <button
                  type="button"
                  className="text-xs font-bold text-[#f26522] hover:text-[#e05411] hover:underline cursor-pointer"
                  onClick={() =>
                    setNoticeMessage("Forgot password is not connected yet.")
                  }
                >
                  Forgot password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#f26522] to-[#e05411] hover:from-[#e05411] hover:to-[#c84302] text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2 text-sm"
              >
                <>
                  <span>
                    {isLoading ? "Signing in..." : "Sign In to DBMS Suite"}
                  </span>
                  {!isLoading && <ArrowRight size={16} />}
                </>
              </button>
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
          <div className="mt-4 bg-white/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl border border-orange-100 flex items-center gap-3.5">
            <ShieldCheck size={24} className="text-[#f26522] shrink-0" />
            <div className="text-left">
              <div className="text-sm font-bold text-slate-800">
                DBMS Verified Enterprise Portal
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">
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
