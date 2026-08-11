import { useState } from "react";
import { ArrowRight, CheckCircle2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    studentId: "",
    department: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const name = form.name.trim();
    const studentId = form.studentId.trim();
    const department = form.department.trim();

    if (!name || !studentId || !department) {
      setError("Please complete all required fields.");
      return;
    }

    if (!/^\d{10}$/.test(studentId)) {
      setError("College ID must contain exactly 10 digits.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          studentId,
          department,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Registration failed.");
      }

      navigate("/verify-otp", {
        state: {
          studentId,
          email: data.email || `${studentId}@kluniversity.in`,
          userId: data.userId,
        },
      });
    } catch (err) {
      setError(err.message || "Unable to create your account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        {/* Brand panel */}
        <section className="relative hidden overflow-hidden bg-slate-950 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
          <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-40 -right-20 h-[28rem] w-[28rem] rounded-full bg-indigo-500/20 blur-3xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sm font-black text-slate-950 shadow-lg">
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
          </div>

          <div className="relative z-10 max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300 backdrop-blur">
              <ShieldCheck className="h-4 w-4" />
              Secure campus access
            </div>

            <h1 className="text-5xl font-semibold leading-[1.05] tracking-tight xl:text-6xl">
              One account.
              <br />
              <span className="text-blue-400">Your whole campus.</span>
            </h1>

            <p className="mt-7 max-w-lg text-base leading-7 text-slate-400">
              Create your student account and access campus knowledge,
              maintenance, safety, lost & found, services, and your AI
              campus assistant from one place.
            </p>

            <div className="mt-10 grid gap-3">
              {[
                "AI-powered campus assistance",
                "Maintenance & safety reporting",
                "Lost & found and student services",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm text-slate-300"
                >
                  <CheckCircle2 className="h-4 w-4 text-blue-400" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 text-xs text-slate-500">
            © {new Date().getFullYear()} KL University • Campus Assistant
          </div>
        </section>

        {/* Form panel */}
        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            {/* Mobile branding */}
            <div className="mb-10 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white">
                KL
              </div>

              <div>
                <p className="text-sm font-bold tracking-wide">
                  KL UNIVERSITY
                </p>
                <p className="text-xs text-slate-500">
                  Vijayawada Campus
                </p>
              </div>
            </div>

            <div className="mb-8">
              <p className="mb-3 text-sm font-semibold text-blue-600">
                STUDENT REGISTRATION
              </p>

              <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Create your account
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Use your official college ID. We&apos;ll send a verification
                code to your college email.
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

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Full name
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  disabled={loading}
                />
              </div>

              <div>
                <label
                  htmlFor="studentId"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  College ID
                </label>

                <input
                  id="studentId"
                  name="studentId"
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  autoComplete="username"
                  value={form.studentId}
                  onChange={(event) => {
                    const value = event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);

                    setForm((previous) => ({
                      ...previous,
                      studentId: value,
                    }));

                    if (error) {
                      setError("");
                    }
                  }}
                  placeholder="Enter your 10-digit college ID"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm tracking-wide outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  disabled={loading}
                />

                <p className="mt-2 text-xs text-slate-400">
                  Your college email will be generated automatically.
                </p>
              </div>

              <div>
                <label
                  htmlFor="department"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Department
                </label>

                <select
                  id="department"
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  disabled={loading}
                >
                  <option value="">Select your department</option>
                  <option value="CSE">Computer Science & Engineering</option>
                  <option value="ECE">
                    Electronics & Communication Engineering
                  </option>
                  <option value="EEE">
                    Electrical & Electronics Engineering
                  </option>
                  <option value="ME">Mechanical Engineering</option>
                  <option value="CE">Civil Engineering</option>
                  <option value="IT">Information Technology</option>
                  <option value="AI&DS">AI & Data Science</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400">SECURE ACCESS</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <span>Already have an account?</span>

              <Link
                to="/login"
                className="font-semibold text-blue-600 transition hover:text-blue-700"
              >
                Sign in
              </Link>
            </div>

            <p className="mt-8 text-center text-xs leading-5 text-slate-400">
              By creating an account, you&apos;ll receive a verification OTP
              at your official college email address.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Register;