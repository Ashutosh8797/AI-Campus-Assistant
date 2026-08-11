import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  resendVerificationOtp,
  verifyOtp,
} from "../services/api";

const VerifyOtp = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  /*
   * Supports both:
   *
   * 1. Register → Verify OTP
   *    using React Router state
   *
   * 2. Direct URL:
   *    /verify-otp?studentId=2400032422
   */

  const routerState = location.state || {};

  const urlStudentId = searchParams.get("studentId");

  const resolvedStudentId =
    routerState.studentId || urlStudentId || "";

  const resolvedEmail =
    routerState.email ||
    (resolvedStudentId
      ? `${resolvedStudentId}@kluniversity.in`
      : "");

  const [studentId] = useState(resolvedStudentId);
  const [email] = useState(resolvedEmail);

  const [otp, setOtp] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [resendCooldown, setResendCooldown] =
    useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) {
      return undefined;
    }

    const timer = setInterval(() => {
      setResendCooldown((value) =>
        value > 0 ? value - 1 : 0
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  /*
   * If there is no student ID at all,
   * send the user back to registration.
   */
  if (!studentId) {
    return <Navigate to="/register" replace />;
  }

  const handleOtpChange = (event) => {
    const value = event.target.value
      .replace(/\D/g, "")
      .slice(0, 6);

    setOtp(value);

    if (error) {
      setError("");
    }
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);

    if (error) {
      setError("");
    }
  };

  const getPasswordStrength = () => {
    if (!password) {
      return {
        label: "",
        width: "0%",
      };
    }

    let score = 0;

    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 2) {
      return {
        label: "Weak",
        width: "35%",
      };
    }

    if (score <= 4) {
      return {
        label: "Good",
        width: "70%",
      };
    }

    return {
      label: "Strong",
      width: "100%",
    };
  };

  const passwordStrength =
    getPasswordStrength();

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters long."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const result = await verifyOtp({
        studentId,
        otp,
        password,
      });

      if (!result.success) {
        throw new Error(
          result.message ||
            "Unable to verify your account."
        );
      }

      setSuccess(
        result.message ||
          "Account verified successfully."
      );

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            message:
              "Account verified successfully. You can now sign in.",
            studentId,
          },
        });
      }, 1000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to verify your account."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) {
      return;
    }

    setError("");
    setSuccess("");
    setResending(true);

    try {
      const result =
        await resendVerificationOtp({
          studentId,
        });

      if (!result.success) {
        throw new Error(
          result.message ||
            "Unable to resend the OTP."
        );
      }

      setSuccess(
        result.message ||
          "A new OTP has been sent to your college email."
      );

      setResendCooldown(60);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to resend the OTP."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">

        {/* LEFT PANEL */}
        <section className="relative hidden overflow-hidden bg-slate-950 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">

          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="absolute -bottom-40 -right-20 h-[28rem] w-[28rem] rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sm font-black text-slate-950">
              KL
            </div>

            <div>
              <p className="text-sm font-semibold tracking-wide">
                KL UNIVERSITY
              </p>

              <p className="text-xs text-slate-400">
                Vijayawada Campus
              </p>
            </div>
          </div>

          <div className="relative z-10 max-w-xl">

            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <ShieldCheck className="h-7 w-7 text-blue-400" />
            </div>

            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
              Secure verification
            </p>

            <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight xl:text-6xl">
              Verify your
              <br />
              <span className="text-blue-400">
                campus identity.
              </span>
            </h1>

            <p className="mt-7 max-w-lg text-base leading-7 text-slate-400">
              One final step before your account is
              activated. Your verification code is sent
              to your official college email.
            </p>

            <div className="mt-10 space-y-4">

              <div className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-blue-400" />
                Verify your official college account
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-blue-400" />
                Create your secure password
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-blue-400" />
                Start using AI Campus Assistant
              </div>

            </div>
          </div>

          <p className="relative z-10 text-xs text-slate-500">
            Secure student authentication
          </p>
        </section>

        {/* RIGHT PANEL */}
        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">

          <div className="w-full max-w-md">

            <Link
              to={`/register`}
              className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to registration
            </Link>

            <div className="mb-8">

              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Mail className="h-6 w-6" />
              </div>

              <p className="mb-2 text-sm font-semibold text-blue-600">
                VERIFY YOUR EMAIL
              </p>

              <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Check your inbox
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                We sent a 6-digit verification code to:
              </p>

              <p className="mt-1 break-all text-sm font-semibold text-slate-900">
                {email}
              </p>

            </div>

            {error && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >

              {/* OTP */}
              <div>

                <label
                  htmlFor="otp"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Verification code
                </label>

                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={handleOtpChange}
                  placeholder="000000"
                  className="h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-center text-xl font-semibold tracking-[0.45em] outline-none transition placeholder:text-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  disabled={loading}
                />

              </div>

              {/* PASSWORD */}
              <div>

                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Create password
                </label>

                <div className="relative">

                  <KeyRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Create a secure password"
                    autoComplete="new-password"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-11 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    disabled={loading}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (value) => !value
                      )
                    }
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>

                </div>

                {password && (
                  <div className="mt-3">

                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        Password strength
                      </span>

                      <span className="text-xs font-medium text-slate-600">
                        {passwordStrength.label}
                      </span>
                    </div>

                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all"
                        style={{
                          width:
                            passwordStrength.width,
                        }}
                      />
                    </div>

                  </div>
                )}

                <p className="mt-2 text-xs text-slate-400">
                  Use at least 8 characters with a mix of
                  letters, numbers and symbols.
                </p>

              </div>

              {/* CONFIRM PASSWORD */}
              <div>

                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Confirm password
                </label>

                <div className="relative">

                  <KeyRound className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="confirmPassword"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    placeholder="Enter your password again"
                    autoComplete="new-password"
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-11 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    disabled={loading}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (value) => !value
                      )
                    }
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    aria-label={
                      showConfirmPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>

                </div>

              </div>

              <button
                type="submit"
                disabled={loading}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Verifying account...
                  </>
                ) : (
                  <>
                    Verify & create account
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>

            </form>

            {/* RESEND */}
            <div className="mt-7 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">

              <div>
                <p className="text-xs font-medium text-slate-700">
                  Didn&apos;t receive the code?
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Check spam or request a new OTP.
                </p>
              </div>

              <button
                type="button"
                onClick={handleResend}
                disabled={
                  resending ||
                  resendCooldown > 0
                }
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 transition hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >

                <RefreshCw
                  className={`h-3.5 w-3.5 ${
                    resending
                      ? "animate-spin"
                      : ""
                  }`}
                />

                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : "Resend OTP"}

              </button>

            </div>

            <p className="mt-7 flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Your account information is securely protected.
            </p>

          </div>
        </section>
      </div>
    </main>
  );
};

export default VerifyOtp;