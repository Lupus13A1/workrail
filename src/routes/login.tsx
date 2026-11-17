import { useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, Loader2 } from "lucide-react";

import { AuthHeader, AuthShell, GoogleAuthButton, PasswordInput, SegmentedAuthNav } from "@/components/auth/AuthShared";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "workrail — Sign in" },
      { name: "description", content: "Sign in to continue to your workrail workspace." },
    ],
  }),
  component: LoginPage,
});

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (submitting || googleLoading) return;

    let hasError = false;
    setFormError("");
    if (!email.trim()) {
      setEmailError("Email address is required.");
      hasError = true;
    } else if (!isValidEmail(email)) {
      setEmailError("Enter a valid email address.");
      hasError = true;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Password is required.");
      hasError = true;
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      hasError = true;
    } else {
      setPasswordError("");
    }

    if (hasError) return;

    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      void navigate({ to: "/" });
    }, 550);
  };

  const handleGoogleSignIn = () => {
    if (submitting || googleLoading) return;
    setFormError("");
    setGoogleLoading(true);
    window.setTimeout(() => {
      setGoogleLoading(false);
      void navigate({ to: "/" });
    }, 550);
  };

  return (
    <AuthShell>
      <AuthHeader heading="Welcome back" description="Sign in to continue to your workspace." headingId="login-heading" />
      <SegmentedAuthNav active="login" />

      <form className="auth-v2-form" onSubmit={handleSubmit} noValidate>
        {formError && (
          <div className="auth-v2-banner-error" role="alert">
            <AlertCircle size={15} /> {formError}
          </div>
        )}

        <div className="auth-v2-field">
          <label htmlFor="login-email">Email address</label>
          <input
            id="login-email"
            className={`auth-v2-input ${emailError ? "has-error" : ""}`}
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            disabled={submitting || googleLoading}
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? "login-email-error" : undefined}
            onChange={(event) => {
              setEmail(event.target.value);
              if (emailError) setEmailError("");
            }}
          />
          {emailError && (
            <p id="login-email-error" className="auth-v2-error" role="alert">
              <AlertCircle size={13} /> {emailError}
            </p>
          )}
        </div>

        <PasswordInput
          id="login-password"
          label="Password"
          placeholder="Enter your password"
          autoComplete="current-password"
          value={password}
          error={passwordError}
          disabled={submitting || googleLoading}
          rightAction={
            <Link to="/forgot-password" className="auth-v2-link">
              Forgot password?
            </Link>
          }
          onChange={(next) => {
            setPassword(next);
            if (passwordError) setPasswordError("");
          }}
        />

        <label className="auth-v2-remember">
          <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
          <span>Remember me</span>
        </label>

        <button type="submit" className="auth-v2-primary-btn" disabled={submitting || googleLoading}>
          {submitting && <Loader2 size={16} className="auth-v2-spin" />}
          <span>{submitting ? "Signing in..." : "Sign in"}</span>
        </button>
      </form>

      <GoogleAuthButton label="Continue with Google" loading={googleLoading} disabled={submitting} onClick={handleGoogleSignIn} />

      <p className="auth-v2-footer-link">
        Don't have an account? <Link to="/register">Create account</Link>
      </p>
    </AuthShell>
  );
}
