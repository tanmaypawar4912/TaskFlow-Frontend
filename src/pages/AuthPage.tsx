import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import Logo from "../components/Logo";
import GoogleLoginButton from "../components/GoogleLoginButton";
import { useAuth } from "../context/AuthContext";

interface AuthPageProps {
  mode: "login" | "register";
}

interface LocationState {
  from?: string;
}

export default function AuthPage({
  mode,
}: AuthPageProps) {
  const loginMode = mode === "login";

  const { login, register } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [busy, setBusy] = useState(false);

  const [error, setError] = useState("");

  const locationState =
    location.state as LocationState | null;

  const next =
    locationState?.from || "/dashboard";

  const updateField = (
    field: keyof typeof form,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const validateForm = (): boolean => {
    const email = form.email.trim();
    const password = form.password;

    if (!email || !password) {
      setError(
        "Email and password are required."
      );
      return false;
    }

    if (!loginMode && form.name.trim().length < 2) {
      setError("Please enter your full name.");
      return false;
    }

    if (!loginMode && form.confirm !== password) {
      setError("Passwords do not match.");
      return false;
    }

    if (password.length < 8) {
      setError(
        "Use at least 8 characters for your password."
      );
      return false;
    }

    return true;
  };

  const submit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    setError("");

    if (!validateForm()) {
      return;
    }

    setBusy(true);

    try {
      if (loginMode) {
        await login({
          email: form.email.trim(),
          password: form.password,
        });
      } else {
        await register({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
        });
      }

      navigate(next, {
        replace: true,
      });
    } catch (submitError: unknown) {
      if (submitError instanceof Error) {
        setError(submitError.message);
      } else {
        setError(
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-shell">
      {/* LEFT VISUAL */}
      <div className="auth-visual">
        <div className="orb orb-a" />
        <div className="orb orb-b" />

        <div className="auth-visual-inner">
          <Logo />

          <div className="visual-copy">
            <p className="eyebrow">
              A CALMER WAY TO WORK
            </p>

            <h1>
              Turn intentions into finished work.
            </h1>

            <p>
              Organize priorities, protect focus and
              keep the next action obvious.
            </p>
          </div>

          <div className="mini-system">
            <div>
              <span className="mini-check">✓</span>

              <div>
                <strong>
                  Launch portfolio
                </strong>

                <small>
                  High priority · Today
                </small>
              </div>
            </div>

            <div>
              <span className="mini-line" />

              <div>
                <strong>
                  Client presentation
                </strong>

                <small>
                  In progress · 4:30 PM
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AUTH PANEL */}
      <div className="auth-panel">
        <div className="auth-card">
          {/* MOBILE LOGO */}
          <div className="auth-mobile-logo">
            <Logo />
          </div>

          {/* HEADING */}
          <div className="auth-heading">
            <span className="eyebrow">
              {loginMode
                ? "WELCOME BACK"
                : "GET STARTED"}
            </span>

            <h2>
              {loginMode
                ? "Back to focus."
                : "Build your rhythm."}
            </h2>

            <p>
              {loginMode
                ? "Sign in to continue your workspace."
                : "Create your workspace and make your next move clear."}
            </p>
          </div>

          {/* FORM */}
          <form
            onSubmit={submit}
            className="auth-form"
            noValidate
          >
            {/* NAME */}
            {!loginMode && (
              <label>
                Full name

                <input
                  value={form.name}
                  onChange={(event) =>
                    updateField(
                      "name",
                      event.target.value
                    )
                  }
                  placeholder="Your name"
                  autoComplete="name"
                  disabled={busy}
                />
              </label>
            )}

            {/* EMAIL */}
            <label>
              Email

              <input
                value={form.email}
                onChange={(event) =>
                  updateField(
                    "email",
                    event.target.value
                  )
                }
                placeholder="you@example.com"
                type="email"
                autoComplete="email"
                disabled={busy}
              />
            </label>

            {/* PASSWORD */}
            <label>
              Password

              <div className="password-wrap">
                <input
                  value={form.password}
                  onChange={(event) =>
                    updateField(
                      "password",
                      event.target.value
                    )
                  }
                  placeholder="Minimum 8 characters"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete={
                    loginMode
                      ? "current-password"
                      : "new-password"
                  }
                  disabled={busy}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (previous) => !previous
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  disabled={busy}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </label>

            {/* CONFIRM PASSWORD */}
            {!loginMode && (
              <label>
                Confirm password

                <div className="password-wrap">
                  <input
                    value={form.confirm}
                    onChange={(event) =>
                      updateField(
                        "confirm",
                        event.target.value
                      )
                    }
                    placeholder="Repeat password"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    disabled={busy}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        (previous) => !previous
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirmation password"
                        : "Show confirmation password"
                    }
                    disabled={busy}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </label>
            )}

            {/* LOGIN OPTIONS */}
            {loginMode && (
              <div className="auth-row">
                <label className="check-row">
                  <input
                    type="checkbox"
                    disabled={busy}
                  />

                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  className="text-btn"
                  onClick={() =>
                    setError(
                      "Password recovery can be enabled with the backend email workflow."
                    )
                  }
                  disabled={busy}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* ERROR */}
            {error && (
              <div
                className="form-error"
                role="alert"
                aria-live="polite"
              >
                <ShieldCheck size={16} />

                <span>{error}</span>
              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              className="btn primary wide"
              disabled={busy}
            >
              {busy
                ? "Working…"
                : loginMode
                  ? "Sign in"
                  : "Create account"}

              <ArrowRight size={17} />
            </button>
          </form>

          {/* DIVIDER */}
          <div className="divider">
            <span>or continue with</span>
          </div>

          {/* GOOGLE */}
          <GoogleLoginButton />

          {/* AUTH SWITCH */}
          <p className="auth-switch">
            {loginMode ? (
              <>
                New to TaskFlow?{" "}
                <Link to="/register">
                  Create an account
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link to="/login">
                  Sign in
                </Link>
              </>
            )}
          </p>

          {/* TRUST */}
          <div className="trust-row">
            <span>
              <CheckCircle2 size={15} />
              Secure session
            </span>

            <span>
              <ShieldCheck size={15} />
              Your tasks stay private
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}