import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:5000/api";

function ForgotPassword() {
  const navigate = useNavigate();

  const [studentId, setStudentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStudentIdChange = (event) => {
    const value = event.target.value
      .replace(/\D/g, "")
      .slice(0, 10);

    setStudentId(value);

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!/^\d{10}$/.test(studentId)) {
      setError("Please enter your 10-digit college ID.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studentId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Unable to send password reset OTP."
        );
      }

      navigate(
        `/reset-password?studentId=${encodeURIComponent(
          studentId
        )}`,
        {
          state: {
            studentId,
            email:
              data.email ||
              `${studentId}@kluniversity.in`,
          },
        }
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to send password reset OTP."
      );
    } finally {
      setLoading(false);
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
              Account recovery
            </p>

            <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight xl:text-6xl">
              Get back into
              <br />
              <span className="text-blue-400">
                your campus.
              </span>
            </h1>

            <p className="mt-7 max-w-lg text-base leading-7 text-slate-400">
              Forgot your password? No problem. Verify
              your college identity and securely create a
              new password.
            </p>

            <div className="mt-10 space-y-4">

              <div className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-blue-400" />
                Secure OTP verification
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-blue-400" />
                Reset your password securely
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-blue-400" />
                Return to your campus dashboard
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
              to="/login"
              className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>

            <div className="mb-8">

              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Mail className="h-6 w-6" />
              </div>

              <p className="mb-2 text-sm font-semibold text-blue-600">
                PASSWORD RECOVERY
              </p>

              <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Forgot your password?
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Enter your college ID and we&apos;ll send a
                verification OTP to your official college
                email.
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

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >

              <div>
                <label
                  htmlFor="studentId"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  College ID
                </label>

                <input
                  id="studentId"
                  type="text"
                  inputMode="numeric"
                  autoComplete="username"
                  maxLength={10}
                  value={studentId}
                  onChange={handleStudentIdChange}
                  placeholder="Enter your 10-digit college ID"
                  className="h-13 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm tracking-wide outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  disabled={loading}
                />

                <p className="mt-2 text-xs text-slate-400">
                  We&apos;ll use your college ID to locate your
                  student account.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Send verification code
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>

            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-xs text-slate-400">
                SECURE RECOVERY
              </span>

              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="text-center text-sm text-slate-500">
              Remember your password?{" "}
              <Link
                to="/login"
                className="font-semibold text-blue-600 transition hover:text-blue-700"
              >
                Sign in
              </Link>
            </div>

            <p className="mt-8 flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Password recovery is protected by OTP
              verification.
            </p>

          </div>
        </section>
      </div>
    </main>
  );
}

export default ForgotPassword;