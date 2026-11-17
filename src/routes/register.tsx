import { useMemo, useState, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, Check, Circle, Loader2 } from "lucide-react";

import { AuthHeader, AuthShell, GoogleAuthButton, PasswordInput, SegmentedAuthNav } from "@/components/auth/AuthShared";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "workrail — Create your account" },
      { name: "description", content: "Get started with your own workrail workspace and manage your projects in one place." },
    ],
  }),
  component: RegisterPage,
});

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function RegisterPage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState<{ first?: boolean; last?: boolean; email?: boolean; password?: boolean }>({});
  const [formError, setFormError] = useState("");
  const [legalNotice, setLegalNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const passwordRules = useMemo(
    () => [
      { id: "len", label: "At least 8 characters", met: password.length >= 8 },
      { id: "upper", label: "At least one uppercase letter", met: /[A-Z]/.test(password) },
      { id: "lower", label: "At least one lowercase letter", met: /[a-z]/.test(password) },
      { id: "num", label: "At least one number", met: /[0-9]/.test(password) },
    ],
    [password],
  );

  const firstError = touched.first && !firstName.trim() ? "First name is required." : "";
  const lastError = touched.last && !lastName.trim() ? "Last name is required." : "";
  const emailError =
    touched.email && !email.trim()
      ? "Email address is required."
      : touched.email && !isValidEmail(email)
        ? "Enter a valid email address."
        : "";
  const allRulesMet = passwordRules.every((rule) => rule.met);
  const passwordError = touched.password && !allRulesMet ? "Meet all password requirements below." : "";

  const isFormValid =
    firstName.trim().length > 0 && lastName.trim().length > 0 && isValidEmail(email) && allRulesMet;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (submitting || googleLoading) return;
    setTouched({ first: true, last: true, email: true, password: true });
    setFormError("");
    if (!isFormValid) return;

    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      void navigate({ to: "/" });
    }, 550);
  };

  const handleGoogleSignUp = () => {
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
      <AuthHeader
        heading="Create your account"
        description="Get started with your own workspace and manage your projects in one place."
        headingId="register-heading"
      />
      <SegmentedAuthNav active="register" />

      <form className="auth-v2-form" onSubmit={handleSubmit} noValidate>
        {formError && (
          <div className="auth-v2-banner-error" role="alert">
            <AlertCircle size={15} /> {formError}
          </div>
        )}

        <div className="auth-v2-section">
          <h2 className="auth-v2-section-title">Personal information</h2>

          <div className="auth-v2-name-grid">
            <div className="auth-v2-field">
              <label htmlFor="reg-first-name">First name</label>
              <input
                id="reg-first-name"
                className={`auth-v2-input ${firstError ? "has-error" : ""}`}
                type="text"
                autoComplete="given-name"
                placeholder="First name"
                value={firstName}
                disabled={submitting || googleLoading}
                aria-invalid={Boolean(firstError)}
                aria-describedby={firstError ? "reg-first-error" : undefined}
                onBlur={() => setTouched((prev) => ({ ...prev, first: true }))}
                onChange={(event) => setFirstName(event.target.value)}
              />
              {firstError && (
                <p id="reg-first-error" className="auth-v2-error" role="alert">
                  <AlertCircle size={13} /> {firstError}
                </p>
              )}
            </div>

            <div className="auth-v2-field">
              <label htmlFor="reg-last-name">Last name</label>
              <input
                id="reg-last-name"
                className={`auth-v2-input ${lastError ? "has-error" : ""}`}
                type="text"
                autoComplete="family-name"
                placeholder="Last name"
                value={lastName}
                disabled={submitting || googleLoading}
                aria-invalid={Boolean(lastError)}
                aria-describedby={lastError ? "reg-last-error" : undefined}
                onBlur={() => setTouched((prev) => ({ ...prev, last: true }))}
                onChange={(event) => setLastName(event.target.value)}
              />
              {lastError && (
                <p id="reg-last-error" className="auth-v2-error" role="alert">
                  <AlertCircle size={13} /> {lastError}
                </p>
              )}
            </div>
          </div>

          <div className="auth-v2-field">
            <label htmlFor="reg-email">Email address</label>
            <input
              id="reg-email"
              className={`auth-v2-input ${emailError ? "has-error" : ""}`}
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              disabled={submitting || googleLoading}
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? "reg-email-error" : undefined}
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              onChange={(event) => setEmail(event.target.value)}
            />
            {emailError && (
              <p id="reg-email-error" className="auth-v2-error" role="alert">
                <AlertCircle size={13} /> {emailError}
              </p>
            )}
          </div>

          <PasswordInput
            id="reg-password"
            label="Password"
            placeholder="Create a password"
            autoComplete="new-password"
            value={password}
            error={passwordError}
            disabled={submitting || googleLoading}
            onChange={(next) => {
              setPassword(next);
              if (!touched.password) setTouched((prev) => ({ ...prev, password: true }));
            }}
          />

          {(password.length > 0 || touched.password) && !allRulesMet && (
            <ul className="auth-v2-rules" aria-label="Password requirements">
              {passwordRules.map((rule) => (
                <li key={rule.id} className={rule.met ? "is-met" : ""}>
                  {rule.met ? <Check size={13} /> : <Circle size={11} />}
                  <span>{rule.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button type="submit" className="auth-v2-primary-btn" disabled={!isFormValid || submitting || googleLoading}>
          {submitting && <Loader2 size={16} className="auth-v2-spin" />}
          <span>{submitting ? "Creating account..." : "Create account"}</span>
        </button>
      </form>

      <GoogleAuthButton label="Sign up with Google" loading={googleLoading} disabled={submitting} onClick={handleGoogleSignUp} />

      <p className="auth-v2-footer-link">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>

      <p className="auth-v2-legal">
        By creating an account, you agree to our{" "}
        <button type="button" onClick={() => setLegalNotice("Terms of Service: Demo workspace prototype.")}>
          Terms of Service
        </button>{" "}
        and{" "}
        <button type="button" onClick={() => setLegalNotice("Privacy Policy: Local state only; no external data is stored.")}>
          Privacy Policy
        </button>
        .
      </p>
      {legalNotice && (
        <p className="auth-v2-legal-note" role="status">
          {legalNotice}
        </p>
      )}
    </AuthShell>
  );
}
