import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, Loader2 } from "lucide-react";

import { useWorkspaceStore } from "@/lib/workspace-store";
import { useI18n } from "@/lib/i18n";
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
  const { isAuthenticated, isAuthReady, login } = useWorkspaceStore();
  const { language, t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (isAuthReady && isAuthenticated) {
      const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const redirectPath = params?.get("redirect") || "/";
      void navigate({ to: redirectPath });
    }
  }, [isAuthReady, isAuthenticated, navigate]);

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
      login(email);
      const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const redirectPath = params?.get("redirect") || "/";
      void navigate({ to: redirectPath });
    }, 550);
  };

  const handleGoogleSignIn = () => {
    if (submitting || googleLoading) return;
    setFormError("");
    setGoogleLoading(true);
    window.setTimeout(() => {
      setGoogleLoading(false);
      login("kittitee@northstar.studio", "Kittitee Sitthisom");
      const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const redirectPath = params?.get("redirect") || "/";
      void navigate({ to: redirectPath });
    }, 550);
  };

  return (
    <AuthShell>
      <AuthHeader heading={t.auth.welcomeBack} description={t.auth.signInDesc} headingId="login-heading" />
      <SegmentedAuthNav active="login" />

      <form className="auth-v2-form" onSubmit={handleSubmit} noValidate>
        {formError && (
          <div className="auth-v2-banner-error" role="alert">
            <AlertCircle size={15} /> {formError}
          </div>
        )}

        <div className="auth-v2-field">
          <label htmlFor="login-email">{t.auth.email}</label>
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
          label={t.auth.password}
          placeholder={language === "th" ? "กรอกรหัสผ่านของคุณ" : "Enter your password"}
          autoComplete="current-password"
          value={password}
          error={passwordError}
          disabled={submitting || googleLoading}
          rightAction={
            <Link to="/forgot-password" className="auth-v2-link">
              {t.auth.forgotPassword}
            </Link>
          }
          onChange={(next) => {
            setPassword(next);
            if (passwordError) setPasswordError("");
          }}
        />

        <label className="auth-v2-remember">
          <input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} />
          <span>{t.auth.rememberMe}</span>
        </label>

        <button type="submit" className="auth-v2-primary-btn" disabled={submitting || googleLoading}>
          {submitting && <Loader2 size={16} className="auth-v2-spin" />}
          <span>{submitting ? (language === "th" ? "กำลังเข้าสู่ระบบ..." : "Signing in...") : t.auth.login}</span>
        </button>
      </form>

      <GoogleAuthButton label={t.auth.googleSignIn} loading={googleLoading} disabled={submitting} onClick={handleGoogleSignIn} />

      <p className="auth-v2-footer-link">
        {t.auth.noAccount} <Link to="/register">{t.auth.createAccount}</Link>
      </p>
    </AuthShell>
  );
}
