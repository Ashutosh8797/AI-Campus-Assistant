import {
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();

  const {
    login,
    loading,
    isAuthenticated,
  } = useAuth();

  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!studentId.trim()) {
      setError("College ID is required.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    try {
      await login(
        studentId.trim(),
        password
      );

      navigate("/", {
        replace: true,
      });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Unable to login. Please try again.";

      setError(message);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background-orb auth-orb-one" />
      <div className="auth-background-orb auth-orb-two" />

      <div className="auth-layout">
        {/* Left visual panel */}
        <section className="auth-visual">
          <div className="auth-brand">
            <div className="auth-brand-icon">
              <GraduationCap size={25} />
            </div>

            <div>
              <strong>KL</strong>
              <span>AI CAMPUS ASSISTANT</span>
            </div>
          </div>

          <div className="auth-visual-content">
            <div className="auth-eyebrow">
              <Sparkles size={14} />
              INTELLIGENT CAMPUS EXPERIENCE
            </div>

            <h1>
              Your campus.
              <br />
              <span>One intelligent place.</span>
            </h1>

            <p>
              Access campus knowledge, AI assistance,
              services, safety, maintenance and more
              from one secure platform.
            </p>

            <div className="auth-feature-list">
              <div>
                <ShieldCheck size={17} />
                <span>Verified campus information</span>
              </div>

              <div>
                <Sparkles size={17} />
                <span>AI-powered campus assistance</span>
              </div>

              <div>
                <GraduationCap size={17} />
                <span>Built for KL Vijayawada students</span>
              </div>
            </div>
          </div>

          <div className="auth-visual-footer">
            <span>KL VIJAYAWADA</span>
            <span>•</span>
            <span>SECURE CAMPUS ACCESS</span>
          </div>
        </section>

        {/* Login panel */}
        <section className="auth-form-section">
          <div className="auth-form-container">
            <div className="mobile-auth-brand">
              <div className="auth-brand-icon">
                <GraduationCap size={23} />
              </div>

              <div>
                <strong>KL</strong>
                <span>AI CAMPUS ASSISTANT</span>
              </div>
            </div>

            <div className="auth-heading">
              <div className="auth-mini-icon">
                <LockKeyhole size={18} />
              </div>

              <p className="auth-kicker">
                WELCOME BACK
              </p>

              <h2>Sign in to your campus</h2>

              <p>
                Use your college ID and password to
                continue.
              </p>
            </div>

            <form
              className="login-form"
              onSubmit={handleSubmit}
            >
              {error && (
                <div className="auth-error">
                  <span>!</span>
                  {error}
                </div>
              )}

              <div className="form-field">
                <label htmlFor="studentId">
                  College ID
                </label>

                <div className="form-input">
                  <UserRound size={17} />

                  <input
                    id="studentId"
                    type="text"
                    value={studentId}
                    onChange={(event) =>
                      setStudentId(event.target.value)
                    }
                    placeholder="Enter your college ID"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="form-field">
                <div className="field-label-row">
                  <label htmlFor="password">
                    Password
                  </label>

                  <Link to="/forgot-password">
                    Forgot password?
                  </Link>
                </div>

                <div className="form-input">
                  <LockKeyhole size={17} />

                  <input
                    id="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (value) => !value
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </div>

              <button
                className="login-button"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="button-spinner" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span />
              <p>NEW TO THE CAMPUS ASSISTANT?</p>
              <span />
            </div>

            <Link
              to="/register"
              className="register-button"
            >
              Create your student account
              <ArrowRight size={16} />
            </Link>

            <p className="auth-security-note">
              <ShieldCheck size={14} />
              Your campus account is protected with
              secure authentication.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;